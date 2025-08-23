const { Kafka } = require('kafkajs');
const { Client } = require('@elastic/elasticsearch');
require('dotenv').config();

const kafka = new Kafka({
  clientId: 'arcsphere-consumer',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
});

const consumer = kafka.consumer({ groupId: 'arcsphere-analytics-group' });

const elasticsearch = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
  auth: {
    username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
    password: process.env.ELASTICSEARCH_PASSWORD || 'changeme'
  }
});

class KafkaConsumer {
  constructor() {
    this.isRunning = false;
  }

  async connect() {
    try {
      await consumer.connect();
      console.log('Kafka consumer connected successfully');
    } catch (error) {
      console.error('Failed to connect Kafka consumer:', error);
    }
  }

  async disconnect() {
    try {
      await consumer.disconnect();
      this.isRunning = false;
      console.log('Kafka consumer disconnected');
    } catch (error) {
      console.error('Failed to disconnect Kafka consumer:', error);
    }
  }

  async subscribeToTopics() {
    const topics = ['user-interactions', 'ai-responses', 'system-events'];

    for (const topic of topics) {
      await consumer.subscribe({ topic, fromBeginning: false });
      console.log(`Subscribed to topic: ${topic}`);
    }
  }

  async processMessage(topic, message) {
    try {
      const data = JSON.parse(message.value.toString());

      // Create index name based on topic and date
      const date = new Date().toISOString().split('T')[0];
      const indexName = `arcsphere-${topic}-${date}`;

      // Ensure index exists with proper mapping
      await this.ensureIndex(indexName, topic);

      // Index the document
      await elasticsearch.index({
        index: indexName,
        body: {
          ...data,
          '@timestamp': new Date().toISOString(),
          topic: topic
        }
      });

      console.log(`Processed message from topic ${topic}:`, data.type);
    } catch (error) {
      console.error(`Error processing message from topic ${topic}:`, error);
    }
  }

  async ensureIndex(indexName, topic) {
    try {
      const indexExists = await elasticsearch.indices.exists({ index: indexName });

      if (!indexExists.body) {
        const mapping = this.getMappingForTopic(topic);
        await elasticsearch.indices.create({
          index: indexName,
          body: {
            mappings: mapping
          }
        });
        console.log(`Created index: ${indexName}`);
      }
    } catch (error) {
      console.error(`Error ensuring index ${indexName}:`, error);
    }
  }

  getMappingForTopic(topic) {
    const baseMapping = {
      properties: {
        '@timestamp': { type: 'date' },
        topic: { type: 'keyword' },
        type: { type: 'keyword' },
        source: { type: 'keyword' }
      }
    };

    switch (topic) {
      case 'user-interactions':
        baseMapping.properties.userId = { type: 'keyword' };
        baseMapping.properties.action = { type: 'keyword' };
        baseMapping.properties.userAgent = { type: 'text' };
        baseMapping.properties.ip = { type: 'ip' };
        break;

      case 'ai-responses':
        baseMapping.properties.userId = { type: 'keyword' };
        baseMapping.properties.model = { type: 'keyword' };
        baseMapping.properties.prompt = { type: 'text' };
        baseMapping.properties.response = { type: 'text' };
        baseMapping.properties.responseLength = { type: 'integer' };
        break;

      case 'system-events':
        baseMapping.properties.eventType = { type: 'keyword' };
        break;
    }

    return baseMapping;
  }

  async start() {
    if (this.isRunning) {
      console.log('Consumer is already running');
      return;
    }

    try {
      await this.connect();
      await this.subscribeToTopics();

      await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          await this.processMessage(topic, message);
        }
      });

      this.isRunning = true;
      console.log('Kafka consumer started successfully');
    } catch (error) {
      console.error('Failed to start Kafka consumer:', error);
    }
  }

  async stop() {
    if (!this.isRunning) {
      console.log('Consumer is not running');
      return;
    }

    await this.disconnect();
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down gracefully...');
  const consumerInstance = new KafkaConsumer();
  await consumerInstance.stop();
  process.exit(0);
});

// Start the consumer if this file is run directly
if (require.main === module) {
  const consumerInstance = new KafkaConsumer();
  consumerInstance.start();
}

module.exports = { KafkaConsumer };

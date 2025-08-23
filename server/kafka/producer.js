const { Kafka } = require('kafkajs');
require('dotenv').config();

const kafka = new Kafka({
  clientId: 'arcsphere-producer',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
});

const producer = kafka.producer();

const topics = {
  USER_INTERACTIONS: 'user-interactions',
  AI_RESPONSES: 'ai-responses',
  SYSTEM_EVENTS: 'system-events'
};

class KafkaProducer {
  constructor() {
    this.isConnected = false;
  }

  async connect() {
    try {
      await producer.connect();
      this.isConnected = true;
      console.log('Kafka producer connected successfully');
    } catch (error) {
      console.error('Failed to connect Kafka producer:', error);
    }
  }

  async disconnect() {
    try {
      await producer.disconnect();
      this.isConnected = false;
      console.log('Kafka producer disconnected');
    } catch (error) {
      console.error('Failed to disconnect Kafka producer:', error);
    }
  }

  async sendMessage(topic, message) {
    if (!this.isConnected) {
      console.warn('Kafka producer not connected, attempting to connect...');
      await this.connect();
    }

    try {
      await producer.send({
        topic,
        messages: [
          {
            key: message.id || Date.now().toString(),
            value: JSON.stringify({
              ...message,
              timestamp: new Date().toISOString(),
              source: 'arcsphere'
            })
          }
        ]
      });
      console.log(`Message sent to topic ${topic}:`, message);
    } catch (error) {
      console.error(`Failed to send message to topic ${topic}:`, error);
    }
  }

  // Send user interaction events
  async sendUserInteraction(userId, action, details) {
    await this.sendMessage(topics.USER_INTERACTIONS, {
      type: 'user_interaction',
      userId,
      action,
      details,
      userAgent: details.userAgent,
      ip: details.ip
    });
  }

  // Send AI response events
  async sendAIResponse(userId, model, prompt, response, metadata) {
    await this.sendMessage(topics.AI_RESPONSES, {
      type: 'ai_response',
      userId,
      model,
      prompt,
      response: response.substring(0, 500), // Truncate for storage
      responseLength: response.length,
      metadata
    });
  }

  // Send system events
  async sendSystemEvent(eventType, details) {
    await this.sendMessage(topics.SYSTEM_EVENTS, {
      type: 'system_event',
      eventType,
      details
    });
  }
}

module.exports = { KafkaProducer, topics };

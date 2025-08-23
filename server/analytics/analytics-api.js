const { Client } = require('@elastic/elasticsearch');
const express = require('express');
require('dotenv').config();

const router = express.Router();

const elasticsearch = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
  auth: {
    username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
    password: process.env.ELASTICSEARCH_PASSWORD || 'changeme'
  }
});

// Get analytics data for dashboard
router.get('/analytics', async (req, res) => {
  try {
    const { timeRange = '24h' } = req.query;

    // Calculate time range
    const now = new Date();
    let fromDate;

    switch (timeRange) {
      case '1h':
        fromDate = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '24h':
        fromDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        fromDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    // Get user interactions
    const userInteractions = await getUserInteractions(fromDate, now);

    // Get AI responses
    const aiResponses = await getAIResponses(fromDate, now);

    // Get system events
    const systemEvents = await getSystemEvents(fromDate, now);

    // Calculate summary statistics
    const summary = await calculateSummary(fromDate, now);

    res.json({
      userInteractions,
      aiResponses,
      systemEvents,
      summary
    });

  } catch (error) {
    console.error('Analytics API error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

async function getUserInteractions(fromDate, toDate) {
  try {
    const response = await elasticsearch.search({
      index: 'arcsphere-user-interactions-*',
      body: {
        query: {
          range: {
            '@timestamp': {
              gte: fromDate.toISOString(),
              lte: toDate.toISOString()
            }
          }
        },
        sort: [{ '@timestamp': { order: 'desc' } }],
        size: 50
      }
    });

    return response.body.hits.hits.map(hit => ({
      ...hit._source,
      timestamp: hit._source['@timestamp']
    }));
  } catch (error) {
    console.error('Error fetching user interactions:', error);
    return [];
  }
}

async function getAIResponses(fromDate, toDate) {
  try {
    const response = await elasticsearch.search({
      index: 'arcsphere-ai-responses-*',
      body: {
        query: {
          range: {
            '@timestamp': {
              gte: fromDate.toISOString(),
              lte: toDate.toISOString()
            }
          }
        },
        sort: [{ '@timestamp': { order: 'desc' } }],
        size: 50
      }
    });

    return response.body.hits.hits.map(hit => ({
      ...hit._source,
      timestamp: hit._source['@timestamp']
    }));
  } catch (error) {
    console.error('Error fetching AI responses:', error);
    return [];
  }
}

async function getSystemEvents(fromDate, toDate) {
  try {
    const response = await elasticsearch.search({
      index: 'arcsphere-system-events-*',
      body: {
        query: {
          range: {
            '@timestamp': {
              gte: fromDate.toISOString(),
              lte: toDate.toISOString()
            }
          }
        },
        sort: [{ '@timestamp': { order: 'desc' } }],
        size: 50
      }
    });

    return response.body.hits.hits.map(hit => ({
      ...hit._source,
      timestamp: hit._source['@timestamp']
    }));
  } catch (error) {
    console.error('Error fetching system events:', error);
    return [];
  }
}

async function calculateSummary(fromDate, toDate) {
  try {
    // Get unique users
    const uniqueUsersResponse = await elasticsearch.search({
      index: 'arcsphere-user-interactions-*',
      body: {
        query: {
          range: {
            '@timestamp': {
              gte: fromDate.toISOString(),
              lte: toDate.toISOString()
            }
          }
        },
        aggs: {
          unique_users: {
            cardinality: {
              field: 'userId'
            }
          }
        },
        size: 0
      }
    });

    // Get total interactions
    const totalInteractionsResponse = await elasticsearch.search({
      index: 'arcsphere-user-interactions-*',
      body: {
        query: {
          range: {
            '@timestamp': {
              gte: fromDate.toISOString(),
              lte: toDate.toISOString()
            }
          }
        },
        aggs: {
          total_interactions: {
            value_count: {
              field: '_id'
            }
          }
        },
        size: 0
      }
    });

    // Get total AI requests
    const totalAIRequestsResponse = await elasticsearch.search({
      index: 'arcsphere-ai-responses-*',
      body: {
        query: {
          range: {
            '@timestamp': {
              gte: fromDate.toISOString(),
              lte: toDate.toISOString()
            }
          }
        },
        aggs: {
          total_ai_requests: {
            value_count: {
              field: '_id'
            }
          },
          avg_response_time: {
            avg: {
              field: 'metadata.responseTime'
            }
          }
        },
        size: 0
      }
    });

    return {
      totalUsers: uniqueUsersResponse.body.aggregations.unique_users.value || 0,
      totalInteractions: totalInteractionsResponse.body.aggregations.total_interactions.value || 0,
      totalAIRequests: totalAIRequestsResponse.body.aggregations.total_ai_requests.value || 0,
      averageResponseTime: Math.round(totalAIRequestsResponse.body.aggregations.avg_response_time.value || 0)
    };

  } catch (error) {
    console.error('Error calculating summary:', error);
    return {
      totalUsers: 0,
      totalInteractions: 0,
      totalAIRequests: 0,
      averageResponseTime: 0
    };
  }
}

// Get real-time metrics
router.get('/metrics', async (req, res) => {
  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Get recent activity counts
    const recentInteractions = await elasticsearch.search({
      index: 'arcsphere-user-interactions-*',
      body: {
        query: {
          range: {
            '@timestamp': {
              gte: oneHourAgo.toISOString()
            }
          }
        },
        aggs: {
          interactions_per_minute: {
            date_histogram: {
              field: '@timestamp',
              calendar_interval: '1m'
            }
          }
        },
        size: 0
      }
    });

    // Get AI response metrics
    const aiMetrics = await elasticsearch.search({
      index: 'arcsphere-ai-responses-*',
      body: {
        query: {
          range: {
            '@timestamp': {
              gte: oneHourAgo.toISOString()
            }
          }
        },
        aggs: {
          avg_response_time: {
            avg: {
              field: 'metadata.responseTime'
            }
          },
          response_time_percentiles: {
            percentiles: {
              field: 'metadata.responseTime',
              percents: [50, 90, 95, 99]
            }
          }
        },
        size: 0
      }
    });

    res.json({
      recentActivity: recentInteractions.body.aggregations.interactions_per_minute.buckets,
      aiMetrics: {
        averageResponseTime: aiMetrics.body.aggregations.avg_response_time.value,
        percentiles: aiMetrics.body.aggregations.response_time_percentiles.values
      }
    });

  } catch (error) {
    console.error('Metrics API error:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

module.exports = router;

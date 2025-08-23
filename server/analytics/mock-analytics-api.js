const express = require('express');
const router = express.Router();

// Mock data storage (simulating Elasticsearch)
let mockData = {
  userInteractions: [],
  aiResponses: [],
  systemEvents: [],
  analytics: {
    totalUsers: 0,
    totalInteractions: 0,
    totalAIRequests: 0,
    averageResponseTime: 0
  }
};

// Simulate real-time data generation
function generateMockData() {
  const now = new Date();
  const userIds = ['user123', 'user456', 'user789', 'user101', 'user202'];
  const actions = ['chat_request', 'dashboard_view', 'event_click', 'agent_open', 'page_navigate'];
  const models = ['llama3-70b-8192', 'llama3.3-70b-versatile'];

  // Generate random user interactions
  if (Math.random() > 0.7) {
    const interaction = {
      id: Date.now() + Math.random(),
      userId: userIds[Math.floor(Math.random() * userIds.length)],
      action: actions[Math.floor(Math.random() * actions.length)],
      timestamp: new Date(now.getTime() - Math.random() * 3600000).toISOString(),
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      ip: '192.168.1.' + Math.floor(Math.random() * 255),
      type: 'user_interaction'
    };
    mockData.userInteractions.unshift(interaction);
    mockData.userInteractions = mockData.userInteractions.slice(0, 100); // Keep last 100
  }

  // Generate random AI responses
  if (Math.random() > 0.8) {
    const response = {
      id: Date.now() + Math.random(),
      userId: userIds[Math.floor(Math.random() * userIds.length)],
      model: models[Math.floor(Math.random() * models.length)],
      prompt: 'Sample AI prompt for demonstration',
      response: 'This is a simulated AI response for analytics demonstration.',
      responseLength: Math.floor(Math.random() * 500) + 100,
      timestamp: new Date(now.getTime() - Math.random() * 3600000).toISOString(),
      metadata: {
        responseTime: Math.floor(Math.random() * 3000) + 500
      },
      type: 'ai_response'
    };
    mockData.aiResponses.unshift(response);
    mockData.aiResponses = mockData.aiResponses.slice(0, 100); // Keep last 100
  }

  // Generate random system events
  if (Math.random() > 0.9) {
    const event = {
      id: Date.now() + Math.random(),
      eventType: ['server_startup', 'user_login', 'error_logged', 'performance_alert'][Math.floor(Math.random() * 4)],
      timestamp: new Date(now.getTime() - Math.random() * 3600000).toISOString(),
      details: {
        message: 'System event for demonstration purposes'
      },
      type: 'system_event'
    };
    mockData.systemEvents.unshift(event);
    mockData.systemEvents = mockData.systemEvents.slice(0, 50); // Keep last 50
  }

  // Update analytics summary
  updateAnalyticsSummary();
}

function updateAnalyticsSummary() {
  const uniqueUsers = new Set([
    ...mockData.userInteractions.map(i => i.userId),
    ...mockData.aiResponses.map(r => r.userId)
  ]);

  const totalResponseTime = mockData.aiResponses.reduce((sum, r) => sum + (r.metadata?.responseTime || 0), 0);
  const avgResponseTime = mockData.aiResponses.length > 0 ? totalResponseTime / mockData.aiResponses.length : 0;

  mockData.analytics = {
    totalUsers: uniqueUsers.size,
    totalInteractions: mockData.userInteractions.length,
    totalAIRequests: mockData.aiResponses.length,
    averageResponseTime: Math.round(avgResponseTime)
  };
}

// Start generating mock data
setInterval(generateMockData, 5000); // Generate data every 5 seconds

// Get analytics data for dashboard
router.get('/analytics', async (req, res) => {
  try {
    const { timeRange = '24h' } = req.query;

    // Filter data based on time range
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

    // Filter data by timestamp
    const filterByTime = (item) => new Date(item.timestamp) >= fromDate;

    const userInteractions = mockData.userInteractions.filter(filterByTime);
    const aiResponses = mockData.aiResponses.filter(filterByTime);
    const systemEvents = mockData.systemEvents.filter(filterByTime);

    res.json({
      userInteractions,
      aiResponses,
      systemEvents,
      summary: mockData.analytics
    });

  } catch (error) {
    console.error('Mock Analytics API error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

// Get real-time metrics
router.get('/metrics', async (req, res) => {
  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Filter recent data
    const recentInteractions = mockData.userInteractions.filter(
      item => new Date(item.timestamp) >= oneHourAgo
    );

    const recentAIResponses = mockData.aiResponses.filter(
      item => new Date(item.timestamp) >= oneHourAgo
    );

    // Calculate metrics
    const responseTimes = recentAIResponses.map(r => r.metadata?.responseTime || 0);
    const avgResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      : 0;

    // Generate activity per minute (simulated)
    const activityPerMinute = [];
    for (let i = 0; i < 60; i++) {
      const time = new Date(now.getTime() - (60 - i) * 60 * 1000);
      const count = Math.floor(Math.random() * 5) + 1;
      activityPerMinute.push({
        key_as_string: time.toISOString(),
        doc_count: count
      });
    }

    res.json({
      recentActivity: activityPerMinute,
      aiMetrics: {
        averageResponseTime: Math.round(avgResponseTime),
        percentiles: {
          '50.0': Math.round(avgResponseTime * 0.8),
          '90.0': Math.round(avgResponseTime * 1.2),
          '95.0': Math.round(avgResponseTime * 1.5),
          '99.0': Math.round(avgResponseTime * 2.0)
        }
      }
    });

  } catch (error) {
    console.error('Mock Metrics API error:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

// Simulate Kafka topic endpoints
router.get('/kafka/topics', (req, res) => {
  res.json({
    topics: [
      {
        name: 'user-interactions',
        partitions: 3,
        replicas: 1,
        messageCount: mockData.userInteractions.length
      },
      {
        name: 'ai-responses',
        partitions: 3,
        replicas: 1,
        messageCount: mockData.aiResponses.length
      },
      {
        name: 'system-events',
        partitions: 1,
        replicas: 1,
        messageCount: mockData.systemEvents.length
      }
    ]
  });
});

// Simulate Elasticsearch indices
router.get('/elasticsearch/indices', (req, res) => {
  res.json({
    indices: [
      {
        name: 'arcsphere-user-interactions-2024.08.23',
        docs: mockData.userInteractions.length,
        size: '2.1mb',
        status: 'green'
      },
      {
        name: 'arcsphere-ai-responses-2024.08.23',
        docs: mockData.aiResponses.length,
        size: '1.8mb',
        status: 'green'
      },
      {
        name: 'arcsphere-system-events-2024.08.23',
        docs: mockData.systemEvents.length,
        size: '0.5mb',
        status: 'green'
      }
    ]
  });
});

module.exports = router;

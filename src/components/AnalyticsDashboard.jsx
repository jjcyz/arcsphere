import { useState, useEffect } from 'react';
import './AnalyticsDashboard.css';

export default function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState({
    userInteractions: [],
    aiResponses: [],
    systemEvents: [],
    summary: {
      totalUsers: 0,
      totalInteractions: 0,
      totalAIRequests: 0,
      averageResponseTime: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('24h');

  useEffect(() => {
    fetchAnalyticsData();
    const interval = setInterval(fetchAnalyticsData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);

      // Fetch data from your analytics API endpoint
      const response = await fetch(`/api/analytics?timeRange=${timeRange}`);
      const data = await response.json();

      setAnalyticsData(data);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case '1h': return 'Last Hour';
      case '24h': return 'Last 24 Hours';
      case '7d': return 'Last 7 Days';
      case '30d': return 'Last 30 Days';
      default: return 'Last 24 Hours';
    }
  };

  return (
    <div className="analytics-dashboard">
      <div className="analytics-header">
        <h2 className="analytics-title">Analytics Dashboard</h2>
        <div className="time-range-selector">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-range-select"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading analytics data...</p>
        </div>
      ) : (
        <div className="analytics-content">
          {/* Summary Cards */}
          <div className="summary-cards">
            <div className="summary-card">
              <div className="card-icon">👥</div>
              <div className="card-content">
                <div className="card-value">{analyticsData.summary.totalUsers}</div>
                <div className="card-label">Active Users</div>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-icon">🔄</div>
              <div className="card-content">
                <div className="card-value">{analyticsData.summary.totalInteractions}</div>
                <div className="card-label">Total Interactions</div>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-icon">🤖</div>
              <div className="card-content">
                <div className="card-value">{analyticsData.summary.totalAIRequests}</div>
                <div className="card-label">AI Requests</div>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-icon">⚡</div>
              <div className="card-content">
                <div className="card-value">{analyticsData.summary.averageResponseTime}ms</div>
                <div className="card-label">Avg Response Time</div>
              </div>
            </div>
          </div>

          {/* Real-time Activity Feed */}
          <div className="activity-section">
            <h3 className="section-title">Real-time Activity ({getTimeRangeLabel()})</h3>

            <div className="activity-tabs">
              <div className="activity-tab active">
                <h4>User Interactions</h4>
                <div className="activity-list">
                  {analyticsData.userInteractions.slice(0, 10).map((interaction, index) => (
                    <div key={index} className="activity-item">
                      <div className="activity-icon">👤</div>
                      <div className="activity-content">
                        <div className="activity-text">
                          User <strong>{interaction.userId}</strong> performed <strong>{interaction.action}</strong>
                        </div>
                        <div className="activity-time">{formatTime(interaction.timestamp)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="activity-tab">
                <h4>AI Responses</h4>
                <div className="activity-list">
                  {analyticsData.aiResponses.slice(0, 10).map((response, index) => (
                    <div key={index} className="activity-item">
                      <div className="activity-icon">🤖</div>
                      <div className="activity-content">
                        <div className="activity-text">
                          AI response to user <strong>{response.userId}</strong> ({response.responseLength} chars)
                        </div>
                        <div className="activity-time">{formatTime(response.timestamp)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="activity-tab">
                <h4>System Events</h4>
                <div className="activity-list">
                  {analyticsData.systemEvents.slice(0, 10).map((event, index) => (
                    <div key={index} className="activity-item">
                      <div className="activity-icon">⚙️</div>
                      <div className="activity-content">
                        <div className="activity-text">
                          System event: <strong>{event.eventType}</strong>
                        </div>
                        <div className="activity-time">{formatTime(event.timestamp)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Data Pipeline Status */}
          <div className="pipeline-status">
            <h3 className="section-title">Data Pipeline Status</h3>
            <div className="pipeline-cards">
              <div className="pipeline-card">
                <div className="pipeline-icon">📊</div>
                <div className="pipeline-content">
                  <h4>Kafka Producer</h4>
                  <div className="status-indicator active">Active</div>
                  <p>Streaming events to Kafka topics</p>
                </div>
              </div>

              <div className="pipeline-card">
                <div className="pipeline-icon">🔄</div>
                <div className="pipeline-content">
                  <h4>Kafka Consumer</h4>
                  <div className="status-indicator active">Active</div>
                  <p>Processing messages from Kafka</p>
                </div>
              </div>

              <div className="pipeline-card">
                <div className="pipeline-icon">🔍</div>
                <div className="pipeline-content">
                  <h4>Elasticsearch</h4>
                  <div className="status-indicator active">Connected</div>
                  <p>Indexing and searching data</p>
                </div>
              </div>

              <div className="pipeline-card">
                <div className="pipeline-icon">📝</div>
                <div className="pipeline-content">
                  <h4>Logstash</h4>
                  <div className="status-indicator active">Processing</div>
                  <p>Log aggregation and processing</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

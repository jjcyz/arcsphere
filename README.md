# Arc'Sphere

## Overview

Arc'Sphere is a modern web application that helps users connect and collaborate. The platform features multiple AI-powered agents built with Groq's LLM technology to provide intelligent assistance for various community-building activities.

## Technologies Used

- **Frontend:**
  - React.js with Vite for fast development and building
  - Tailwind CSS for styling
  - Custom CSS for specialized components

- **Backend:**
  - Node.js with Express for API endpoints
  - Groq API for LLM-powered responses

- **AI Models:**
  - Groq's LLaMA 3 70B model for natural language processing
  - Custom system prompts for specialized agent behaviors

- **Data Pipeline & Analytics:**
  - **Kafka**: Real-time event streaming for user interactions and AI responses
  - **Elasticsearch**: Distributed search and analytics engine for log storage and indexing
  - **Logstash**: Log aggregation and processing pipeline
  - **Kibana**: Data visualization and dashboard creation
  - **Winston**: Structured logging with Elasticsearch transport
    
<img width="1183" height="678" alt="Screenshot 2025-08-22 at 22 40 21" src="https://github.com/user-attachments/assets/005fd895-5874-4f38-9647-fc4588e4123b" />


- **Deployment:**
  - GitHub for version control
  - Environment variables for secure API key management
  - Docker Compose for infrastructure orchestration

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v14 or higher)
- npm (comes with Node.js)
- [Docker](https://www.docker.com/) and Docker Compose
- A Groq API key (for the AI chatbot functionality)

## Installation

1. Clone the repository:
```bash
git clone git@github.com:jjczy/arcsphere.git
cd arcsphere
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following content:
```
PORT=5001
OLLAMA_BASE_URL=http://localhost:11434
VITE_GROQ_API_KEY=your_groq_api_key_here
KAFKA_BROKER=localhost:9092
ELASTICSEARCH_URL=http://localhost:9200
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=changeme
```

Replace `your_groq_api_key_here` with your actual Groq API key.

## Running the Application

### Option 1: Full Stack with Elastic Stack and Kafka

1. Start the infrastructure services:
```bash
docker-compose up -d
```

This will start:
- Elasticsearch (port 9200)
- Kibana (port 5601)
- Logstash (ports 5000, 5044, 9600)
- Kafka (port 9092)
- Zookeeper (port 2181)
- Kafka UI (port 8080)

2. Start the Kafka consumer (in a new terminal):
```bash
npm run kafka:consumer
```

3. Start the server:
```bash
npm run server
```

4. In a new terminal, start the frontend:
```bash
npm run dev
```

### Option 2: Application Only (without Elastic Stack)

If you don't want to run the full infrastructure:

1. Start the server:
```bash
npm run server
```

2. In a new terminal, start the frontend:
```bash
npm run dev
```

The application should now be running at:
- Frontend: http://localhost:5173 (or the port shown in your terminal)
- Backend: http://localhost:5001
- Kibana: http://localhost:5601 (if using Docker Compose)
- Kafka UI: http://localhost:8080 (if using Docker Compose)

## Features

### AI Agents
- **Arc'BOT**: General-purpose AI assistant
- **Event Planner Agent**: Specialized agent for planning community events
- **Grant Program Agent**: AI assistant for navigating grant applications
- **Community Connector Agent**: Agent for matching community members with similar interests

### Dashboard Features
- 📅 Interactive calendar showing upcoming events
- 📊 Impact statistics showing community growth
- 📋 Upcoming events display with filtering by type
- 🔍 Event details including dates, locations, and descriptions

### Analytics & Monitoring
- 📈 **Real-time Analytics Dashboard**: Live metrics and user activity visualization
- 🔄 **Kafka Event Streaming**: Real-time processing of user interactions and AI responses
- 📊 **Elasticsearch Integration**: Centralized logging and search capabilities
- 📝 **Logstash Pipeline**: Automated log processing and enrichment
- 🎯 **Kibana Dashboards**: Custom visualizations and monitoring dashboards

### Event Types
- 🏔️ Meetups: Community gatherings and social events
- 🧗‍♂️ Expeditions: Outdoor adventures and trips
- 🛠️ Workshops: Educational sessions and skill-building events
- 💰 Grant Deadlines: Important dates for grant applications

## Project Structure

- `src/` - Frontend React application
  - `components/` - React components
    - `ChatbotWindow.jsx` - General AI assistant interface
    - `EventPlannerAgent.jsx` - Event planning assistant
    - `GrantProgramAgent.jsx` - Grant program assistant
    - `CommunityConnectorAgent.jsx` - Community matching assistant
    - `ImpactDashboard.jsx` - Dashboard for events and statistics
    - `AnalyticsDashboard.jsx` - Real-time analytics and monitoring
    - `SlideOutButton.jsx` - UI component for opening the chatbot
  - `App.jsx` - Main application component
  - `App.css` - Main application styles
- `server/` - Backend Express server
  - `index.js` - Server implementation with API endpoints
  - `kafka/` - Kafka producer and consumer implementations
    - `producer.js` - Event streaming to Kafka topics
    - `consumer.js` - Processing messages and indexing to Elasticsearch
  - `logging/` - Logging infrastructure
    - `elasticsearch-logger.js` - Winston logger with Elasticsearch transport
  - `analytics/` - Analytics API endpoints
    - `analytics-api.js` - Elasticsearch queries and metrics aggregation
- `logstash/` - Logstash configuration
  - `pipeline/logstash.conf` - Log processing pipeline
  - `config/logstash.yml` - Logstash settings
- `public/` - Static assets including images

## Data Pipeline Architecture

The application implements a modern data pipeline for real-time analytics:

1. **Event Generation**: User interactions and AI responses generate events
2. **Kafka Streaming**: Events are streamed to Kafka topics in real-time
3. **Logstash Processing**: Logs are processed and enriched through Logstash
4. **Elasticsearch Storage**: Data is indexed and stored in Elasticsearch
5. **Kibana Visualization**: Dashboards and visualizations are created in Kibana
6. **Analytics API**: Custom API endpoints provide aggregated metrics

### Kafka Topics
- `user-interactions`: User activity and interactions
- `ai-responses`: AI model responses and metadata
- `system-events`: System-level events and monitoring

## AI Implementation

The application uses Groq's LLaMA 3 70B model with the following configurations:
- `max_tokens`: 1024 for comprehensive responses
- `temperature`: 0.7 for balanced creativity and consistency
- Custom system prompts for each agent to define their specific roles and capabilities

Each agent has a specialized system prompt that guides its behavior:
- **Arc'BOT**: General assistant
- **Event Planner**: Focused on event planning, logistics, and promotion
- **Grant Program**: Specialized in grant application guidance
- **Community Connector**: Designed for matching community members

## Usage

1. Open the application in your browser
2. Use the Arc'BOT button or specialized agent buttons to open the desired AI assistant
3. Type your question or request in the input field
4. Wait for the AI agent to generate a response
5. Use the "Cancel" button if a request is taking too long
6. Explore the Impact Dashboard to view upcoming events and community statistics
7. Monitor real-time analytics in the Analytics Dashboard
8. Access Kibana for advanced data visualization and analysis

## Monitoring and Analytics

### Kibana Dashboards
Access Kibana at http://localhost:5601 to create custom dashboards:
- User activity patterns
- AI response performance metrics
- System health monitoring
- Error rate analysis

### Kafka UI
Monitor Kafka topics and messages at http://localhost:8080:
- Topic management
- Message inspection
- Consumer group monitoring
- Real-time message flow

### Analytics API
The application provides RESTful endpoints for analytics data:
- `GET /api/analytics?timeRange=24h` - Get analytics data for specified time range
- `GET /api/metrics` - Get real-time performance metrics

## Troubleshooting

If you encounter any issues:

1. **API Key Issues:**
   - Ensure your Groq API key is correctly set in the `.env` file
   - Check if the API key is being properly loaded in the application

2. **Server Connection Issues:**
   - Verify the server is running
   - Check if the port is available
   - Ensure the server can connect to the Groq API

3. **Elastic Stack Issues:**
   - Check if all Docker containers are running: `docker-compose ps`
   - Verify Elasticsearch is accessible: `curl http://localhost:9200`
   - Check Logstash logs: `docker-compose logs logstash`

4. **Kafka Issues:**
   - Ensure Zookeeper and Kafka containers are running
   - Check Kafka UI at http://localhost:8080 for topic status
   - Verify consumer is running: `npm run kafka:consumer`

5. **Performance Issues:**
   - Adjust the timeout settings in `server/index.js` if needed
   - Clear browser cache
   - Monitor resource usage in Docker containers

## License

©2025 All Rights Reserved

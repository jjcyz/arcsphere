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

- **Deployment:**
  - GitHub for version control
  - Environment variables for secure API key management

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v14 or higher)
- npm (comes with Node.js)
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
```

Replace `your_groq_api_key_here` with your actual Groq API key.

## Running the Application

You need to run both the server and the frontend. Open two terminal windows:

1. Start the server:
```bash
npm run server
# or
node server/index.js
```

2. In a new terminal, start the frontend:
```bash
npm run dev
```

The application should now be running at:
- Frontend: http://localhost:5173 (or the port shown in your terminal)
- Backend: http://localhost:5001

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
    - `SlideOutButton.jsx` - UI component for opening the chatbot
  - `App.jsx` - Main application component
  - `App.css` - Main application styles
- `server/` - Backend Express server
  - `index.js` - Server implementation with API endpoints
- `public/` - Static assets including images

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

## Troubleshooting

If you encounter any issues:

1. **API Key Issues:**
   - Ensure your Groq API key is correctly set in the `.env` file
   - Check if the API key is being properly loaded in the application

2. **Server Connection Issues:**
   - Verify the server is running
   - Check if the port is available
   - Ensure the server can connect to the Groq API

3. **Performance Issues:**
   - Adjust the timeout settings in `server/index.js` if needed
   - Clear browser cache

## License

©2025 All Rights Reserved

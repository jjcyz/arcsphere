# Arc'Sphere

A community platform for Arc'teryx partners to build communities, seek support, answer questions, and plan meetups. Powered by Groq's LLM technology.

## Overview

Arc'Sphere is a modern web application that helps Arc'teryx partners connect and collaborate. The platform features an AI-powered chatbot (Arc'BOT) built with Groq's LLM technology to provide intelligent assistance to users.

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

- 🤖 Arc'BOT: AI-powered chatbot built with Groq's LLM technology
- 💬 Real-time chat interface with message history
- 🎨 Modern, responsive UI with dark theme
- 🔄 Streaming responses for a smooth user experience
- ⚡ Fast and responsive interface

## Project Structure

- `src/` - Frontend React application
  - `components/` - React components including the ChatbotWindow
  - `App.jsx` - Main application component
  - `App.css` - Main application styles
- `server/` - Backend Express server
  - `index.js` - Server implementation with API endpoints
- `public/` - Static assets including images

## Usage

1. Open the application in your browser
2. Click the slide-out button to open the chat interface
3. Type your question or request in the input field
4. Wait for Arc'BOT to generate a response
5. Use the "Cancel" button if a request is taking too long

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

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

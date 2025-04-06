const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

const OLLAMA_BASE_URL = 'http://localhost:11434';
const TIMEOUT = 120000; // Increased to 120 seconds timeo

console.log(process.env.VITE_GROQ_API_KEY);
console.log("hello");

// Store active requests
const activeRequests = new Map();

// Format conversation history for the model
const formatConversationHistory = (history) => {
  if (!history || !Array.isArray(history)) return '';

  return history.map(msg => {
    const role = msg.role === 'user' ? 'Human' : 'Assistant';
    return `${role}: ${msg.content}`;
  }).join('\n');
};

app.post('/api/chat', async (req, res) => {
  const requestId = Date.now().toString();
  activeRequests.set(requestId, true);

  // Set up SSE headers for streaming
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const { message, model, history } = req.body;

    if (!message || !model) {
      return res.status(400).json({ error: 'Message and model are required' });
    }

    console.log('Received request with:', { model, message, historyLength: history?.length });

    // Format the conversation history
    const conversationHistory = formatConversationHistory(history);

    // Create the prompt with context
    const prompt = conversationHistory
      ? `${conversationHistory}\nHuman: ${message}\nAssistant:`
      : `Human: ${message}\nAssistant:`;

      console.log(process.env.VITE_GROQ_API_KEY);
      console.log("hello");

    // Make request to Ollama with responseType: 'stream'
    const response = await axios.post(`https://api.groq.com/openai/v1/chat/completions`, {
        "model": "deepseek-r1-distill-qwen-32b",
        "headers": {
            "Authorization": `Bearer ${process.env.VITE_GROQ_API_KEY}`
        },
        "messages": [{
            "role": "user",
            "content": "Explain the importance of fast language models"
        }]
    }, {
      timeout: TIMEOUT,
      responseType: 'stream'
    });
    console.log(process.env.VITE_GROQ_API_KEY);
    console.log("hello");

    // Handle the streaming response
    response.data.on('data', chunk => {
      if (!activeRequests.has(requestId)) {
        response.data.destroy();
        return;
      }

      try {
        const lines = chunk.toString().split('\n');
        for (const line of lines) {
          if (line.trim()) {
            const data = JSON.parse(line);
            if (data.response) {
              // Send each chunk as a SSE event
              res.write(`data: ${JSON.stringify({ response: data.response })}\n\n`);
            }
          }
        }
      } catch (e) {
        console.error('Error parsing chunk:', e);
      }
    });

    // When the stream ends
    response.data.on('end', () => {
      activeRequests.delete(requestId);
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    });

    // Handle any stream errors
    response.data.on('error', error => {
      activeRequests.delete(requestId);
      console.error('Stream error:', error);
      res.write(`data: ${JSON.stringify({ error: 'Error processing stream from Ollama' })}\n\n`);
      res.end();
    });

  } catch (error) {
    activeRequests.delete(requestId);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText
    });

    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ error: 'Ollama service is not running. Please start Ollama first.' });
    }

    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
      return res.status(504).json({ error: 'Request timed out. The model is taking too long to respond.' });
    }

    if (error.response?.status === 404) {
      return res.status(404).json({ error: `Model not found. Please make sure the model "${model}" is installed in Ollama.` });
    }

    if (error.response?.data) {
      // Safely extract error message without circular references
      const errorMessage = typeof error.response.data === 'string'
        ? error.response.data
        : JSON.stringify(error.response.data, (key, value) => {
            if (key === 'req' || key === 'res' || key === 'socket' || key === '_httpMessage') {
              return '[Circular]';
            }
            return value;
          });
      return res.status(500).json({ error: `Ollama error: ${errorMessage}` });
    }

    res.status(500).json({ error: 'Failed to process chat request: ' + error.message });
  }
});

// Endpoint to cancel a request
app.post('/api/cancel', (req, res) => {
  const { requestId } = req.body;
  if (requestId && activeRequests.has(requestId)) {
    activeRequests.delete(requestId);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Request not found' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Make sure Ollama is running at ${OLLAMA_BASE_URL}`);
});

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { EVENT_PLANNING_TEMPLATE } = require('./agent');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

const TIMEOUT = 120000;

console.log(process.env.VITE_GROQ_API_KEY);
console.log("hello");

const activeRequests = new Map();
const memory = new Map();

const formatConversationHistory = (history) => {
  if (!history || !Array.isArray(history)) return '';

  return history.map(msg => {
    const role = msg.role === 'user' ? 'Human' : 'Assistant';
    return `${role}: ${msg.content}`;
  }).join('\n');
};

const extractEventDetails = (message) => {
  const details = {
    activity: null,
    guests: null,
    dateRange: null,
    hobbies: null,
    location: null,
    userBase: null,
  };

  const lowerMessage = message.toLowerCase();

  if (/indoor|outdoor/.test(lowerMessage)) {
    details.activity = /indoor/.test(lowerMessage) ? 'indoor' : 'outdoor';
  }
  if (/rock climbing|climbing/i.test(lowerMessage)) {
    details.activity = 'outdoor'; // Assume outdoor for rock climbing
    details.hobbies = 'rock climbing';
  }
  if (/\d+\s*(people|guests|friends)/i.test(message)) {
    details.guests = message.match(/\d+\s*(people|guests|friends)/i)[0];
  } else if (/family|friends|colleagues/i.test(lowerMessage)) {
    details.guests = lowerMessage.match(/family|friends|colleagues/i)[0];
  }
  if (/(january|february|march|april|may|june|july|august|september|october|november|december|\d{1,2}(st|nd|rd|th)?\s+to\s+\d{1,2}(st|nd|rd|th)?)/i.test(message)) {
    details.dateRange = message.match(/(january|february|march|april|may|june|july|august|september|october|november|december|\d{1,2}(st|nd|rd|th)?\s+to\s+\d{1,2}(st|nd|rd|th)?)/i)[0];
  }
  if (/hiking|climbing|skiing|cycling|running|art|cooking/i.test(lowerMessage)) {
    details.hobbies = lowerMessage.match(/hiking|climbing|skiing|cycling|running|art|cooking/i)[0];
  }
  if (/in\s+[\w\s]+(city|town|state|province|country)/i.test(message)) {
    details.location = message.match(/in\s+[\w\s]+(city|town|state|province|country)/i)[0].replace('in ', '');
  }
  if (/based\s+in\s+[\w\s]+/i.test(message)) {
    details.userBase = message.match(/based\s+in\s+[\w\s]+/i)[0].replace('based in ', '');
  }

  return details;
};

const generateMissingQuestions = (details) => {
  const questions = [];
  if (!details.activity) questions.push("Is this an indoor or outdoor activity?");
  if (!details.guests) questions.push("Who are you inviting, or how many guests are you expecting?");
  if (!details.dateRange) questions.push("What date range are you planning this event for?");
  if (!details.hobbies) questions.push("What are your hobbies or interests related to this event?");
  if (!details.location) questions.push("Where are you planning to hold this event?");
  if (!details.userBase) questions.push("Where are you based?");
  return questions.length ? `\nPlease provide more details: ${questions.join(' ')}` : '';
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

    // Initialize memory
    let eventDetails = memory.get(requestId) || {};
    const newDetails = extractEventDetails(message);
    eventDetails = { ...eventDetails, ...newDetails };
    memory.set(requestId, eventDetails);

    const conversationHistory = formatConversationHistory(history);

    const templateWithQuery = EVENT_PLANNING_TEMPLATE.replace('{query}', message);

    const missingQuestions = generateMissingQuestions(eventDetails);
    const prompt = conversationHistory
      ? `${templateWithQuery}\nCurrent event details: ${JSON.stringify(eventDetails)}\n${conversationHistory}\nHuman: ${message}\nAssistant:${missingQuestions}`
      : `${templateWithQuery}\nCurrent event details: ${JSON.stringify(eventDetails)}\nAssistant:${missingQuestions}`;

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
      res.write(`data: ${JSON.stringify({ done: true, eventDetails })}\n\n`);
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

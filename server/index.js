const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

const OLLAMA_BASE_URL = 'http://localhost:11434';
const TIMEOUT = 120000; // 120 seconds timeout

app.post('/api/chat', async (req, res) => {
  try {
    const { message, model, history } = req.body;

    if (!message || !model) {
      return res.status(400).json({ error: 'Message and model are required' });
    }

    console.log('Received request with:', { model, message });

    // Make request to Ollama with responseType: 'stream'
    const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
      model: model,
      prompt: message
    }, {
      timeout: TIMEOUT,
      responseType: 'stream'
    });

    let fullResponse = '';

    // Handle the streaming response
    response.data.on('data', chunk => {
      try {
        const lines = chunk.toString().split('\n');
        for (const line of lines) {
          if (line.trim()) {
            const data = JSON.parse(line);
            if (data.response) {
              fullResponse += data.response;
            }
          }
        }
      } catch (e) {
        console.error('Error parsing chunk:', e);
      }
    });

    // When the stream ends, send the complete response
    response.data.on('end', () => {
      console.log('Full response:', fullResponse);
      res.json({ response: fullResponse });
    });

    // Handle any stream errors
    response.data.on('error', error => {
      console.error('Stream error:', error);
      res.status(500).json({ error: 'Error processing stream from Ollama' });
    });

  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      response: error.response?.data
    });

    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ error: 'Ollama service is not running. Please start Ollama first.' });
    }

    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
      return res.status(504).json({ error: 'Request timed out. The model is taking too long to respond.' });
    }

    if (error.response?.data) {
      return res.status(500).json({ error: `Ollama error: ${JSON.stringify(error.response.data)}` });
    }

    res.status(500).json({ error: 'Failed to process chat request: ' + error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Make sure Ollama is running at ${OLLAMA_BASE_URL}`);
});

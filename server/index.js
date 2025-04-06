const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

const OLLAMA_BASE_URL = 'http://localhost:11434';

app.post('/api/chat', async (req, res) => {
  try {
    const { message, model, history } = req.body;

    // Convert history to Ollama format
    const messages = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));

    // Add the new message
    messages.push({
      role: 'user',
      content: message
    });

    // Call Ollama API
    const response = await axios.post(`${OLLAMA_BASE_URL}/api/chat`, {
      model: model,
      messages: messages,
      stream: false
    });

    res.json({ response: response.data.message.content });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to process chat request' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

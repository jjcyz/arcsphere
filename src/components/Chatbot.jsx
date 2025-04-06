import React, { useState, useRef, useEffect } from 'react';

const ChatBot = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I'm your AI assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingResponse, setStreamingResponse] = useState('');
  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingResponse]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Add user message to chat
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setStreamingResponse('');

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('http://localhost:5001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          model: 'deepseek-r1:1.5b',
          history: messages,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.response) {
                fullResponse += data.response;
                setStreamingResponse(fullResponse);
              }
              if (data.done) {
                // Add the complete response to messages
                setMessages(prev => [...prev, { role: 'assistant', content: fullResponse }]);
                setStreamingResponse('');
              }
              if (data.error) {
                throw new Error(data.error);
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Request was cancelled');
      } else {
        console.error('Error:', error);
        setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${error.message}` }]);
      }
    } finally {
      setIsLoading(false);
      setStreamingResponse('');
      abortControllerRef.current = null;
    }
  };

  const cancelRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsLoading(false);
    setStreamingResponse('');
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
          >
            <div className="message-content">{message.content}</div>
          </div>
        ))}
        {streamingResponse && (
          <div className="message assistant-message">
            <div className="message-content">{streamingResponse}</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="chatbot-input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message here..."
          disabled={isLoading}
          className="chatbot-input"
        />
        <div className="button-container">
          {isLoading ? (
            <button
              type="button"
              onClick={cancelRequest}
              className="cancel-button"
            >
              Cancel
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="send-button"
            >
              Send
            </button>
          )}
        </div>
      </form>

      <style jsx>{`
        .chatbot-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
          max-width: 800px;
          margin: 0 auto;
          background-color: #121212;
          color: white;
          font-family: 'Inter', sans-serif;
        }

        .chatbot-messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .message {
          max-width: 80%;
          padding: 12px 16px;
          border-radius: 12px;
          margin-bottom: 8px;
        }

        .user-message {
          align-self: flex-end;
          background-color: #2962ff;
          color: white;
        }

        .assistant-message {
          align-self: flex-start;
          background-color: #333333;
          color: white;
        }

        .message-content {
          white-space: pre-wrap;
          word-break: break-word;
        }

        .chatbot-input-form {
          display: flex;
          padding: 16px;
          background-color: #1e1e1e;
          border-top: 1px solid #333;
        }

        .chatbot-input {
          flex: 1;
          padding: 12px 16px;
          border-radius: 8px;
          border: 1px solid #444;
          background-color: #2a2a2a;
          color: white;
          font-size: 16px;
          outline: none;
        }

        .chatbot-input:focus {
          border-color: #2962ff;
        }

        .button-container {
          margin-left: 12px;
        }

        .send-button, .cancel-button {
          padding: 12px 20px;
          border-radius: 8px;
          border: none;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .send-button {
          background-color: #2962ff;
          color: white;
        }

        .send-button:hover {
          background-color: #1e4bd8;
        }

        .send-button:disabled {
          background-color: #555;
          cursor: not-allowed;
        }

        .cancel-button {
          background-color: #f44336;
          color: white;
        }

        .cancel-button:hover {
          background-color: #d32f2f;
        }
      `}</style>
    </div>
  );
};

export default ChatBot;

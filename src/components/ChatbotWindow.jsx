import Groq from "groq-sdk";
import { useState, useRef, useEffect } from 'react'
import './ChatbotWindow.css';

export default function ChatbotWindow({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    { role: 'ai', content: "Hello! I'm Arc'BOT, an AI agent built with Groq's LLM. How can I help you today?" }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loadingStatus, setLoadingStatus] = useState('')
  const [currentResponse, setCurrentResponse] = useState('')
  const [error, setError] = useState(null)
  const abortControllerRef = useRef(null)
  const requestIdRef = useRef(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, currentResponse])

  const cleanResponse = (text) => {
    // Remove unwanted tags and escape sequences
    let cleaned = text
      .replace(/<think>/g, '').replace(/<\/think>/g, '')
      .replace(/\\\(.*?boxed{(.*?)}\\\)/g, '$1')
      .replace(/\\\((.*?)\\\)/g, '$1')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/```(.*?)```/g, '$1');

    // Preserve paragraph breaks and normalize spacing
    cleaned = cleaned.replace(/\n{2,}/g, '\n\n');
    cleaned = cleaned.replace(/[ \t]+/g, ' ').trim();
    return cleaned;
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setLoadingStatus('Processing your request...')
    setCurrentResponse('')
    setError(null)

    abortControllerRef.current = new AbortController();
    requestIdRef.current = Date.now().toString();

    try {
    //   setLoadingStatus('Connecting to the model...')
    //   const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
    //     },
    //     body: JSON.stringify({
    //      "messages": [{
    // "role": "user",
    // "content": "Explain the importance of fast language models"
    //     }],
    //       model: "llama-3.3-70b-versatile",
    //       // history: messages,
    //       // requestId: requestIdRef.current,
    //     }),
    //   });

    const groq = new Groq({
      apiKey: import.meta.env.VITE_GROQ_API_KEY,
      dangerouslyAllowBrowser: true
    });

    async function getGroqChatCompletion() {
      return groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: input,
          },
        ],
        model: "llama-3.3-70b-versatile",
      });
    }

    const response = await getGroqChatCompletion();

      console.log(response.choices[0]?.message?.content || "");

      const reader = response.choices[0]?.message?.content;
      const decoder = new TextDecoder();
      let fullResponse = reader;


      setMessages(prev => [...prev, { role: 'ai', content: cleanResponse(fullResponse) }]);
      setIsLoading(false);
      setLoadingStatus('');
      setCurrentResponse('');

    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Request was cancelled');
      } else {
        console.error('Error:', error);
        setError(error.message);
        setMessages(prev => [...prev, { role: 'ai', content: `Error: ${error.message}` }]);
      }
    } finally {
      setIsLoading(false);
      setLoadingStatus('');
      setCurrentResponse('');
      abortControllerRef.current = null;
      requestIdRef.current = null;
    }
  }

  const cancelRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsLoading(false);
    setCurrentResponse('');
  };

  if (!isOpen) return null;

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <h2 className="chatbot-title">Arc'BOT</h2>
        <button onClick={onClose} className="close-button">
          ✕
        </button>
      </div>


      <div
        className={
          isOpen ? "sidepane_open" : "sidepane_closed"
        }
      >
      <div className="messages-container">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`chat-message ${message.role === 'user' ? 'user-message' : 'ai-message'}`}
          >
            <div className="message-content">
              {message.content}
            </div>
          </div>
        ))}
        {currentResponse && (
          <div className="chat-message ai-message">
            <div className="message-content">
              {currentResponse}
            </div>
          </div>
        )}
        {error && (
          <div className="chat-message error-message">
            <div className="error-text">
              {error}
            </div>
          </div>
        )}
        {isLoading && (
          <div className="chat-message ai-message">
            <div className="loading-container">
              <div className="spinner"></div>
              <div className="loading-text">
                {loadingStatus}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="chatbot-form">
        <div className="form-container">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Prompt Me Here!"
            className="chat-input"
            disabled={isLoading}
          />
          <button
            type={isLoading ? "button" : "submit"}
            onClick={isLoading ? cancelRequest : undefined}
            className={`submit-button ${
              isLoading
                ? "submit-button-red"
                : "submit-button-blue"
            }`}
          >
            {isLoading ? "Cancel" : "→"}
          </button>
        </div>
      </form>
      </div>
    </div>
  )
}

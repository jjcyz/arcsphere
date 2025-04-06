import { useState, useRef, useEffect } from 'react';
import Groq from "groq-sdk";
import './ChatbotWindow.css';

const EVENT_PLANNING_TEMPLATE = `
You are an AI event coordinator that helps Arc\’teryx grant recipients plan meetups with those in their local community involving recreational activities. The user will ask you about an event that they are planning. Be on the lookout for the following information in the user\’s query:

- activity (indoor or outdoor)
- guests (who and/or how many)
- date range
- their hobbies/interests
- exact or approximate location
- where the user is based

Ask the user about any missing information and store it in memory, along with the information given in the user\’s query.

`

export default function EventPlannerAgent({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'system',
      content: EVENT_PLANNING_TEMPLATE
    },
    {
      role: 'ai',
      content: "Hello! I'm Arc'Event, your community event planning assistant. I can help you plan, organize, and promote events for the Arc'teryx community. What kind of event would you like to plan today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [currentResponse, setCurrentResponse] = useState('');
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);
  const requestIdRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentResponse]);

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
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setLoadingStatus('Planning your event...');
    setCurrentResponse('');
    setError(null);

    abortControllerRef.current = new AbortController();
    requestIdRef.current = Date.now().toString();

    try {
      const groq = new Groq({
        apiKey: import.meta.env.VITE_GROQ_API_KEY,
        dangerouslyAllowBrowser: true
      });

      // Format messages for the API
      const formattedMessages = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : (msg.role === 'ai' ? 'assistant' : 'system'),
        content: msg.content
      }));

      // Add the current user message
      formattedMessages.push({
        role: 'user',
        content: input
      });

      setLoadingStatus('Getting event planning suggestions...');

      const response = await groq.chat.completions.create({
        messages: formattedMessages,
        model: "llama3-70b-8192",
        max_tokens: 1024, // Increased max tokens for more detailed responses
        temperature: 0 // Low temperature for more deterministic responses
      });

      console.log(response.choices[0]?.message?.content || "");

      const assistantResponse = response.choices[0]?.message?.content;
      const fullResponse = cleanResponse(assistantResponse);

      setMessages(prev => [...prev, { role: 'ai', content: fullResponse }]);
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
  };

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
        <h2 className="chatbot-title">Arc'Event</h2>
        <button onClick={onClose} className="close-button">
          ✕
        </button>
      </div>

      <div className={isOpen ? "sidepane_open" : "sidepane_closed"}>
        <div className="messages-container">
          {messages.filter(msg => msg.role !== 'system').map((message, index) => (
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
              placeholder="Tell me about your event idea..."
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
  );
}

import { useState, useRef, useEffect } from 'react';
import Groq from "groq-sdk";
import './ChatbotWindow.css';

export default function CommunityConnectorAgent({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'system',
      content: `You are Arc'Connect, a specialized AI assistant for Arc'teryx partners to connect with each other.
      Your role is to help users find connections within the Arc'teryx community based on interests, skills, and goals.
      You can help with:
      - Matching members with similar interests or complementary skills
      - Suggesting potential collaborations between grantees/partners
      - Identifying mentorship opportunities within the community
      - Recommending community events or groups based on interests
      - Facilitating introductions between partners with shared goals
      - Highlighting success stories of community collaborations
      - Providing guidance on building meaningful community relationships

      Always be concise, practical, and focused on creating genuine connections that align with Arc'teryx values.
      When suggesting matches, explain why the connection would be valuable and how it could benefit both parties.`
    },
    {
      role: 'ai',
      content: "Hello! I'm Arc'Connect, your community connection assistant. I can help you find partners with similar interests, suggest collaborations, and identify mentorship opportunities. What kind of connection are you looking for today?"
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
    setLoadingStatus('Finding community connections...');
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

      setLoadingStatus('Connecting with community members...');

      const response = await groq.chat.completions.create({
        messages: formattedMessages,
        model: "llama3-70b-8192",
        max_tokens: 1024,
        temperature: 0.7
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
        <h2 className="chatbot-title">Arc'Connect</h2>
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
              placeholder="Tell me about your interests or what you're looking for..."
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

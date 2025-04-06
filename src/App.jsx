import { useState, useRef, useEffect } from 'react'
import Sidebar from './components/Sidebar'

function ChatbotWindow({ isOpen, onClose, selectedModel, setSelectedModel }) {
  const [messages, setMessages] = useState([
    { role: 'ai', content: "Hi! I'm DeepSeek. How can I help you today? 💻" }
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
      setLoadingStatus('Connecting to the model...')
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          model: selectedModel,
          history: messages,
          requestId: requestIdRef.current,
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
                setCurrentResponse(cleanResponse(fullResponse));
              }
              if (data.done) {
                setMessages(prev => [...prev, { role: 'ai', content: cleanResponse(fullResponse) }]);
                setIsLoading(false);
                setLoadingStatus('');
                setCurrentResponse('');
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
    <div className="fixed right-4 bottom-20 w-96 h-[600px] bg-black rounded-lg shadow-xl flex flex-col overflow-hidden">
      <div className="flex justify-between items-center p-4 bg-gray-900 border-b border-gray-800">
        <h2 className="text-lg font-semibold text-white">Arc'BOT</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
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
            <div className="text-sm text-red-400">
              {error}
            </div>
          </div>
        )}
        {isLoading && (
          <div className="chat-message ai-message">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              <div className="text-sm text-gray-300">
                {loadingStatus}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 bg-gray-900 border-t border-gray-800">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Prompt Me Here!"
            className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
            disabled={isLoading}
          />
          <button
            type={isLoading ? "button" : "submit"}
            onClick={isLoading ? cancelRequest : undefined}
            className={`px-4 py-2 rounded-lg ${
              isLoading
                ? "bg-red-600 hover:bg-red-700"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white transition-colors`}
          >
            {isLoading ? "Cancel" : "→"}
          </button>
        </div>
      </form>
    </div>
  )
}

function App() {
  const [selectedModel, setSelectedModel] = useState('deepseek-r1:1.5b')
  const [isChatOpen, setIsChatOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Landing Page */}
      <div className="container mx-auto px-4 py-8">
        <header className="mb-12">
          <img src="/arc-sphere-logo.png" alt="Arc'SPHERE" className="h-8" />
        </header>

        <main className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-4">Welcome to the 'Sphere!</h1>
          <p className="text-gray-400 text-lg mb-8">
            Subheading that sets up context, shares more info about the website, or
            generally gets people psyched to keep scrolling.
          </p>

          <div className="relative max-w-2xl mx-auto">
            <img
              src="/images/image.png"
              alt="Mountain Climbers"
              className="w-full h-auto object-cover rounded-lg shadow-xl"
              style={{ maxHeight: '1200px' }}
            />

            {/* Arc'BOT Button */}
            <button
              onClick={() => setIsChatOpen(true)}
              className="fixed right-4 bottom-4 bg-black text-white px-6 py-3 rounded-lg shadow-lg hover:bg-gray-900 transition-colors"
            >
              Arc'BOT
            </button>
          </div>
        </main>

        {/* Chatbot Window */}
      <ChatbotWindow
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
      />

        <footer className="mt-16 text-center text-gray-500">
          ©2025 All Rights Reserved
        </footer>
      </div>

    </div>
  )
}

export default App

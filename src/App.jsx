import { useState, useRef, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import SlideOutButton from './components/SlideOutButton'

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
                setCurrentResponse(fullResponse);
              }
              if (data.done) {
                setMessages(prev => [...prev, { role: 'ai', content: fullResponse }]);
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
    <div className="right-4 bottom-20 w-[500px] h-[700px] bg-black rounded-lg shadow-xl flex flex-col overflow-hidden">
      <div className="flex justify-between items-center p-6 bg-gray-900 border-b border-gray-800">
        <h2 className="text-2xl font-semibold text-white">Arc'BOT</h2>
        <button onClick={onClose} className="text-2xl text-gray-400 hover:text-white">
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
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
            <div className="text-lg text-red-400">
              {error}
            </div>
          </div>
        )}
        {isLoading && (
          <div className="chat-message ai-message">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <div className="text-lg text-gray-300">
                {loadingStatus}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-6 bg-gray-900 border-t border-gray-800">
        <div className="flex space-x-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Prompt Me Here!"
            className="flex-1 px-6 py-3 bg-gray-800 text-white text-xl rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
            disabled={isLoading}
          />
          <button
            type={isLoading ? "button" : "submit"}
            onClick={isLoading ? cancelRequest : undefined}
            className={`px-6 py-3 rounded-lg ${
              isLoading
                ? "bg-red-600 hover:bg-red-700"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white text-xl transition-colors`}
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

   <div className='relative'>

         {/* Arc'BOT Button */}
         <button
          onClick={() => setIsChatOpen(true)}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black text-white px-8 py-4 rounded-lg shadow-lg hover:bg-gray-900 transition-colors text-xl"
        >
          Arc'BOT
        </button>
    <div className="min-h-screen bg-gray-900">

      {/* Chatbot Window */}
      <ChatbotWindow
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
      />

      {/* Simple Black Header */}
      <div className="w-full bg-black">
        <div className="container mx-auto px-4">
          <div className="py-4">
            <h1 className="text-3xl text-white">Arc'Sphere</h1>
          </div>
        </div>
      </div>

      {/* Landing Page */}
      <div className="container mx-auto">
        <div className="px-4 pt-12">
          <main className="max-w-4xl mx-auto">
            <h1 className="text-6xl font-bold text-white mb-6">Welcome to the 'Sphere!</h1>
            <p className="text-2xl text-gray-400 mb-12 leading-relaxed">
              Helping Arc'teryx partners build communities orbiting around seeking support,
              answering questions, and planning meetups.
            </p>

            <div className="relative max-w-2xl mx-auto">
              <img
                src="/images/image.png"
                alt="Mountain Climbers"
                className="w-screen h-auto object-cover rounded-lg shadow-xl"
                style={{ maxHeight: '1200px' }}
              />


            </div>
          </main>

          <footer className="mt-16 text-center text-gray-500 text-xl">
            ©2025 All Rights Reserved
          </footer>
        </div>



      </div>
    </div>
    </div>
  )
}

export default App

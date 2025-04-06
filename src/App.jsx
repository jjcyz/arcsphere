import { useState, useRef, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import ChatMessage from './components/ChatMessage'

function App() {
  const [selectedModel, setSelectedModel] = useState('deepseek-r1:1.5b')
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, currentResponse])

  const cancelRequest = async () => {
    if (requestIdRef.current) {
      try {
        await fetch('/api/cancel', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ requestId: requestIdRef.current }),
        });
      } catch (error) {
        console.error('Error canceling request:', error);
      }
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsLoading(false);
    setLoadingStatus('');
    setCurrentResponse('');
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

    // Create new AbortController for this request
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
                setCurrentResponse(prev => prev + data.response);
              }
              if (data.done) {
                setMessages(prev => [...prev, { role: 'ai', content: currentResponse }]);
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

  return (
    <div className="flex h-screen">
      <Sidebar
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
      />

      <main className="flex-1 flex flex-col">
        <header className="p-4 border-b border-accent">
          <h1 className="text-2xl font-bold">🧠 DeepSeek Code Companion</h1>
          <p className="text-sm text-gray-400">🚀 Your AI Pair Programmer with Debugging Superpowers</p>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          {messages.map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))}
          {currentResponse && (
            <div className="chat-message ai-message p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {currentResponse}
              </div>
            </div>
          )}
          {error && (
            <div className="chat-message error-message p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <div className="text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            </div>
          )}
          {isLoading && (
            <div className="chat-message ai-message p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {loadingStatus}
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                This may take a few moments as the model processes your request locally...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="input-container">
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question here..."
              className="chat-input flex-1"
              disabled={isLoading}
            />
            {isLoading && (
              <button
                type="button"
                onClick={cancelRequest}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </main>
    </div>
  )
}

export default App

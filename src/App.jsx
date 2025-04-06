import { useState } from 'react'
import Sidebar from './components/Sidebar'
import ChatMessage from './components/ChatMessage'

function App() {
  const [selectedModel, setSelectedModel] = useState('deepseek-r1:1.5b')
  const [messages, setMessages] = useState([
    { role: 'ai', content: "Hi! I'm DeepSeek. How can I help you code today? 💻" }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loadingStatus, setLoadingStatus] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setLoadingStatus('Processing your request...')

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
        }),
      })

      setLoadingStatus('Generating response...')
      const data = await response.json()
      setMessages(prev => [...prev, { role: 'ai', content: data.response }])
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, { role: 'ai', content: 'Sorry, there was an error processing your request.' }])
    } finally {
      setIsLoading(false)
      setLoadingStatus('')
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
        </div>

        <form onSubmit={handleSubmit} className="input-container">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your coding question here..."
            className="chat-input"
            disabled={isLoading}
          />
        </form>
      </main>
    </div>
  )
}

export default App

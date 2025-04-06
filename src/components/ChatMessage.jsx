function ChatMessage({ message }) {
  return (
    <div className={`chat-message ${message.role === 'user' ? 'user-message' : 'ai-message'}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3">
          {message.role === 'user' ? '👤' : '🤖'}
        </div>
        <div className="flex-1">
          <div className="prose prose-invert max-w-none">
            {message.content}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatMessage

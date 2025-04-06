function Sidebar({ selectedModel, onModelChange }) {
  return (
    <aside className="w-64 bg-secondary p-4 border-r border-accent">
      <h2 className="text-xl font-bold mb-4">⚙️ Configuration</h2>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Choose Model</label>
        <select
          value={selectedModel}
          onChange={(e) => onModelChange(e.target.value)}
          className="w-full p-2 rounded bg-accent text-white border border-gray-600 focus:outline-none focus:border-blue-500"
        >
          <option value="deepseek-r1:1.5b">deepseek-r1:1.5b</option>
          <option value="deepseek-r1:3b">deepseek-r1:3b</option>
        </select>
      </div>

      <div className="border-t border-accent pt-4">
        <h3 className="text-lg font-medium mb-2">Model Capabilities</h3>
        <ul className="space-y-2 text-sm">
          <li>🐍 Python Expert</li>
          <li>🐞 Debugging Assistant</li>
          <li>📝 Code Documentation</li>
          <li>💡 Solution Design</li>
        </ul>
      </div>

      <div className="border-t border-accent pt-4 mt-4 text-sm text-gray-400">
        <p>Built with <a href="https://ollama.ai/" className="text-blue-400 hover:underline">Ollama</a> | <a href="https://python.langchain.com/" className="text-blue-400 hover:underline">LangChain</a></p>
      </div>
    </aside>
  )
}

export default Sidebar

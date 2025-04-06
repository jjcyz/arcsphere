# DeepSeek Code Companion

An AI-powered coding assistant that helps you with programming tasks, debugging, and code explanations.

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v14 or higher)
- [Ollama](https://ollama.ai/) (for running AI models locally)
- npm (comes with Node.js)

## Installation

1. Clone the repository:
```bash
git clone git@github.com:jjczy/arcsphere.git
cd arcsphere
```

2. Install dependencies:
```bash
npm install
```

3. Install Ollama and the required model:
```bash
# Install Ollama (if not already installed)
# Visit https://ollama.ai/ for installation instructions

# Pull the DeepSeek model
ollama pull deepseek-r1:1.5b
```

## Configuration

1. Create a `.env` file in the root directory:
```bash
PORT=5001
OLLAMA_BASE_URL=http://localhost:11434
```

## Running the Application

You need to run both the server and the frontend. Open two terminal windows:

1. Start the server:
```bash
npm run server
# or
node server/index.js
```

2. In a new terminal, start the frontend:
```bash
npm run dev
```

The application should now be running at:
- Frontend: http://localhost:3000 (or the port shown in your terminal)
- Backend: http://localhost:5001

## Features

- 🤖 AI-powered code assistance
- 💻 Real-time code suggestions
- 🔍 Smart debugging help
- 📝 Code explanation and documentation
- ⚡ Fast and responsive interface

## Usage

1. Open the application in your browser
2. Type your coding question or request in the input field
3. Wait for the AI to generate a response
4. Use the "Cancel" button if a request is taking too long

## Troubleshooting

If you encounter any issues:

1. **Model not responding:**
   - Ensure Ollama is running (`ollama serve`)
   - Check if the model is installed (`ollama list`)

2. **Server connection issues:**
   - Verify the server is running
   - Check if the port is available
   - Ensure Ollama is running on the correct port

3. **Performance issues:**
   - Try using a smaller model
   - Adjust the timeout settings in `server/index.js`
   - Clear browser cache

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

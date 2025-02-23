# Ollama WebUI

Ollama WebUI is an open-source browser-based interface for interacting with local AI models. Built with a **Python backend** and **React frontend**, it allows seamless integration with **Ollama** and supports multimodal AI processing, document-based RAG (Retrieval-Augmented Generation), and model selection.

## Features

- **Device Compatibility Check**: Automatically detects if the user's device has Ollama set up before proceeding.
- **Model Selection**: Choose from different local AI models, including multimodal models.
- **RAG with PDF Support**: Query AI using uploaded PDF documents for contextual responses.
- **Web UI**: Intuitive chat-like interface for easy AI interaction.
- **API Support**: Interact with AI models using a built-in API.
- **Privacy-Focused**: All data is processed locally with no cloud dependencies.
- **Lightweight and Fast**: Optimized for low-latency responses.

## Installation

### Pre-requisites
Ensure you have the following installed:
- **Python (>=3.8)** - [Installation Guide](https://www.python.org/downloads/)
- **Node.js (>=16.x)** - [Installation Guide](https://nodejs.org/)
- **Bun** - [Installation Guide](https://bun.sh/)
- **Ollama (Local AI Provider)** - [Installation Guide](https://ollama.ai/)
- **Any OpenAI API Compatible Endpoint** (LM Studio, llamafile, etc.)

### Clone the repository
```bash
git clone https://github.com/your-username/ollama-webui.git
cd ollama-webui
```

### Backend Setup (Python)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r requirements.txt
python app.py  # Start the backend server
```

### Frontend Setup (React + Vite)
```bash
cd frontend
npm install
npm run dev  # Start the frontend development server
```

## Usage

Once the setup is complete, open your browser and go to:
```
http://localhost:5173
```
You can now interact with your local AI models via the Web UI.

## Supported Browsers

| Browser    | Web UI | Model Selection | RAG Support |
|------------|--------|----------------|-------------|
| Chrome     | ✅     | ✅             | ✅          |
| Brave      | ✅     | ✅             | ✅          |
| Firefox    | ✅     | ✅             | ✅          |
| Edge       | ✅     | ✅             | ✅          |
| Vivaldi    | ✅     | ✅             | ✅          |
| LibreWolf  | ✅     | ✅             | ✅          |
| Opera      | ✅     | ❌             | ❌          |
| Arc        | ✅     | ❌             | ❌          |

## API Endpoints

- **`POST /query`** – Send a query to the selected AI model.
- **`POST /upload`** – Upload a PDF for RAG processing.
- **`GET /models`** – Retrieve a list of available AI models.

## Roadmap
- **Enhanced Multimodal Support** (Images, Text & Pdf Processing)
- **Improved UI/UX** with better customization options
- **More AI Model Integrations**
- **Advanced Document Parsing** for RAG queries

## Privacy
Ollama WebUI does not collect any personal data. All processing happens locally on your machine, ensuring complete privacy.

## Contributing
Contributions are welcome! If you have ideas, feature requests, or bug reports, create an issue or submit a pull request.

## Support
If you find this project useful, consider supporting it:
- ⭐ Star the repository
- 🛠️ Contribute to development


## License
MIT




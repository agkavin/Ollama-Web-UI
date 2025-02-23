from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil

#local imports
from pages import ChatPage, SettingsPage
from pydantic_models import *

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

chat_page = ChatPage()

@app.post("/ask", response_model=NormalChatResponse)
async def ask(query: NormalChatRequest):
    try:
        response = chat_page.ask(query.query)
        return NormalChatResponse(text=response)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/get-models", response_model=GetModelsResponse)
async def get_models():
    return chat_page.get_models()

@app.post("/set-model", response_model=SetModelResponse)
async def set_model(model: SetModelRequest):
    try:
        chat_page.set_model(model.model)
        return SetModelResponse(message="Model set successfully")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/get-current-model", response_model=GetCurrentModelResponse)
async def get_current_model():
    return chat_page.get_current_model()

from fastapi import File, UploadFile

# Initialize the upload manager
@app.post("/add-document", response_model=AddDocumentResponse)
async def add_document(file: UploadFile = File(...)):
    # Validate file type (only allow PDFs for now based on the ChatWithFiles implementation)
    if not file.filename.endswith('.pdf'):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are currently supported"
        )
    
    try:
        # Create temp directory if it doesn't exist
        os.makedirs("temp", exist_ok=True)
        
        # Create a temporary file path
        temp_file_path = os.path.join("temp", file.filename)
        
        # Save uploaded file to temporary location
        try:
            with open(temp_file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
        finally:
            file.file.close()  # Ensure file is closed
            
        # Add document to vector store using ChatWithFiles
        success = chat_page.add_document(temp_file_path)
        
        # Clean up temporary file
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
            
        if not success:
            raise HTTPException(
                status_code=500,
                detail="Failed to process document"
            )
            
        return AddDocumentResponse(success=True)
        
    except Exception as e:
        # Clean up temporary file in case of error
        if 'temp_file_path' in locals() and os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        
        raise HTTPException(
            status_code=500,
            detail=f"Error processing document: {str(e)}"
        )
    

    
@app.post("/chat-with-file", response_model=NormalChatResponse)
async def chat_with_file(query: NormalChatRequest):
    try:
        response = chat_page.chat_with_file(query.query)
        return NormalChatResponse(text=response)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/perform-web-search", response_model=WebSearchResponse)
async def perform_web_search(query: NormalChatRequest):
    try:
        # Get raw response from web search
        reply = chat_page.perform_web_search(query.query)
        
        
        
        return WebSearchResponse(reply=reply)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@app.get("/")
async def root():
    return {"message": "This is a backend for Ollama Web UI"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
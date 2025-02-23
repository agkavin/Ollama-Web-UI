from fastapi import FastAPI, HTTPException, File, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil
from pathlib import Path

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
settings_page = SettingsPage()

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
async def set_model(update_model: SetModelRequest):
    try:
        chat_page.set_model(update_model.update_model)
        return SetModelResponse(success=True)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/get-current-model", response_model=GetCurrentModelResponse)
async def get_current_model():
    return chat_page.get_current_model()


@app.post("/add-document", 
          response_model=AddDocumentResponse,
          status_code=status.HTTP_201_CREATED)
async def add_document(file: UploadFile = File(...)):
    # Validate file existence
    if not file:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file uploaded"
        )
    
    # Validate file type
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Only PDF files are currently supported"
        )
    
    try:
        # Create temp directory if it doesn't exist
        temp_dir = Path("temp")
        temp_dir.mkdir(exist_ok=True)
        
        # Generate safe filename and create full path
        safe_filename = file.filename.replace(" ", "_")
        temp_file_path = temp_dir / safe_filename
        
        # Save uploaded file to temporary location
        try:
            with temp_file_path.open("wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
        finally:
            await file.close()  # Ensure file is closed using await
            
        # Process document using ChatWithFiles
        success = chat_page.add_document(str(temp_file_path))
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to process document"
            )
            
        return AddDocumentResponse(
            success=True
        )
        
    except Exception as e:
        # Log the error (you should replace this with proper logging)
        print(f"Error processing document: {str(e)}")
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing document: {str(e)}"
        )
        
    finally:
        # Clean up temporary file
        if 'temp_file_path' in locals() and temp_file_path.exists():
            temp_file_path.unlink()
    
@app.post("/chat-with-file", 
          response_model=ChatWithFileResponse,
          status_code=status.HTTP_200_OK)
async def chat_with_file(request: ChatWithFileRequest):
    if not request.request.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Query cannot be empty"
        )
    
    try:
        # Use the ChatWithFiles instance to get response
        response = chat_page.chat_with_file(request.request)
        
        if not response:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No relevant information found"
            )
            
        return ChatWithFileResponse(response=response)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating response: {str(e)}"
        )

@app.post("/perform-web-search", response_model=WebSearchResponse)
async def perform_web_search(query: NormalChatRequest):
    try:
        # Get raw response from web search
        reply = chat_page.perform_web_search(query.query)
        
        
        
        return WebSearchResponse(reply=reply)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/get-config", 
         response_model=ConfigResponse,
         status_code=status.HTTP_200_OK)
async def get_config():
    try:
        config = settings_page.get_config()
        return ConfigResponse(**config)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.post("/update-config",
         response_model=ConfigResponse,
         status_code=status.HTTP_200_OK)
async def update_config(config: UpdateConfigRequest):
    try:
        settings_page.update_config(
            embedding_model=config.embedding_model,
            num_chunks=config.num_chunks,
            chunk_size=config.chunk_size,
            chunk_overlap=config.chunk_overlap,
            top_k=config.top_k
        )
        # Return the updated configuration
        return ConfigResponse(**settings_page.get_config())
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    
@app.post("/clear-vector-db", 
          response_model=ClearVectorDBResponse,
          status_code=status.HTTP_200_OK)
async def clear_vector_db(request: ClearVectorDBRequest):
    try:
        settings_page.clear_vector_db(request.request)
        return ClearVectorDBResponse(response=True)
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.get("/")
async def root():
    return {"message": "This is a backend for Ollama Web UI"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
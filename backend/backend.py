from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

#local imports
from pages.chat_page import ChatPage
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
    
@app.get("/models", response_model=GetModelsResponse)
async def get_models():
    return chat_page.get_models()



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
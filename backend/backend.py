from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

#local imports
from utils.chat_with_history import ChatWithHistory
from utils.pydantic_models import QueryRequest, QueryResponse

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

chat_history = ChatWithHistory(model="llama3.1")

@app.post("/ask", response_model=QueryResponse)
async def ask(query: QueryRequest):
    try:
        response = chat_history.ask(query.query)
        return QueryResponse(text=response)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
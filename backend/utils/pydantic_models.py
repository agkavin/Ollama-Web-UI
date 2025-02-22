from pydantic import BaseModel
from typing import Optional


# Request/Response models
class QueryRequest(BaseModel):
    query: str

class QueryResponse(BaseModel):
    text: str
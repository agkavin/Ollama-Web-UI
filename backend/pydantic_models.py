from pydantic import BaseModel
from typing import List, Dict


# Request/Response models
class NormalChatRequest(BaseModel):
    query: str

class NormalChatResponse(BaseModel):
    text: str

class GetModelsResponse(BaseModel):
    models: List[str]

class SetModelRequest(BaseModel):
    update_model: str

class SetModelResponse(BaseModel):
    success: bool

class GetCurrentModelResponse(BaseModel):
    get_current_model: str


class AddDocumentResponse(BaseModel):
    success: bool

class WebSearchRequest(BaseModel):
    query: str

class WebSearchResponse(BaseModel):
    reply: str

class ChatWithFileRequest(BaseModel):
    query: str  

class ChatWithFileResponse(BaseModel):
    result: str

class ClearVectorDBRequest(BaseModel):
    clear: str
class ClearVectorDBResponse(BaseModel):
    result: bool
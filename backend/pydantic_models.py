from pydantic import BaseModel
from typing import List, Dict, Any, Optional, Union


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

class WebSearchRequest(BaseModel):
    query: str

class WebSearchResponse(BaseModel):
    reply: str

class AddDocumentResponse(BaseModel):
    success: bool
    # message: Optional[str] = None
    # filename: Optional[str] = None

class ChatWithFileRequest(BaseModel):
    request: str  

class ChatWithFileResponse(BaseModel):
    response: str

class ClearVectorDBRequest(BaseModel):
    request: str
class ClearVectorDBResponse(BaseModel):
    response: bool

class ConfigResponse(BaseModel):
    embedding_model: str
    chunk_size: int
    chunk_overlap: int
    top_k: int

class UpdateConfigRequest(BaseModel):
    embedding_model: Optional[str] = None
    chunk_size: Optional[int] = None
    chunk_overlap: Optional[int] = None
    top_k: Optional[int] = None
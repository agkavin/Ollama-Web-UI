from pydantic import BaseModel
from typing import Optional, List


# Request/Response models
class NormalChatRequest(BaseModel):
    query: str

class NormalChatResponse(BaseModel):
    text: str

class GetModelsResponse(BaseModel):
    models: List[str]
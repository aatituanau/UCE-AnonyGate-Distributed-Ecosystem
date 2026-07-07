from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field

class AIAnalysisResult(BaseModel):
    """
    Pure domain entity that represents the AI analysis result.
    Does not contain persistence logic, only the data structure.
    """
    id: str
    complaintId: str
    aliasToken: str
    summary: str
    urgency: str
    keywords: List[str]
    createdAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        # Pydantic helps us with type validation,
        # but we keep this isolated from infrastructure (MongoDB, APIs)
        pass

from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field

class AIAnalysisResult(BaseModel):
    """
    Entidad pura del dominio que representa el resultado del análisis de IA.
    No contiene lógica de persistencia, solo la estructura de datos.
    """
    id: str
    aliasToken: str
    summary: str
    urgency: str
    keywords: List[str]
    createdAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        # Pydantic nos ayuda con la validación de tipos, 
        # pero mantenemos esto aislado de la infraestructura (MongoDB, APIs)
        pass

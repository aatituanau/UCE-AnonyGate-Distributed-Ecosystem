from abc import ABC, abstractmethod
from typing import Dict, Any
from .entities import AIAnalysisResult

class NLPInferencePort(ABC):
    """
    Puerto (interfaz) para llamar al modelo NLP (HuggingFace).
    """
    @abstractmethod
    async def summarize_text(self, text: str) -> str:
        pass

class AIAnalysisRepositoryPort(ABC):
    """
    Puerto (interfaz) para guardar el resultado del análisis en BD.
    """
    @abstractmethod
    async def save(self, result: AIAnalysisResult) -> None:
        pass
        
    @abstractmethod
    async def find_by_complaint_id(self, complaint_id: str) -> AIAnalysisResult | None:
        pass

class AnalysisResultProducerPort(ABC):
    """
    Puerto (interfaz) para emitir el evento a RabbitMQ (hacia MS-08).
    """
    @abstractmethod
    async def publish_result(self, result: AIAnalysisResult) -> None:
        pass

class AuditProducerPort(ABC):
    """
    Puerto (interfaz) para emitir evento a Kafka (hacia MS-10 Audit).
    """
    @abstractmethod
    async def publish_audit_event(self, event_type: str, payload: Dict[str, Any]) -> None:
        pass

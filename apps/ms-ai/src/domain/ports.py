from abc import ABC, abstractmethod
from typing import Dict, Any
from .entities import AIAnalysisResult

class NLPInferencePort(ABC):
    """
    Port (interface) to call the NLP model (HuggingFace).
    """
    @abstractmethod
    async def summarize_text(self, text: str) -> str:
        pass

class AIAnalysisRepositoryPort(ABC):
    """
    Port (interface) to save the analysis result in DB.
    """
    @abstractmethod
    async def save(self, result: AIAnalysisResult) -> None:
        pass
        
    @abstractmethod
    async def find_by_complaint_id(self, complaint_id: str) -> AIAnalysisResult | None:
        pass

class AnalysisResultProducerPort(ABC):
    """
    Port (interface) to emit the event to RabbitMQ (towards MS-08).
    """
    @abstractmethod
    async def publish_result(self, result: AIAnalysisResult) -> None:
        pass

class AuditProducerPort(ABC):
    """
    Port (interface) to emit event to Kafka (towards MS-10 Audit).
    """
    @abstractmethod
    async def publish_audit_event(self, event_type: str, payload: Dict[str, Any]) -> None:
        pass

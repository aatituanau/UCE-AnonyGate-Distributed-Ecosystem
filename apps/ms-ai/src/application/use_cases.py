import uuid
import re
from typing import List, Dict, Any
from src.domain.entities import AIAnalysisResult
from src.domain.ports import (
    NLPInferencePort,
    AIAnalysisRepositoryPort,
    AnalysisResultProducerPort,
    AuditProducerPort
)

class AnalyzeComplaintUseCase:
    """
    Caso de uso que orquesta el análisis de la denuncia.
    Recibe los datos, determina la urgencia basándose en palabras clave,
    llama a la IA para resumir, guarda el resultado y emite eventos.
    """
    def __init__(
        self,
        nlp_port: NLPInferencePort,
        repository_port: AIAnalysisRepositoryPort,
        result_producer_port: AnalysisResultProducerPort,
        audit_producer_port: AuditProducerPort
    ):
        self.nlp_port = nlp_port
        self.repository_port = repository_port
        self.result_producer_port = result_producer_port
        self.audit_producer_port = audit_producer_port

    async def execute(self, complaint_id: str, alias_token: str, text: str) -> AIAnalysisResult:
        # 1. Analizar keywords y determinar urgencia
        keywords, urgency = self._classify_urgency(text)

        # 2. Llamar a la inferencia de HuggingFace para resumir el texto
        # (Si falla o devuelve vacío, podríamos hacer un fallback, pero asumiremos que el adaptador maneja los errores)
        summary = await self.nlp_port.summarize_text(text)

        # 3. Crear entidad del resultado
        result = AIAnalysisResult(
            id=str(uuid.uuid4()),
            complaintId=complaint_id,
            aliasToken=alias_token,
            summary=summary,
            urgency=urgency,
            keywords=keywords
        )

        # 4. Guardar en MongoDB
        await self.repository_port.save(result)

        # 5. Emitir el resultado a RabbitMQ (para MS-08)
        await self.result_producer_port.publish_result(result)

        # 6. Emitir evento de auditoría a Kafka (para MS-10)
        audit_payload = {
            "complaintId": complaint_id,
            "analysisId": result.id,
            "urgency": result.urgency,
            "action": "AI_ANALYSIS_COMPLETED"
        }
        await self.audit_producer_port.publish_audit_event("ai.analysis.completed", audit_payload)

        return result

    def _classify_urgency(self, text: str) -> tuple[List[str], str]:
        """
        Lógica interna simple para clasificar la urgencia por palabras clave.
        """
        text_lower = text.lower()
        found_keywords = []
        
        # Diccionario de urgencias (simulado)
        # CRITICAL overrides HIGH
        critical_keywords = ["muerte", "violencia", "abuso fisico", "arma"]
        high_keywords = ["corrupción", "acoso", "robo", "soborno", "amenaza"]
        medium_keywords = ["fraude", "discriminacion", "negligencia"]
        
        urgency = "LOW"
        
        # Buscamos en el texto
        for kw in critical_keywords:
            if kw in text_lower:
                found_keywords.append(kw)
                urgency = "CRITICAL"
                
        for kw in high_keywords:
            if kw in text_lower:
                found_keywords.append(kw)
                if urgency not in ["CRITICAL"]:
                    urgency = "HIGH"
                    
        for kw in medium_keywords:
            if kw in text_lower:
                found_keywords.append(kw)
                if urgency not in ["CRITICAL", "HIGH"]:
                    urgency = "MEDIUM"
                    
        # Limpiar duplicados y retornar
        return list(set(found_keywords)), urgency

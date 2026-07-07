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
from src.application.local_summarizer import local_fallback_summary

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
        import json
        clean_text = text
        try:
            parsed = json.loads(text)
            if isinstance(parsed, dict):
                parts = []
                for k, v in parsed.items():
                    if isinstance(v, str):
                        parts.append(v.strip().strip('.') + ".")
                    elif isinstance(v, dict):
                        for sub_v in v.values():
                            if isinstance(sub_v, str):
                                parts.append(sub_v.strip().strip('.') + ".")
                clean_text = " ".join(parts)
        except Exception:
            pass

        # 1. Analyze keywords and determine urgency
        keywords, urgency = self._classify_urgency(clean_text)

        # 2. Call HuggingFace inference to summarize the text
        summary = await self.nlp_port.summarize_text(clean_text)

        # If HuggingFace fails (e.g. DNS or local network block), we activate
        # the Contingency Protocol to generate an elegant summary based on keywords.
        if summary.startswith("Error generating summary") or summary == "Could not generate summary.":
            local_sum = local_fallback_summary(clean_text)
            summary = local_sum

        # 3. Create result entity
        result = AIAnalysisResult(
            id=str(uuid.uuid4()),
            complaintId=complaint_id,
            aliasToken=alias_token,
            summary=summary,
            urgency=urgency,
            keywords=keywords
        )

        # 4. Save AI Insights in MongoDB (MS-07 DB)
        await self.repository_port.save(result)

        # 5. Emit rabbitmq event so MS-08 (Status) updates its PostgreSQL with the new urgency
        await self.result_producer_port.publish_result(result)

        # 6. Emit kafka event for MS-10 (Audit) to register the immutable action
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
        Internal logic to classify urgency by keywords.
        """
        text_lower = text.lower()
        found_keywords = []
        
        # Urgency dictionary (simulated)
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

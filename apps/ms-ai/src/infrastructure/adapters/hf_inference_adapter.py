import httpx
from src.domain.ports import NLPInferencePort

class HuggingFaceInferenceAdapter(NLPInferencePort):
    """
    Adaptador para conectarse a la API de Inferencia de HuggingFace.
    """
    def __init__(self, api_token: str, model_id: str = "facebook/bart-large-cnn"):
        self.api_token = api_token
        # Se recomendó facebook/bart-base o facebook/bart-large-cnn para resumen
        self.api_url = f"https://api-inference.huggingface.co/models/{model_id}"
        self.headers = {"Authorization": f"Bearer {self.api_token}"}

    async def summarize_text(self, text: str) -> str:
        payload = {
            "inputs": text,
            "parameters": {"max_length": 130, "min_length": 30, "do_sample": False}
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(self.api_url, headers=self.headers, json=payload, timeout=20.0)
                response.raise_for_status()
                data = response.json()
                
                # HuggingFace suele devolver una lista con un dict
                if isinstance(data, list) and len(data) > 0 and "summary_text" in data[0]:
                    return data[0]["summary_text"]
                return "No se pudo generar el resumen."
            except Exception as e:
                # En un entorno real, registraríamos el error en un logger
                print(f"[Error en HuggingFace NLP] {str(e)}")
                return f"Error al generar el resumen: {str(e)}"

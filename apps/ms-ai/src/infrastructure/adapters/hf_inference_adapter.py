import httpx
import asyncio
from src.domain.ports import NLPInferencePort

class HuggingFaceInferenceAdapter(NLPInferencePort):
    """
    Adapter to connect to HuggingFace Inference API.
    """
    def __init__(self, api_token: str, model_id: str = "facebook/bart-large-cnn"):
        self.api_token = api_token
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
                # If model is loading, HuggingFace returns 503
                if response.status_code == 503:
                    error_data = response.json()
                    if "estimated_time" in error_data:
                        wait_time = error_data["estimated_time"]
                        print(f"[*] HuggingFace model is loading. Waiting {wait_time} seconds...")
                        await asyncio.sleep(min(wait_time, 15)) # wait max 15s to avoid timeout
                        # Retry once
                        response = await client.post(self.api_url, headers=self.headers, json=payload, timeout=20.0)
                        response.raise_for_status()
                        data = response.json()
                        if isinstance(data, list) and len(data) > 0 and "summary_text" in data[0]:
                            return data[0]["summary_text"]
                            
                response.raise_for_status()
                data = response.json()
                
                # HuggingFace usually returns a list with a dict
                if isinstance(data, list) and len(data) > 0 and "summary_text" in data[0]:
                    return data[0]["summary_text"]
                return "Could not generate summary."
            except Exception as e:
                # In a real environment, we would log the error
                print(f"[HuggingFace NLP Error] {str(e)}")
                return f"Error generating summary: {str(e)}"

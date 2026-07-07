import os
from dotenv import load_dotenv
import urllib.request
import urllib.error

load_dotenv()
token = os.getenv('HF_API_TOKEN')

req = urllib.request.Request(
    'https://router.huggingface.co/hf-inference/models/facebook/bart-base',
    headers={'Authorization': 'Bearer ' + token},
    method='POST',
    data=b'{"inputs":"Esto es un texto de prueba muy largo sobre un fraude."}'
)

try:
    res = urllib.request.urlopen(req)
    print(res.read()[:100])
except urllib.error.HTTPError as e:
    print(e.code, e.read())
except Exception as e:
    print(e)

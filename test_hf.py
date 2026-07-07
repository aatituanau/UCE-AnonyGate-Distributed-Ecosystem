import urllib.request
import urllib.error
import json
import os

req = urllib.request.Request(
    'https://router.huggingface.co/hf-inference/models/mrm8488/bert2bert_shared-spanish-finetuned-summarization',
    headers={'Authorization': 'Bearer ' + os.environ.get('HF_TEST', 'hf_test')},
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

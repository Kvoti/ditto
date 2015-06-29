import json
import requests

# list case notes
r = requests.get(
    'http://localhost:8000/di/api/casenotes/',
)
print r, r.text

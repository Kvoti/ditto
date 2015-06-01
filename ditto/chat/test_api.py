import json
import requests


"""r = requests.post(
    'http://localhost:8000/di/ratings/',
    data=json.dumps({
        'session_id': 'session:mark:ross:test',
        'ratings': [
            {'user': 'mark'}
        ]
    }),
    headers={'content-type': 'application/json'}
)

print r.text


r = requests.get(
    'http://localhost:8000/di/ratings/session:mark:ross:test/',
)
print r.text"""


r = requests.put(
    'http://localhost:8000/di/ratings/session:mark:ross:test/',
    data=json.dumps(
        {'rating': 4}
    ),
    headers={'content-type': 'application/json'}
)
print r, r.text

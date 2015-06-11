import json
import requests


# list chatrooms
r = requests.get(
    'http://localhost:8000/di/api/chat/rooms/',
)
# delete test chatrooms
for room in r.json():
    r = requests.delete(
        'http://localhost:8000/di/api/chat/rooms/%s' % room['slug']
    )
    print r, r.text

# create bare chatroom
r = requests.post(
    'http://localhost:8000/di/api/chat/rooms/',
    data=json.dumps({
        'slug': 'test',
        'name': 'test chatroom'
    }),
    headers={'content-type': 'application/json'}
)
print r, r.text

r = requests.post(
    'http://localhost:8000/di/api/chat/rooms/',
    data=json.dumps({
        'slug': 'test1',
        'name': 'test chatroom',
        'users': ['fred'],
    }),
    headers={'content-type': 'application/json'}
)
print r, r.text

r = requests.post(
    'http://localhost:8000/di/api/chat/rooms/',
    data=json.dumps({
        'slug': 'test1',
        'name': 'test chatroom',
        'users': ['ross', 'mark'],
        'roles': ['Administrator'],
    }),
    headers={'content-type': 'application/json'}
)
print r, r.text


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
print r.text


r = requests.put(
    'http://localhost:8000/di/ratings/session:mark:ross:test/',
    data=json.dumps(
        {'rating': 4}
    ),
    headers={'content-type': 'application/json'}
)
print r, r.text
"""

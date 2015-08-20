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

# add some slots
r = requests.post(
    'http://localhost:8000/di/api/chat/slots/',
    data=json.dumps({
        'room': 'test',
        'day': 0,
        'start': 8,
        'end': 15,
    }),
    headers={'content-type': 'application/json'}
)
print r, r.text
sid = r.json()['id']
r = requests.put(
    'http://localhost:8000/di/api/chat/slots/%s/' % sid,
    data=json.dumps({
        'day': 0,
        'start': 9,
        'end': 12,
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

r = requests.post(
    'http://localhost:8000/di/api/chat/rooms/',
    data=json.dumps({
        'slug': 'test2',
        'name': 'test chatroom',
        'users': ['ross', 'mark'],
        'roles': ['Administrator'],
        'start': 'xxxx',
    }),
    headers={'content-type': 'application/json'}
)
print r, r.text

r = requests.post(
    'http://localhost:8000/di/api/chat/rooms/',
    data=json.dumps({
        'slug': 'test2',
        'name': 'test chatroom',
        'users': ['ross', 'mark'],
        'roles': ['Administrator'],
        'start': '2015-06-20T08:00',
    }),
    headers={'content-type': 'application/json'}
)
print r, r.text

r = requests.post(
    'http://localhost:8000/di/api/chat/rooms/',
    data=json.dumps({
        'slug': 'test2',
        'name': 'test chatroom',
        'users': ['ross', 'mark'],
        'roles': ['Administrator'],
        'start': '2015-06-20T08:00',
        'end': '2015-06-20T15:00',
    }),
    headers={'content-type': 'application/json'}
)
print r, r.text

r = requests.post(
    'http://localhost:8000/di/api/chat/rooms/',
    data=json.dumps({
        'slug': 'test3',
        'name': 'test chatroom',
        'users': ['ross', 'mark'],
        'roles': ['Administrator'],
        'end': '2015-06-20T08:00',
        'start': '2015-06-20T15:00',
    }),
    headers={'content-type': 'application/json'}
)
print r, r.text

r = requests.post(
    'http://localhost:8000/di/api/chat/rooms/',
    data=json.dumps({
        'slug': 'test3',
        'name': 'test chatroom',
        'users': ['ross', 'mark'],
        'roles': ['Administrator'],
        'start': '2015-06-20T08:00',
        'end': '2015-06-20T15:00',
        'slots': [
            {
                'day': 0,
                'start': 8,
                'end': 22
            }
        ]
    }),
    headers={'content-type': 'application/json'}
)
print r, r.text

r = requests.post(
    'http://localhost:8000/di/api/chat/rooms/',
    data=json.dumps({
        'slug': 'test4',
        'name': 'test chatroom',
        'users': ['ross', 'mark'],
        'roles': ['Administrator'],
        'slots': [
            {
                'day': 0,
                'start': 8,
                'end': 22
            }
        ]
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

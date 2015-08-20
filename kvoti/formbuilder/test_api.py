import requests

r = requests.get('http://localhost:8000/di/api/formbuilder/')

print r, r.text


import json
import requests

r = requests.post(
    'http://localhost:8000/di/api/comments/casenote/1/',
    data=json.dumps({
        'name': 'test',
        'email': 'test@example.com',
    }),
    headers={'content-type': 'application/json'},
    # cookies={
    #     'sessionid': 'vkbpxqvz77x3aul7tumf36ir5el9ngtj',
    # }
)
print r, r.text

"""
from django.contrib.auth.models import AnonymousUser, Permission, Group
from django.core.urlresolvers import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIRequestFactory

from users.models import User

from . import api


class CommentTests(APITestCase):
    urls = 'comments.api'

    def setUp(self):
        super(CommentTests, self).setUp()
        self.factory = APIRequestFactory()
        
    def test_case_note_list_forbidden_for_anon_user(self):
        url = reverse('create_comment')
        request = self.factory.get(url)
        response = api.create_comment(request).render()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
"""

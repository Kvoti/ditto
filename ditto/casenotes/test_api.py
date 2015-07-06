from django.contrib.auth.models import AnonymousUser, Permission, Group
from django.core.urlresolvers import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIRequestFactory

from users.models import User

from . import api
from . import models


class CaseNoteTests(APITestCase):
    urls = 'casenotes.api'

    def setUp(self):
        super(CaseNoteTests, self).setUp()
        self.factory = APIRequestFactory()
        
    def test_case_note_list_forbidden_for_anon_user(self):
        """
        Ensure anonymous users can't access the case note list
        """
        url = reverse('casenote_list')
        request = self.factory.get(url)
        request.user = AnonymousUser()
        response = api.CaseNotesList.as_view()(request).render()
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_authenticated_user_can_access_case_note_list(self):
        """
        Ensure authenticated users can access the case note list
        """
        url = reverse('casenote_list')
        request = self.factory.get(url)
        user = User.objects.create_user(username="user")
        request.user = user
        response = api.CaseNotesList.as_view()(request).render()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])

    def test_no_notes_listed_for_non_priveleged_user(self):
        client = User.objects.create_user(username="client")
        author = User.objects.create_user(username="author")
        models.CaseNote.objects.create(client=client, author=author)
        url = reverse('casenote_list')
        request = self.factory.get(url)
        request.user = client
        response = api.CaseNotesList.as_view()(request).render()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])
        
    def test_author_can_access_note(self):
        client = User.objects.create_user(username="client")
        author = User.objects.create_user(username="author")
        models.CaseNote.objects.create(client=client, author=author)
        url = reverse('casenote_list')
        request = self.factory.get(url)
        request.user = author
        response = api.CaseNotesList.as_view()(request).render()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_user_with_view_perm_can_access_note(self):
        client = User.objects.create_user(username="client")
        author = User.objects.create_user(username="author")
        models.CaseNote.objects.create(client=client, author=author)
        other = User.objects.create_user(username="other")
        other.user_permissions.add(Permission.objects.get(codename="view_casenote"))
        url = reverse('casenote_list')
        request = self.factory.get(url)
        request.user = other
        response = api.CaseNotesList.as_view()(request).render()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        
    def test_user_note_shared_with_directly_can_access_note(self):
        client = User.objects.create_user(username="client")
        author = User.objects.create_user(username="author")
        other = User.objects.create_user(username="other")
        note = models.CaseNote.objects.create(client=client, author=author)
        note.shared_with_users.add(other)
        url = reverse('casenote_list')
        request = self.factory.get(url)
        request.user = other
        response = api.CaseNotesList.as_view()(request).render()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_user_note_shared_with_by_role_can_access_note(self):
        client = User.objects.create_user(username="client")
        author = User.objects.create_user(username="author")
        other = User.objects.create_user(username="other")
        note = models.CaseNote.objects.create(client=client, author=author)
        group = Group.objects.create(name="group")
        note.shared_with_roles.add(group)
        other.groups.add(group)
        url = reverse('casenote_list')
        request = self.factory.get(url)
        request.user = other
        response = api.CaseNotesList.as_view()(request).render()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        

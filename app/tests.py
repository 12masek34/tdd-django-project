from django.urls import resolve
from django.test import TestCase
from django.http import HttpRequest

from app.views import index


class HomePageTest(TestCase):

    def test_home_page_resolved_to_index_view(self):
        found = resolve('/')
        self.assertEqual(found.func, index)
        request = HttpRequest()
        response = index(request)
        html = response.content.decode('utf-8')
        self.assertTrue(html.startswith('<html>'))
        self.assertIn('<title>To-Do</title>', html)
        self.assertTrue(html.endswith('</html>'))
        

from django.test import TestCase
from app.views import index

class HomePageTest(TestCase):

    def test_can_save_a_post_request(self):
        response = self.client.post('/', data={'item_text': 'a new list item'})
        self.assertIn('a new list item', response.content.decode())
        self.assertTemplateUsed(response, 'index.html')

from http import HTTPStatus

from django.test import TestCase
from app.views import index

from app.models import Item

class HomePageTest(TestCase):

    def test_can_save_a_post_request(self):
        response = self.client.post('/', data={'item_text': 'a new list item'})

        self.assertEqual(Item.objects.count(), 1)
        new_item = Item.objects.first()
        self.assertEqual(new_item.text, 'a new list item')

        self.assertIn('a new list item', response.content.decode())
        self.assertTemplateUsed(response, 'index.html')

        self.assertEqual(response.status_code, HTTPStatus.FOUND)
        self.assertEqual(response['location'], '/')


class ItemModelTest(TestCase):

    def test_save_and_retrive_items(self):
        first_item = Item()
        first_item.text = 'the first (ever) list item'
        first_item.save()
        second_item = Item()
        second_item.text = 'second item'
        second_item.save()

        saved_items = Item.objects.all()
        self.assertEqual(saved_items.count(), 2)
        first_saved = saved_items[0]
        second_saved = saved_items[1]
        self.assertEqual(first_saved.text, 'the first (ever) list item')
        self.assertEqual(second_saved.text , 'second item')

    def test_only_save_items_when_necessary(self):
        self.client.get('/')
        self.assertEqual(Item.objects.count(), 0)

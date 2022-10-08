from http import HTTPStatus

from django.test import TestCase
from app.views import index

from app.models import Item

class HomePageTest(TestCase):

    def test_can_save_a_POST_request(self):
        self.client.post('/', data={'item_text': 'a new list item'})
        self.assertEqual(Item.objects.count(), 1)
        new_item = Item.objects.first()
        self.assertEqual(new_item.text, 'a new list item')


    def test_redirect_after_post(self):
        response = self.client.post('/', data={'item_text': 'a new list item'})
        self.assertEqual(response.status_code, HTTPStatus.FOUND)
        self.assertEqual(response['location'], '/lists/some-text/')

    def test_display_all_list_item(self):
        Item.objects.create(text='item1')
        Item.objects.create(text='item2')

        response = self.client.get('/lists/some-text/')

        self.assertIn('item1', response.content.decode())
        self.assertIn('item2', response.content.decode())

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


class ListViewTest(TestCase):

    def test_uses_list_template(self):
        response = self.client.get('/lists/some-text/')
        self.assertTemplateUsed(response, 'list.html')

    
    def test_display_all_list_item(self):
       Item.objects.create(text='item1')
       Item.objects.create(text='item2')

       response = self.client.get('/lists/some-text/')

       self.assertContains(response, 'item1')
       self.assertContains(response, 'item2')

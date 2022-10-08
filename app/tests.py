from http import HTTPStatus

from django.test import TestCase

from app.models import Item, List

class HomePageTest(TestCase):
    pass


class ListAndItemModelsTest(TestCase):


    def test_save_and_retrive_items(self):
        list_ = List()
        list_.save()

        first_item = Item()
        first_item.text = 'the first (ever) list item'
        first_item.list = list_
        first_item.save()

        second_item = Item()
        second_item.text = 'second item'
        second_item.list =  list_
        second_item.save()

        saved_list = List.objects.first()
        self.assertEqual(saved_list, list_)

        saved_items = Item.objects.all()
        self.assertEqual(saved_items.count(), 2)
        first_saved = saved_items[0]
        second_saved = saved_items[1]
        self.assertEqual(first_saved.text, 'the first (ever) list item')
        self.assertEqual(first_saved.list, list_)
        self.assertEqual(second_saved.list, list_)
        self.assertEqual(second_saved.text , 'second item')


class ListViewTest(TestCase):

    def test_uses_list_template(self):
        response = self.client.get('/lists/some-text/')
        self.assertTemplateUsed(response, 'list.html')

    
    def test_display_all_list_item(self):
        list_ = List.objects.create()

        Item.objects.create(text='item1', list=list_)
        Item.objects.create(text='item2', list=list_)

        response = self.client.get('/lists/some-text/')

        self.assertContains(response, 'item1')
        self.assertContains(response, 'item2')


class NewListTest(TestCase):

    def test_can_save_a_POST_request(self):
        self.client.post('/lists/new', data={'item_text': 'a new list item'})
        self.assertEqual(Item.objects.count(), 1)
        new_item = Item.objects.first()
        self.assertEqual(new_item.text, 'a new list item')


    def test_redirect_after_post(self):
        response = self.client.post('/lists/new', data={'item_text': 'a new list item'})
        self.assertEqual(response.status_code, HTTPStatus.FOUND)
        self.assertEqual(response['location'], '/lists/some-text/')

    def test_redirection_after_post(self):
        response = self.client.post('/lists/new', data={'item_text': 'A new item text'})
        self.assertRedirects(response, '/lists/some-text/')
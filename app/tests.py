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
        list_ = List.objects.create()
        response = self.client.get(f'/lists/{list_.id}/')
        self.assertTemplateUsed(response, 'list.html')

    
    def test_display_only_item_for_that_list(self):
        correct_list = List.objects.create()

        Item.objects.create(text='item1', list=correct_list)
        Item.objects.create(text='item2', list=correct_list)
        other_list = List.objects.create()
        Item.objects.create(text='any text1', list=other_list)
        Item.objects.create(text='any text2', list=other_list)

        response = self.client.get(f'/lists/{correct_list.id}/')
        self.assertContains(response, 'item1')
        self.assertContains(response, 'item2')
        self.assertNotContains(response, 'any text1')
        self.assertNotContains(response, 'any text2')


    def test_passes_correct_list_to_template(self):
        other_list = List.objects.create()
        correct_list = List.objects.create()
        response = self.client.get(f'/lists/{correct_list.id}/')
        self.assertEqual(response.context['list'], correct_list)


class NewListTest(TestCase):

    def test_can_save_a_POST_request(self):
        self.client.post('/lists/new', data={'item_text': 'a new list item'})
        self.assertEqual(Item.objects.count(), 1)
        new_item = Item.objects.first()
        self.assertEqual(new_item.text, 'a new list item')


    def test_redirection_after_post(self):
        response = self.client.post('/lists/new', data={'item_text': 'A new item text'})
        list_ = List.objects.first()
        self.assertRedirects(response, f'/lists/{list_.id}/')


class NewItemTest(TestCase):

    def test_can_save_a_post_request_to_an_existing_list(self):
        other_list = List.objects.create()
        correct_list = List.objects.create()

        self.client.post(
            f'/lists/{correct_list.id}/add_item',
            data={'item_text': 'A new item for an existing list'},
        )
        self.assertEqual(Item.objects.count(), 1)
        new_item = Item.objects.first()
        self.assertEqual(new_item.text, 'A new item for an existing list')
        self.assertEqual(new_item.list, correct_list)


    def test_redirect_to_list_view(self):
        other_list = List.objects.create()
        correct_list = List.objects.create()

        response = self.client.post(
            f'/lists/{correct_list.id}/add_item',
            data={'item_text': 'A new item for an existing list'},
        )
        self.assertRedirects(response, f'/lists/{correct_list.id}/')

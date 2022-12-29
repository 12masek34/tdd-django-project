import os
import time

from django.contrib.staticfiles.testing import StaticLiveServerTestCase
from selenium import webdriver
from selenium.common.exceptions import WebDriverException
from selenium.webdriver.common.keys import Keys

MAX_WAIT = 10


class NewVisitorTest(StaticLiveServerTestCase):
    """
    Тест нового постетителя.
    """

    def setUp(self):
        self.browser = webdriver.Firefox(
           executable_path='/Users/dmitrijmartys/Python/test/core/geckodriver')
        staging_server = os.environ.get('STAGING_SERVER')
        if staging_server:
            self.live_server_url = 'http://' + staging_server

    def tearDown(self):
        self.browser.close()

    def wait_for_row_in_list_table(self, row_text):
        start_time = time.time()
        while True:
            try:
                table = self.browser.find_element('id', 'id_list_table')
                rows = table.find_elements('tag name', 'tr')
                self.assertIn(row_text, [row.text for row in rows])
                return
            except(AssertionError, WebDriverException) as e:
                if time.time() - start_time > MAX_WAIT:
                    raise e
                time.sleep(0.5)

    def test_can_start_a_list_for_one_user(self):
        self.browser.get(self.live_server_url)
        self.assertIn('To-Do', self.browser.title)
        header_text = self.browser.find_element('tag name', 'h1').text
        self.assertIn('To-Do', header_text)
        input_box = self.browser.find_element('id', 'id_new_item')
        self.assertEqual(
            input_box.get_attribute('placeholder'),
            'Enter a to-do item',
        )
        input_box.send_keys('Купить павлиньи перья')
        input_box.send_keys(Keys.ENTER)
        self.wait_for_row_in_list_table('1: Купить павлиньи перья')
        time.sleep(1)

        input_box = self.browser.find_element('id', 'id_new_item')
        input_box.send_keys('Сделать мушку из павлиньих перьев')
        input_box.send_keys(Keys.ENTER)
        time.sleep(1)

        self.wait_for_row_in_list_table('1: Купить павлиньи перья')
        self.wait_for_row_in_list_table('2: Сделать мушку из павлиньих перьев')

        self.fail('Закончить тест')


    def test_mulriple_user_can_start_lists_at_different_urls(self):
        self.browser.get(self.live_server_url)
        input_box = self.browser.find_element('id', 'id_new_item')
        input_box.send_keys('Купить павлиньи перья')
        input_box.send_keys(Keys.ENTER)
        self.wait_for_row_in_list_table('1: Купить павлиньи перья')

        edith_list_url = self.browser.current_url
        self.assertRegex(edith_list_url, '/lists/.+')

        self.browser.quit()
        self.browser = webdriver.Firefox(
           executable_path='/Users/dmitrijmartys/Python/test/core/geckodriver')

        self.browser.get(self.live_server_url)
        page_text1 = self.browser.find_element('tag name', 'body').text
        self.assertNotIn('Купить павлиньи перья', page_text1)
        self.assertNotIn('Сделать мушку из павлиньих перьев', page_text1)

        input_box = self.browser.find_element('id', 'id_new_item')
        input_box.send_keys('Купить молоко')
        input_box.send_keys(Keys.ENTER)
        self.wait_for_row_in_list_table('1: Купить молоко')

        francis_list_url = self.browser.current_url
        self.assertRegex(francis_list_url, '/lists/.+')
        self.assertNotEqual(francis_list_url, edith_list_url)

        page_text2 = self.browser.find_element('tag name', 'body').text
        self.assertNotIn('Купить павлиньи перья', page_text2)
        self.assertNotIn('Купить молоко', page_text1)


    def test_layout_and_styling(self):
        self.browser.get(self.live_server_url)
        self.browser.set_window_size(1024, 768)

        input_box = self.browser.find_element('id', 'id_new_item')
        self.assertAlmostEqual(
            input_box.location['x'] + input_box.size['width'] / 2,
            512,
            delta=10,
        )
        input_box.send_keys('testing')
        input_box.send_keys(Keys.ENTER)
        self.wait_for_row_in_list_table('1: testing')
        input_box = self.browser.find_element('id', 'id_new_item')
        self.assertAlmostEqual(
            input_box.location['x'] + input_box.size['width'] / 2,
            512,
            delta=10,
        )
# test3 commit
import time
import unittest

from selenium import webdriver
from selenium.webdriver.common.keys import Keys

class NewVisitorTest(unittest.TestCase):
    """
    Тест нового постетителя.
    """

    def setUp(self):
        self.browser = webdriver.Firefox(
           executable_path='/Users/dmitrijmartys/Python/test/core/geckodriver')

    def tearDown(self):
        self.browser.close()

    def test_can_start_a_list_and_retrieve_it_later(self):
        self.browser.get('http://127.0.0.1:8000')
        self.assertIn('To-Do', self.browser.title)
        header_text = self.browser.find_element('tag name', 'h1').text
        self.assertIn('To-Do', header_text)
        input_box = self.browser.find_element('id', 'id_new_item')
        self.assertEqual(
            input_box.get_attribute('placeholder'),
            'Enter a To-Do item',
        )
        input_box.send_keys('1: Купить павлиньи перья')
        input_box.send_keys(Keys.ENTER)
        time.sleep(1)
        table = self.browser.find_element('id', 'id_list_table')
        rows = table.find_elements('tag name', 'tr')
        self.assertIn('1: Купить павлиньи перья', [row.text for row in rows])
        self.fail('Закончить тест')


if __name__ == '__main__':
    unittest.main(warnings='ignore')

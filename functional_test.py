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
        header_text = self.browser.find_element_by_tag_name('h1').text
        self.assertIn('HI', header_text)
        input_box = self.browser.find_element_by_id('id_new_item')
        self.assertEqual(
            input_box.get_attribute('placeholder'),
            'Enter a To-Do item',
        )
        input_box.send_keys('Купить павлиньи перья')
        time.sleep(1)
        input_box.send_keys(Keys.ENTER)
        table = self.browser.find_element_by_id('id_list_table')
        rows = table.find_elements_by_tag_name('tr')
        self.assertTrue(
            any(row.text == '1: Купить павлиньи перья' for row in rows)
        )
        self.fail('Закончить тест')


if __name__ == '__main__':
    unittest.main(warnings='ignore')

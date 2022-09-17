from selenium import webdriver
import unittest


class NewVisitorTest(unittest.TestCase):
    """
    Тест нового постетителя.
    """

    def setUp(self):
        self.browser = webdriver.Firefox(
           executable_path='/Users/dmitrijmartys/Python/test/core/geckodriver')

<<<<<<< HEAD
browser.close()
=======
    def tearDown(self):
        self.browser.close()

    def test_can_start_a_list_and_retrieve_it_later(self):
        self. browser.get('http://127.0.0.1:8000')
        self.assertIn('To-Do', self.browser.title)
        self.fail('Exit')


if __name__ == '__main__':
    unittest.main(warnings='ignore')

>>>>>>> master

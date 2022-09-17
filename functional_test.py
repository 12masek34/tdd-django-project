from selenium import webdriver

browser = webdriver.Firefox(
    executable_path='/Users/dmitrijmartys/Python/test/core/geckodriver')

browser.get('http://127.0.0.1:8000')

assert 'Django' in browser.title

browser.close()


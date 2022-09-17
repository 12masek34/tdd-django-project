from selenium import webdriver

browser = webdriver.Firefox(
    executable_path='/Users/dmitrijmartys/Python/test/core/geckodriver')

browser.get("http://www.python.org")
print(browser.title)
browser.close()

from django.urls import resolve
from django.test import TestCase

from app.views import index


class SmoeTest(TestCase):

    def test_bad_math(self):
        found = resolve('/')
        self.assertEqual(found.func, index)

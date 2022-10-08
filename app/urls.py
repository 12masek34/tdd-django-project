from django.urls import path
from .views import index, view_list, view_new


urlpatterns = [
    path('', index, name='index'),
    path('lists/new', view_new, name='new_list'),
    path('lists/some-text/', view_list, name='view_list'),
]

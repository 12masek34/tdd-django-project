from django.urls import path
from .views import index, view_list

urlpatterns = [
    path('', index, name='index'),
    path('lists/some-text/', view_list, name='view_list'),
]

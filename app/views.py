from django.http import HttpResponse
import pdb

def index(request):
    """
    Тестовая функция.
    """
    
    return HttpResponse(f'<h1>{x}<h1>')
 

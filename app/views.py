from django.http import HttpResponse
import pdb

def index(request):
    x = 0
    return HttpResponse(f'<h1>{x}<h1>')

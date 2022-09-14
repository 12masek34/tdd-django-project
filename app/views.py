from django.http import HttpResponse
import pdb

def index(request):
    x = 0

    some = 'some'
    a = 'x'
    return HttpResponse(f'<h1>{x}<h1>')

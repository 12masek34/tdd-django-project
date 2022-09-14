from django.http import HttpResponse
import pdb

def index(request):
    pdb.set_trace()
    return HttpResponse(f'<h1>{x}<h1>')

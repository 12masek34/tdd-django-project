from django.http import HttpResponse
import pdb

def index(request):
    pdb.set_trace()
    x = 0
    return HttpResponse(f'<h1>{x}<h1>')
    


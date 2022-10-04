from django.shortcuts import render

from app.models import Item

def index(request):
    if request.method == 'POST':
        new_item_text = request.POST['item_text']
        Item.objects.create(text=new_item_text)
    else:
        new_item_text = ''

    context = {'new_item_text':new_item_text}
    return render(request, 'index.html', context)

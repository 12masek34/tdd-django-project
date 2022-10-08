from django.shortcuts import redirect, render

from app.models import Item


def index(request):
    return render(request, 'index.html')


def view_list(request):
    items = Item.objects.all()
    return render(request, 'list.html', {'items': items})


def view_new(request):
    Item.objects.create(text=request.POST.get('item_text'))
    return redirect('/lists/some-text/')
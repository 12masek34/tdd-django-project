from django.shortcuts import redirect, render

from app.models import Item, List


def index(request):
    return render(request, 'index.html')


def view_list(request, list_id):
    list_ = List.objects.get(id=list_id)
    items = Item.objects.filter(list=list_)
    return render(request, 'list.html', {'items': items})


def view_new(request):
    list_ = List.objects.create()
    Item.objects.create(text=request.POST.get('item_text'), list=list_)
    return redirect(f'/lists/{list_.id}/')
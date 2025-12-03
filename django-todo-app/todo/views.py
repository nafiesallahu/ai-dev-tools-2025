from django.shortcuts import render, redirect, get_object_or_404
from .models import TodoItem


# LIST - Display all TODO items
def todo_list(request):
    todos = TodoItem.objects.all()
    return render(request, 'todo/todo_list.html', {'todos': todos})


# CREATE - Add a new TODO item
def todo_create(request):
    if request.method == 'POST':
        title = request.POST.get('title')
        description = request.POST.get('description', '')
        due_date = request.POST.get('due_date') or None
        
        TodoItem.objects.create(
            title=title,
            description=description,
            due_date=due_date
        )
        return redirect('todo_list')
    
    return render(request, 'todo/todo_form.html')


# UPDATE - Edit an existing TODO item
def todo_update(request, pk):
    todo = get_object_or_404(TodoItem, pk=pk)
    
    if request.method == 'POST':
        todo.title = request.POST.get('title')
        todo.description = request.POST.get('description', '')
        todo.due_date = request.POST.get('due_date') or None
        todo.save()
        return redirect('todo_list')
    
    return render(request, 'todo/todo_form.html', {'todo': todo})


# DELETE - Remove a TODO item
def todo_delete(request, pk):
    todo = get_object_or_404(TodoItem, pk=pk)
    
    if request.method == 'POST':
        todo.delete()
        return redirect('todo_list')
    
    return render(request, 'todo/todo_confirm_delete.html', {'todo': todo})


# MARK RESOLVED - Toggle the resolved status
def todo_toggle_resolved(request, pk):
    todo = get_object_or_404(TodoItem, pk=pk)
    todo.resolved = not todo.resolved
    todo.save()
    return redirect('todo_list')

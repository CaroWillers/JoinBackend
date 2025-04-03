from django.shortcuts import render
from tasks.models import Task

def index(request):
    return render(request, 'index.html') 
 
def login_view(request):
    return render(request, 'login.html')

def signup_view(request):
    return render(request, 'signup.html')

def summary(request):
    tasks = Task.objects.filter(place='todo')   
    return render(request, 'summary.html', {'tasks': tasks})

def addTask(request):
    return render(request, 'add_task.html')

def addTaskPopup(request):
    return render(request, 'add_task_popup.html')   

def board(request):
    tasks = Task.objects.all()
    return render(request, 'board.html', {'tasks': tasks})

def contacts(request):
    return render(request, 'contacts.html')

def help(request):
    return render(request, 'help.html')

def legalNotice(request):
    return render(request, 'legal_notice.html')

def privacyPolicy(request):
    return render(request, 'privacy_policy.html')

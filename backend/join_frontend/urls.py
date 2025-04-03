from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('login/', views.login_view, name='login'),
    path('signup/', views.signup_view, name='signup'),
    path('add-task/', views.addTask, name='add-task'),   
    path('add-task-popup/', views.addTaskPopup, name='add-task-popup'),  
    path('board/', views.board, name='board'),   
    path('contacts/', views.contacts, name='contacts'),   
    path('help/', views.help, name='help'),   
    path('legal-notice/', views.legalNotice, name='legal-notice'),  
    path('privacy-policy/', views.privacyPolicy, name='privacy-policy'),   
    path('summary/', views.summary, name='summary'),
]

from django.urls import path
from .views import TaskListCreateView, TaskDetailView, CategoryListView

urlpatterns = [
    path('', TaskListCreateView.as_view(), name='task-list-create'), 
    path('<int:pk>/', TaskDetailView.as_view(), name='task-detail'),
    path('categories/', CategoryListView.as_view(), name='category-list'),
]

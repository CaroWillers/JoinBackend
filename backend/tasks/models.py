from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    categoryColor = models.CharField(max_length=7, default="#000000")  

    def __str__(self):
        return self.name


class Task(models.Model):
    PLACE_CHOICES = [
        ('todo', 'To Do'),
        ('progress', 'In Progress'),
        ('feedback', 'Await Feedback'),
        ('done', 'Done')
    ]

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    due_date = models.DateField()
    priority = models.JSONField(default=dict)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    assigned = models.JSONField(default=list)
    subtasks = models.JSONField(default=list)
    completed = models.BooleanField(default=False)
    place = models.CharField(max_length=20, choices=PLACE_CHOICES, default='todo')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

from django.db import models

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
    category = models.JSONField(default=dict)   
    assigned = models.JSONField(default=list)
    subtasks = models.JSONField(default=list)
    completed = models.BooleanField(default=False)
    place = models.CharField(max_length=20, choices=PLACE_CHOICES, default='todo')  # 👈 NEU
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

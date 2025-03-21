from django.db import models

class Contact(models.Model):
    name = models.CharField(max_length=255)
    surname = models.CharField(max_length=255, blank=True, null=True)
    initials = models.CharField(max_length=2, blank=True, null=True)
    avatarColor = models.CharField(max_length=32, blank=True, null=True)
    category = models.CharField(max_length=1, blank=True, null=True)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} {self.surname}"

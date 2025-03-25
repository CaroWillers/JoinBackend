from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    username = models.CharField(blank=True, max_length=255)
    email = models.EmailField(unique=True)
    is_guest = models.BooleanField(default=False) 
    
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.username

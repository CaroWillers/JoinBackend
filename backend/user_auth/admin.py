from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from user_auth.models import CustomUser  # Dein eigenes User-Modell importieren

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ('id', 'username', 'email', 'is_staff', 'is_active')  # Welche Spalten angezeigt werden
    ordering = ('id',)  # Sortierung nach ID

admin.site.register(CustomUser, CustomUserAdmin)

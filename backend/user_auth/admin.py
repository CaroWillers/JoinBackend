from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from user_auth.models import CustomUser  # Dein eigenes User-Modell importieren

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ('id', 'username', 'email', 'is_guest', 'is_staff', 'is_active')
    list_filter = ('is_guest', 'is_staff', 'is_superuser', 'is_active')
    ordering = ('id',)


admin.site.register(CustomUser, CustomUserAdmin)

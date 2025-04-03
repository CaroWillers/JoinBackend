"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenBlacklistView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # 🔹 Django Admin
    path('admin/', admin.site.urls),

    # 🔹 JWT Auth
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/logout/', TokenBlacklistView.as_view(), name='token_blacklist'),

    # 🔹 API-Endpunkte (DRF / JSON only)
    path('api/', include('user_auth.api.urls')),             
    path('api/contacts/', include('contacts.api.urls')),    
    path('api/tasks/', include('tasks.api.urls')),         

    # 🔹 HTML-Frontend (Seiten wie login, signup, board etc.)
    path('', include('join_frontend.urls')),
]

# 🔹 Static-Dateien im Debug-Modus
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

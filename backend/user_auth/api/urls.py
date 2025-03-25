from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import SignupView, LoginView, LogoutView, CheckEmailView, current_user, GuestLoginView

urlpatterns = [
    path('user/', current_user, name='current-user'),
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),   
    path('logout/', LogoutView.as_view(), name='logout'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('check-email/', CheckEmailView.as_view(), name='check_email'),
    path('guest-login/', GuestLoginView.as_view(), name='guest_login'), 
]

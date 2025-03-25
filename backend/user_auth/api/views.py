from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from user_auth.models import CustomUser
from user_auth.api.serializers import UserSerializer
from django.http import JsonResponse
from datetime import timedelta
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

# Signup-View
class SignupView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()  
            return Response({"message": "User created successfully", "username": user.username, "email": user.email}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Login-View mit "Remember Me"
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")
        remember_me = request.data.get("rememberMe", False)  # Default: False

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.check_password(password):   
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token

        # Falls Remember Me aktiviert ist, Token länger gültig machen
        if remember_me:
            access_token.set_exp(lifetime=timedelta(days=7))  # Access Token für 7 Tage gültig
            refresh.set_exp(lifetime=timedelta(days=14))  # Refresh Token für 14 Tage gültig

        return Response({
            "access": str(access_token),
            "refresh": str(refresh),
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email
            }
        }, status=status.HTTP_200_OK)

# Logout-View (damit der Refresh-Token ungültig wird)
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Successfully logged out"}, status=status.HTTP_205_RESET_CONTENT)
        except Exception:
            return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)

# E-Mail-Verfügbarkeitsprüfung
class CheckEmailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        email = request.query_params.get("email")
        if not email:
            return Response({"error": "Email parameter is required"}, status=400)

        email_exists = CustomUser.objects.filter(email=email).exists()
        return Response({"exists": email_exists})

 
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    """
    Gibt die Daten des eingeloggten Benutzers zurück.
    """
    user = request.user
    return Response({
        "id": user.id,
        "username": user.username,
        "email": user.email
    })

# Gast-Login-View
# Gast-Login-View
class GuestLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        guest_email = "guest@carogram.de"
        guest_username = "Guest"

        guest_user, created = CustomUser.objects.get_or_create(
            email=guest_email,
            defaults={
                "username": guest_username,
                "is_guest": True
            }
        )

        # Falls bereits vorhanden, sicherstellen, dass is_guest=True gesetzt ist
        if not created and not guest_user.is_guest:
            guest_user.is_guest = True
            guest_user.save()

        # Falls neu erstellt, Dummy-Passwort setzen
        if created:
            guest_user.set_password(CustomUser.objects.make_random_password())
            guest_user.save()

        # JWT generieren
        refresh = RefreshToken.for_user(guest_user)
        access = refresh.access_token

        # Gültigkeit beschränken (Gast-Tokens)
        access.set_exp(lifetime=timedelta(hours=2))
        refresh.set_exp(lifetime=timedelta(days=1))

        return Response({
            "access": str(access),
            "refresh": str(refresh),
            "user": {
                "id": guest_user.id,
                "username": guest_user.username,
                "email": guest_user.email,
                "is_guest": guest_user.is_guest
            }
        }, status=status.HTTP_200_OK)

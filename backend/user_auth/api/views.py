from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from user_auth.models import CustomUser
from user_auth.api.serializers import UserSerializer
from django.http import JsonResponse

# Signup-View
class SignupView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()  
            return Response({"message": "User created successfully", "username": user.username, "email": user.email}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Login-View 
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        try:
            user = CustomUser.objects.get(username=username)   
        except CustomUser.DoesNotExist:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.check_password(password):   
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user_id": user.id
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
        except Exception as e:
            return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)


class CheckEmailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        email = request.query_params.get("email")
        if not email:
            return Response({"error": "Email parameter is required"}, status=400)

        email_exists = CustomUser.objects.filter(email=email).exists()
        return Response({"exists": email_exists})


 
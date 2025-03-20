from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True)  # Nur zur Validierung, nicht speichern!

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'confirm_password']
        extra_kwargs = {'password': {'write_only': True}}

    def validate(self, data):
        """Prüft, ob password und confirm_password übereinstimmen"""
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwörter stimmen nicht überein."})
        return data

    def create(self, validated_data):
        """Erstellt den User, nachdem die Validierung durch ist"""
        validated_data.pop('confirm_password')  # Entferne confirm_password (wird nicht gespeichert)
        user = User(
            username=validated_data['username'],
            email=validated_data.get('email', '')
        )
        user.set_password(validated_data['password'])
        user.save()
        return user

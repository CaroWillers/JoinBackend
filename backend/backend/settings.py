import os
from pathlib import Path
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent

# Secret Key aus Umgebungsvariable oder Standardwert (NICHT in Produktion verwenden!)
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'django-insecure-*s$2u9pb=^pkhqjlc6u2l1mw^-khkig!thu35qmj8^9b8jvh=f')

# In Produktion auf False setzen!
DEBUG = True

# Setze erlaubte Hosts (in Produktion anpassen)
ALLOWED_HOSTS = ["127.0.0.1", "localhost"]


INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-Party Apps
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',

    # Eigene Apps
    'contacts',
    'tasks',
    'user_auth',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'

# Datenbank (SQLite für Entwicklung)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Passwort-Validierung
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Sprache & Zeitzone
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Statische Dateien
STATIC_URL = 'static/'

# Standard Primärschlüssel
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# CORS (Frontend-Zugriff)
CORS_ALLOWED_ORIGINS = [
    "http://127.0.0.1:5500", 
    "http://localhost:5500", 
]

#Benutzerdefiniertes User-Modell
AUTH_USER_MODEL = 'user_auth.CustomUser'

#Django REST Framework Konfiguration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}

#JWT Token Konfiguration
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),  # Token läuft nach 1 Stunde ab
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),  # Refresh-Token läuft nach 7 Tagen ab
    'ROTATE_REFRESH_TOKENS': True,  # Erstellt bei jeder Nutzung ein neues Refresh-Token
    'BLACKLIST_AFTER_ROTATION': True,  # Sperrt alte Refresh-Tokens
    'AUTH_HEADER_TYPES': ('Bearer',),
}

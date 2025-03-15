from django.urls import path
from contacts.api.views import ContactListCreateView, ContactDetailView

urlpatterns = [
    path('contacts/', ContactListCreateView.as_view(), name='contact-list'),
    path('contacts/<int:pk>/', ContactDetailView.as_view(), name='contact-detail'),
]

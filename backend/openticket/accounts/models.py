from django.db import models
from openticket.utils import TrackedMixin
from django.contrib.auth.models import User


class Organization(TrackedMixin, models.Model):
    name = models.TextField()
    
    
class Member(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    
    class Meta:
        unique_together = ("user", "organization")

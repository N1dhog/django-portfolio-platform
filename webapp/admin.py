from django.contrib import admin
from .models import Profile
# Register your models here.

from . models import Record

admin.site.register(Record)


admin.site.register(Profile)


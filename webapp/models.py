from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

# დამატებითი ჩანაწერები
class Record(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    creation_date = models.DateTimeField(auto_now_add=True)
    phone = models.CharField(max_length=20)
    city = models.CharField(max_length=255)
    country = models.CharField(max_length=125)
     

    def __str__(self):
    
      return f"{self.user.first_name} {self.user.last_name}"
    
def user_directory_path(instance, filename):

    return f'user_{instance.user.id}/{filename}'


#კატეგორიების დამატება
class Category(models.Model):
    name = models.CharField(max_length=100, verbose_name="კატეგორიის სახელი")
    slug = models.SlugField(unique=True, verbose_name="URL იდენტიფიკატორი") # მაგ: 3d-art, UI-ux

    def __str__(self):
        return self.name
    

# პროექტების დამატება
class Project(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='projects')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    categories = models.ManyToManyField(Category, related_name='projects', blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
   
    def __str__(self):
        return f"{self.title} - {self.user.username}"

# პროექტის ფოტოების დამატება
class ProjectPhoto(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='photos')
    image = models.ImageField(upload_to='project_photos/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    likes = models.ManyToManyField(User, related_name='liked_photos', blank=True)


    def total_likes(self):
        return self.likes.count()

    def __str__(self):
        return f"Photo for {self.project.title}"

# პროფილი
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    description = models.TextField(blank=True)  
    profile_image = models.ImageField(upload_to=user_directory_path, blank=True, null=True)
    about_image = models.ImageField(upload_to='about_images/', blank=True, null=True)
    about_description = models.TextField(blank=True, null=True)
    profession = models.CharField(max_length=100, blank=True, null=True)
    cv_file = models.FileField(upload_to='cv_files/', blank=True, null=True)
    
    def __str__(self):
        return f"{self.user.username} Profile"
        

@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)
    else:
        instance.profile.save()

  
#სოც.ქსელების დამატება
SOCIAL_CHOICES = [
    ('facebook', 'Facebook'),
    ('twitter', 'Twitter'),
    ('instagram', 'Instagram'),
    ('linkedin', 'LinkedIn'),
    ('github', 'GitHub'),
]

class SocialLink(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='social_links')
    platform = models.CharField(max_length=20, choices=SOCIAL_CHOICES)
    url = models.URLField(max_length=200)
    def __str__(self):
        return f"{self.profile.user.username} - {self.platform}"


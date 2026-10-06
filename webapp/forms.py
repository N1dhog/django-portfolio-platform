from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User



from django import forms
from .models import Project, Profile, Record, SocialLink
from django.contrib.auth.forms import AuthenticationForm
from django.forms.widgets import PasswordInput, TextInput

# - Register/Create a user

from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User

from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User # (ან თქვენი Custom User მოდელი)

class CreateUserForm(UserCreationForm):

    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name', 'password1', 'password2']
        # აქ ვუთითებთ მოდელის ველების ქართულ სახელებს
        labels = {
            'email': 'იმეილი',
            'first_name': 'სახელი',
            'last_name': 'გვარი',
        }

    def __init__(self, *args, **kwargs):
        super(CreateUserForm, self).__init__(*args, **kwargs)

        # პაროლის ველები არ არის User მოდელის პირდაპირი ველები (UserCreationForm ქმნის მათ),
        # ამიტომ მათი label-ების შეცვლა __init__-დან უფრო უსაფრთხოა:
        if 'password1' in self.fields:
            self.fields['password1'].label = "პაროლი"
        if 'password2' in self.fields:
            self.fields['password2'].label = "გაიმეორე პაროლი"

        # ვამატებთ Bootstrap-ის კლასს ყველა ველს
        for field_name, field in self.fields.items():
            field.widget.attrs.update({
                'class': 'form-control'
            })
            
    def clean_email(self):
        email = self.cleaned_data.get('email').lower()
        if User.objects.filter(email=email).exists():
            raise forms.ValidationError("ეს იმეილი უკვე გამოყენებულია")
        return email

    def save(self, commit=True):
        user = super().save(commit=False)

        # Generate a username from the email before the @
        base_username = self.cleaned_data.get('email').split('@')[0]

        # Ensure the username is unique
        username = base_username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1

        user.username = username

        if commit:
            user.save()
        return user


# - Login a user

class LoginForm(forms.Form):
    email = forms.EmailField(
        label='იმეილი', 
        widget=forms.EmailInput(attrs={'class':'form-control'})
    )
    password = forms.CharField(
        label='პაროლი', 
        widget=forms.PasswordInput(attrs={'class':'form-control'})
    )

# - profile Description
# forms.py-ს შესაბამისი ნაწილი
class ProfileForm(forms.ModelForm):
    class Meta:
        model = Profile
        # დარწმუნდით რომ ველებში ორივე გიწერიათ
        fields = ['profile_image', 'profession', 'description', 'cv_file'] 
        
        widgets = {
            'profession':forms.Textarea(attrs={
                'class': 'hero-profession-input',
                'placeholder': 'პროფესია',
                'rows': 2,
            }),
            'description': forms.Textarea(attrs={
                'class': 'hero-desc-input',
                'placeholder': 'დაწერე მოკლე აღწერა შენს შესახებ...',
                'rows': 4
            }),
        }


# - about me 
class AboutMeForm(forms.ModelForm):
    class Meta:
        model = Profile
        fields = ['about_description']
        widgets = {
            'about_description': forms.Textarea(attrs={
                'class': 'form-control', 
                'placeholder': 'მოყევი შენს შესახებ...',
                'rows': 1 # rows: 1-ით ვიწყებთ და JS თავად გაზრდის
            }),
        }
# - Create a record

class RecordForm(forms.ModelForm):
    class Meta:
        model = Record
        fields = ['phone', 'city', 'country']
       
            
        
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # make all fields optional
        for field in self.fields.values():
            field.required = False


class SocialLinkForm(forms.ModelForm):
    class Meta:
        model = SocialLink
        fields = ['platform', 'url']
        widgets = {
            'platform': forms.Select(attrs={'class': 'form-select'}),
            'url': forms.URLInput(attrs={'class': 'form-control', 'placeholder': 'https://'}),
        }



class ProjectForm(forms.ModelForm):
    class Meta:
        model = Project
        fields = ['title', 'description']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'პროექტის სათაური'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': 3, 'placeholder': 'აღწერეთ თქვენი პროექტი...'}),
        }


class MultipleFileInput(forms.ClearableFileInput):
    allow_multiple_selected = True

class MultipleFileField(forms.FileField):
    def __init__(self, *args, **kwargs):
        kwargs.setdefault("widget", MultipleFileInput(attrs={'class': 'form-control', 'multiple': True}))
        super().__init__(*args, **kwargs)

    def clean(self, data, initial=None):
        single_file_clean = super().clean
        if isinstance(data, (list, tuple)):
            result = [single_file_clean(d, initial) for d in data]
        else:
            result = single_file_clean(data, initial)
        return result


class PhotoUploadForm(forms.Form):
    images = MultipleFileField(label="აირჩიეთ ფოტოები", required=False)
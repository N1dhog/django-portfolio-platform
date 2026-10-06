from django.shortcuts import render, redirect, get_object_or_404
from .forms import CreateUserForm, LoginForm, RecordForm,ProfileForm, AboutMeForm, SocialLinkForm, PhotoUploadForm, ProjectForm
from django.contrib import messages
from django.contrib.auth.models import auth, User
from django.contrib.auth import authenticate, login
from django.db.models import Q
from django.db.models.functions import Random
from django.contrib.auth.decorators import login_required
from django.urls import reverse
from .models import Record, Profile, SocialLink, Project, ProjectPhoto, Category, ProjectPhoto
from django.http import HttpResponseRedirect, JsonResponse


# - Homepage 

def home(request):
     
     return render(request, "webapp/index.html")

# - Register a user

def register(request):

    form = CreateUserForm()

    if request.method == "POST":

        form = CreateUserForm(request.POST)

        if form.is_valid():

            form.save()

            messages.success(request, "წარმატებით გაიარეთ რეგისტრაცია!")

            return redirect("my-login")

    context = {'form':form}

    return render(request, 'webapp/register.html', context=context)


# - Login a user

def my_login(request):
    form = LoginForm()
    if request.method == "POST":
        form = LoginForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data['email'].lower()
            password = form.cleaned_data['password']
            try:
                user_obj = User.objects.get(email=email)
                user = authenticate(request, username=user_obj.username, password=password)
            except User.DoesNotExist:
                user = None

            if user:
                login(request, user)
                return redirect("dashboard")
            else:
                messages.error(request, "არასწორი ელფოსტა ან პაროლი")
    return render(request, 'webapp/my-login.html', {'form': form})


# - Dashboard

@login_required(login_url='my-login')
def dashboard(request):
    print(request.POST)
    my_record = Record.objects.filter(user=request.user).first()
    

    profile, created = Profile.objects.get_or_create(user=request.user)
    my_projects = Project.objects.filter(user=request.user)
    profile_form = ProfileForm(instance=profile)
    about_form = AboutMeForm(instance=profile)
    

    social_form = SocialLinkForm(request.POST)
    social_links = profile.social_links.all()

    if request.method == 'POST':

        # ----- SAVE PROFILE -----
        if 'save_profile' in request.POST:
            profile_form = ProfileForm(request.POST, request.FILES, instance=profile)
            if profile_form.is_valid():
                profile_form.save()
                messages.success(request, "პროფილი განახლდა წარმატებით!")
            return redirect('dashboard')

       

        # ----- DELETE ACTIONS -----
        elif 'remove_image' in request.POST:
            if profile.profile_image:
                profile.profile_image.delete(save=False)
                profile.profile_image = None
                profile.save()
                messages.success(request, "პროფილის სურათი წაიშალა!")
            return redirect('dashboard')

        elif 'delete_description' in request.POST:
            profile.description = ""
            profile.save()
            messages.success(request, "პროფილის აღწერა წაიშალა!")
            return redirect('dashboard')


        elif 'delete_about_description' in request.POST:
            profile.about_description = ""
            profile.save()
            messages.success(request, "ჩემს შესახებ - აღწერა წაიშალა წარმატებით!")
            return redirect('dashboard')

       
        elif 'save_about' in request.POST:
            # გადავცემთ request.FILES აუცილებლად
            about_form = AboutMeForm(request.POST, request.FILES, instance=profile)
            if about_form.is_valid():
                # თუ ფაილი აიტვირთა ხელით (რადგან about_image შეიძლება არ იყოს ფორმაში პირდაპირ)
                if 'about_image' in request.FILES:
                    profile.about_image = request.FILES['about_image']
                
                about_form.save()
                messages.success(request, "ჩემს შესახებ მონაცემები განახლდა!")
                return redirect('dashboard')

        # ----- DELETE ABOUT IMAGE -----
        elif 'delete_about_image' in request.POST:
            if profile.about_image:
                profile.about_image.delete(save=True) # შლის ფაილსაც და ასუფთავებს ველსაც
                messages.success(request, "ფოტო წაიშალა!")
            return redirect('dashboard')


        elif 'add_social' in request.POST:
            if social_form.is_valid():
                social_instance = social_form.save(commit=False)
                social_instance.profile = profile
                social_instance.save()
                messages.success(request, "Social link added!")
                return redirect('dashboard')
       

    
    context = {
        'record': my_record,
        'projects': my_projects,
        'profile_form': profile_form,
        'about_form': about_form,
        'profile': profile,
        'social_form': social_form,
        'social_links': social_links,
    }

    return render(request, 'webapp/dashboard.html', context)


@login_required(login_url='my-login')
def user_projects(request, project_id=None):
    projects = Project.objects.filter(user=request.user).order_by('-created_at')
    active_project = get_object_or_404(Project, id=project_id, user=request.user) if project_id else projects.first()

    if request.method == 'POST':
        action = request.POST.get('action')
        
        # 1. პროექტის შექმნა
        if action == 'create':
            form = ProjectForm(request.POST)
            if form.is_valid():
                p = form.save(commit=False)
                p.user = request.user
                p.save()  # ჯერ ვინახავთ პროექტს, რომ ბაზაში ID მიენიჭოს
                
                # 🚀 ახალი: ვიღებთ Select2-დან წამოსულ კატეგორიებს და ვინახავთ
                category_ids = request.POST.getlist('categories')
                p.categories.set(category_ids)
                
                return redirect('user_projects_detail', project_id=p.id)

        # 2. პროექტის რედაქტირება
        elif action == 'edit' and project_id:
            project = get_object_or_404(Project, id=project_id, user=request.user)
            form = ProjectForm(request.POST, instance=project)
            if form.is_valid():
                form.save()
                
                # 🚀 ახალი: რედაქტირების დროსაც განვაახლოთ კატეგორიები
                category_ids = request.POST.getlist('categories')
                project.categories.set(category_ids)
                
                return redirect('user_projects_detail', project_id=project.id)

        # 3. ფოტოების დამატება
        elif action == 'add_photos' and active_project:
            files = request.FILES.getlist('images')
            for f in files:
                ProjectPhoto.objects.create(project=active_project, image=f)
            return redirect('user_projects_detail', project_id=active_project.id)
        
    return render(request, 'webapp/user_projects.html', {
        'projects': projects,
        'active_project': active_project,
        'project_form': ProjectForm(),
        'all_categories': Category.objects.all(),  # 🚀 ახალი: გადაეცემა თემფლეითს დროპდაუნის ასაწყობად
    })

@login_required(login_url='my-login')
def project_delete(request, pk):
    project = get_object_or_404(Project, pk=pk, user=request.user)
    project.delete()
    messages.success(request, "პროექტი წაიშალა!")
    return redirect('user_projects')



@login_required(login_url='my-login')
def delete_project_photo(request, pk):
    if request.method == 'POST': # უსაფრთხოებისთვის მხოლოდ POST მოთხოვნა
        photo = get_object_or_404(ProjectPhoto, pk=pk, project__user=request.user)
        
        # ფაილის ფიზიკურად წაშლა მედია საქაღალდიდან
        if photo.image:
            photo.image.delete()
            
        photo.delete()
        
        # გადატვირთვის ნაცვლად ვაბრუნებთ წარმატების JSON სიგნალს
        return JsonResponse({'status': 'success', 'message': 'ფოტო წარმატებით წაიშალა!'})
        
    return JsonResponse({'status': 'error', 'message': 'არასწორი მოთხოვნა.'}, status=400)


@login_required(login_url='my-login')
def delete_social(request, pk):
    social = get_object_or_404(SocialLink, id=pk)

    # don't allow users to delete someone else's link
    if social.profile.user != request.user:
        messages.error(request, "You cannot delete this social link.")
        return redirect('dashboard')

    social.delete()
    messages.success(request, "სოციალური ბმული წაიშალა!")
    return redirect('dashboard')

@login_required(login_url='my-login')



# - Create a record 

@login_required(login_url='my-login')
def record_details(request):
    # Get the user's record, or None if it doesn't exist
    record = Record.objects.filter(user=request.user).first()

    if record:
        form = RecordForm(request.POST or None, instance=record)
    else:
        form = RecordForm(request.POST or None)

    if request.method == 'POST':
        if form.is_valid():
            rec = form.save(commit=False)
            rec.user = request.user
            rec.save()
            messages.success(request, "ჩანაწერი განახლდა!")
            return redirect('dashboard')

    return render(request, 'webapp/record_details.html', {'form': form, 'record': record})


def live_user_search(request):
    query = request.GET.get('q', '').strip()
    results = []
    if query:
        users = User.objects.filter(
            Q(first_name__icontains=query) |
            Q(last_name__icontains=query)
        ).distinct()
        for u in users:
            results.append({
                'username': u.username,
                'first_name': u.first_name,
                'last_name': u.last_name,
                'profile_image': u.profile.profile_image.url if hasattr(u, 'profile') and u.profile.profile_image else ''
            })
    return JsonResponse({'results': results})


def public_profile(request, username):
    # 1. ვპოულობთ იმ მომხმარებელს, ვის გვერდზეც ვიმყოფებით
    user_object = get_object_or_404(User, username=username)
    
    # 2. ამოვაქვთ ამ იუზერის პროფილი, რეკორდები და სოციალური ბმულები
    profile = get_object_or_404(Profile, user=user_object)
    records = Record.objects.filter(user=user_object)
    social_links = SocialLink.objects.filter(profile=profile)
    
    # 3. კრიტიკული ნაწილი: აუცილებლად უნდა წამოვიღოთ ამ იუზერის პროექტები!
    # შეამოწმეთ, რომ ფილტრში გიწერიათ იუზერის ობიექტი
    projects = Project.objects.filter(user=user_object) 

    context = {
        'profile': profile,
        'records': records,
        'social_links': social_links,
        'projects': projects, # <- დარწმუნდით, რომ ზუსტად ამ სახელით ('projects') გადასცემთ კონტექსტში
    }
    
    return render(request, 'webapp/public_profile.html', context)

def public_project_detail(request, project_id):
    # ვპოულობთ კონკრეტულ პროექტს
    active_project = get_object_or_404(Project, id=project_id)
    
    # ვიღებთ ამ პროექტის მფლობელ მომხმარებელს
    project_owner = active_project.user
    
    # გამოგვაქვს ამ მომხმარებლის ყველა პროექტი გვერდითა პანელისთვის
    projects = Project.objects.filter(user=project_owner)
    
    context = {
        'active_project': active_project,
        'projects': projects,
    }
    return render(request, 'webapp/public_project_detail.html', context)

from .models import ProjectPhoto, Category  # 🚀 არ დაგავიწყდეთ Category-ს იმპორტი

def explore_page(request):
    # 1. წამოვიღოთ ყველა კატეგორია ფილტრის ბარისთვის
    all_categories = Category.objects.all()
    
    # 2. დავიჭიროთ URL-იდან არჩეული კატეგორიის სლაგი (მაგ: ?category=3d-art)
    selected_category_slug = request.GET.get('category')

    # 3. საბაზისო ქუერი, რომელიც თქვენ უკვე გქონდათ დაწერილი
    photos = ProjectPhoto.objects.select_related(
        'project', 
        'project__user', 
        'project__user__profile'
    ).all().order_by('-id')

    # 4. 🚀 თუ მომხმარებელმა კონკრეტული კატეგორია აირჩია, ვფილტრავთ ფოტოებს
    if selected_category_slug:
        # გადავდივართ ფოტოდან -> პროექტზე -> კატეგორიებზე -> სლაგზე
        # .distinct() საჭიროა, რომ ფოტოები დუბლირებული სახით არ წამოვიდეს
        photos = photos.filter(project__categories__slug=selected_category_slug).distinct()

    # 5. ყველაფერს ვატანთ კონტექსტში
    context = {
        'photos': photos,
        'all_categories': all_categories,
        'current_category': selected_category_slug, # ეს გვჭირდება HTML-ში აქტიური ღილაკის გასაფერადებლად
    }
    
    return render(request, 'webapp/explore.html', context)


def upload_cv(request):
    # ლოგიკა CV-ს ასატვირთი ფორმისთვის
    # (მაგალითად, ცალკე ფორმა, რომელიც მხოლოდ cv_file ველს ანახლებს)
    return render(request, 'webapp/upload_cv.html', {})

def delete_cv(request):
    # ლოგიკა CV-ს წაშლისთვის (X ღილაკისთვის)
    if request.method == 'POST':
        profile = request.user.profile
        if profile.cv_file:
            # ვშლით ფაილს სერვერიდან
            profile.cv_file.delete()
            # ვაახლებთ მოდელს (რომ ბაზაში null ჩაიწეროს)
            profile.cv_file = None
            profile.save()
        return redirect('dashboard')
    return redirect('dashboard')


#like
def like_project(request, pk):
    if not request.user.is_authenticated or request.method != "POST":
        return JsonResponse({'error': 'გაიარე ავტორიზაცია'}, status=401)
        
    # ვპოულობთ კონკრეტულ ფოტოს ID-ის მიხედვით
    photo = get_object_or_404(ProjectPhoto, id=pk) 
    liked = False
    
    if photo.likes.filter(id=request.user.id).exists():
        photo.likes.remove(request.user)
        liked = False
    else:
        photo.likes.add(request.user)
        liked = True
        
    return JsonResponse({
        'liked': liked,
        'total_likes': photo.total_likes() 
    })




# - User logout

def user_logout(request):

    auth.logout(request)

    messages.success(request, "თქვენ გახვედით ანგარიშიდან!")

    return redirect("my-login")






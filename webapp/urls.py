
from django.urls import path

from . import views

urlpatterns = [

    path('', views.home, name=""),

    path('register/', views.register, name="register"),

    path('my-login/', views.my_login, name="my-login"),

    path('user-logout/', views.user_logout, name="user-logout"),
   
    path('dashboard/', views.dashboard, name="dashboard"),
           
    path('record/', views.record_details, name='record_details'), 

    
    
    
    path('profile/<str:username>/', views.public_profile, name='public_profile'),
    path('live-search/', views.live_user_search, name='live_user_search'),
  
    path('explore/', views.explore_page, name='explore'),
    

    path('delete-social/<int:pk>/', views.delete_social, name='delete_social'),

    path('my-projects/', views.user_projects, name='user_projects'),
   
    path('project/<int:pk>/delete/', views.project_delete, name='project_delete'),
    
    path('my-projects/<int:project_id>/', views.user_projects, name='user_projects_detail'),
    path('project/view/<int:project_id>/', views.public_project_detail, name='public_project_detail'),
    path('project/photo/<int:pk>/delete/', views.delete_project_photo, name='delete_project_photo'),
   
    path('delete-cv/', views.delete_cv, name='delete_cv'),

    path('like/<int:pk>/', views.like_project, name='like_project'),
     
]







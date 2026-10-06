
document.addEventListener('DOMContentLoaded', function() {
    const likeBtns = document.querySelectorAll('.like-btn');
    const alertContainer = document.getElementById('custom-alert-container');
    
    likeBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const currentBtn = e.target.closest('.like-btn');
            const isAuthenticated = currentBtn.getAttribute('data-authenticated') === 'true';
            
            // 🎯 თუ მომხმარებელი არ არის ავტორიზებული:
            if (!isAuthenticated) {
                showAlert("🚫 გთხოვთ გაიაროთ ავტორიზაცია მოწონებისთვის!");
                return; // ვაჩერებთ კოდის შემდგომ მუშაობას
            }
            
            // თუ ავტორიზებულია, კოდი ჩვეულებრივად აგრძელებს Fetch მოთხოვნას:
            const url = currentBtn.getAttribute('data-url');
            const icon = currentBtn.querySelector('.like-icon');
            const countSpan = currentBtn.parentNode.querySelector('.likes-count');
            
            fetch(url, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) return;
                countSpan.textContent = data.total_likes;
                if (data.liked) {
                    icon.classList.remove('fa-regular', 'text-secondary');
                    icon.classList.add('fa-solid', 'text-purple');
                } else {
                    icon.classList.remove('fa-solid', 'text-purple');
                    icon.classList.add('fa-regular', 'text-secondary');
                }
            });
        });
    });
    
    
function showAlert(message) {
    const messagesContainer = document.getElementById('django-messages-container');
    
    // თუ გვერდზე ეს კონტეინერი საერთოდ არ არსებობს, რომ კოდი არ გაფუჭდეს
    if (!messagesContainer) return;

    // 1. ვქმნით გარე დივს იმავე კლასებით
    const messageWrapper = document.createElement('div');
    messageWrapper.className = 'message-text d-flex justify-content-center';

   
    messageWrapper.innerHTML = `
        <p class="alert alert-purple text-center px-4 py-2 shadow-sm rounded-pill"> 
            <i class="fa fa-info-circle" aria-hidden="true"></i> &nbsp; ${message}
        </p>
    `;

    // 3. ვაგდებთ მესიჯს კონტეინერის თავში
    messagesContainer.appendChild(messageWrapper);

    // 4. თუ გინდა, რომ ეს დინამიური მესიჯიც ავტომატურად გაქრეს 3 წამში:
    setTimeout(() => {
        messageWrapper.style.transition = "opacity 0.5s ease";
        messageWrapper.style.opacity = "0";
        setTimeout(() => messageWrapper.remove(), 500);
    }, 3000);
}

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
});
//live search

document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('live-search');
    const resultsDiv = document.getElementById('search-results');

    if (!searchInput || !resultsDiv) return; 

    let debounceTimeout; // 🎯 1. ვქმნით ცვლადს ტაიმერისთვის

    searchInput.addEventListener('input', function() {
        const query = this.value.trim();
        
        // ყოველ ახალ ასოზე ვასუფთავებთ წინა ტაიმერს, რომ ძველი ფეჩი არ გაპაროს
        clearTimeout(debounceTimeout); 

        if (query.length === 0) {
            resultsDiv.innerHTML = '';
            resultsDiv.classList.add('hidden');
            return;
        }

        // 🎯 2. მოთხოვნას ვსვამთ ტაიმაუტში (300 მილიწამი)
        debounceTimeout = setTimeout(() => {
            fetch(`/live-search/?q=${encodeURIComponent(query)}`)
                .then(response => response.json())
                .then(data => {
                    resultsDiv.innerHTML = '';
                    if (data.results.length === 0) {
                        resultsDiv.innerHTML = '<p class="no-results" style="font-size:14px">ანგარიში ვერ მოიძებნა.</p>';
                    } else {
                        data.results.forEach(user => {
                            const div = document.createElement('div');
                            div.classList.add('search-item');
                            div.innerHTML = `
                                <a href="/profile/${user.username}/" class="d-flex align-items-center">
                                    ${user.profile_image ? 
                                        `<img src="${user.profile_image}" class="rounded-circle me-2" style="width:35px; height:35px; object-fit:cover;">`
                                        : `<i class="fa-solid fa-circle-user me-2" style="font-size:32px;"></i>`
                                    }
                                    <span>${user.first_name} ${user.last_name}</span>
                                </a>
                            `;
                            resultsDiv.appendChild(div);
                        });
                    }
                    resultsDiv.classList.remove('hidden');
                })
                .catch(err => console.error('Search error:', err));
        }, 300); // 🎯 300 მლ.წამიანი დაყოვნება
    });
});





// Message/Notification timer

setTimeout(function() {
    let messageTimer = document.getElementById('message-timer');
    if (messageTimer) {
        // ჯერ ვაკეთებთ ნაზ გაქრობას (opacity)
        messageTimer.style.transition = "opacity 0.5s ease, transform 0.5s ease";
        messageTimer.style.opacity = "0";
        messageTimer.style.transform = "translateY(-20px)";
        
        // სრულად ვაშორებთ DOM-იდან ანიმაციის მერე
        setTimeout(() => {
            messageTimer.parentElement.remove();
        }, 500);
    }
}, 4000); // 4000 მილიწამი = 4 წამი




// profile

document.addEventListener("DOMContentLoaded", function () {
    const fileInput = document.getElementById("profile_image");
    const profilePreview = document.getElementById("profilePreview");
    const avatarPlaceholder = document.getElementById("avatarPlaceholder");
    const deleteBtn = document.getElementById("deleteAvatarBtn");
    const deleteForm = document.getElementById("profileImageDeleteForm");

    // 1. ფოტოს წინასწარი გადახედვის (Preview) ლოგიკა
    if (fileInput) {
        fileInput.addEventListener("change", function () {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    if (profilePreview) {
                        profilePreview.src = e.target.result;
                        profilePreview.classList.remove("d-none"); // ვაჩვენებთ სურათს
                    }
                    if (avatarPlaceholder) {
                        avatarPlaceholder.classList.add("d-none"); // ვმალავთ პლეისჰოლდერს
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // 2. ფოტოს წაშლის ლოგიკა (გარანტირებული საბმითი JS-ით)
    if (deleteBtn && deleteForm) {
        deleteBtn.addEventListener("click", function (e) {
            e.preventDefault(); // ვაჩერებთ ღილაკის ნაგულისხმევ ქცევას
            if (confirm("ნამდვილად გსურთ პროფილის ფოტოს წაშლა?")) {
                deleteForm.submit(); // პირდაპირ ვაგზავნით წაშლის ფორმას
            }
        });
    }
});
//CV
document.addEventListener("DOMContentLoaded", function () {

    // CV ატვირთვის ლოგიკა
    const cvFormBtn = document.getElementById("customCvUploadBtn");
    const cvFileInput = document.getElementById("cv_file_input");
    const cvButtonText = document.getElementById("cvButtonText");

    if (cvFormBtn && cvFileInput) {
        // როცა ვაჭერთ ვიზუალურ ღილაკს, ვააქტიურებთ დამალულ ინპუტს
        cvFormBtn.addEventListener("click", function () {
            cvFileInput.click();
        });

        // როცა მომხმარებელი ფაილს აირჩევს
        cvFileInput.addEventListener("change", function () {
            if (this.files.length > 0) {
                const fileName = this.files[0].name;
                // ვუცვლით ვიზუალს, რომ მიხვდეს ატვირთვას
                cvFormBtn.classList.remove("btn-outline-light", "glass-btn");
                cvFormBtn.classList.add("btn-success");
                cvButtonText.innerHTML = `მზადაა: ${fileName.substring(0, 15)}... <i class="fa fa-check ms-2"></i>`;
            }
        });
    }
});





// about me (უსაფრთხო ვერსია)
const aboutImageInput = document.getElementById('about_image');

if (aboutImageInput) {
    aboutImageInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        const previewImg = document.getElementById('aboutPreview');
        const placeholder = document.getElementById('aboutPlaceholder');

        if (file) {
            const reader = new FileReader();

            reader.onload = function(e) {
                if (previewImg) {
                    // 1. ვუცვლით ფოტოს მისამართს
                    previewImg.src = e.target.result;
                    
                    // 2. ვაშორებთ d-none კლასს და ვხდით ხილვადს
                    previewImg.classList.remove('d-none');
                    previewImg.style.display = 'block';
                }
                
                // 3. ვმალავთ placeholder-ს
                if (placeholder) {
                    placeholder.style.display = 'none';
                }
            };

            reader.readAsDataURL(file);
        }
    });
}
document.addEventListener('DOMContentLoaded', function() {
    const textarea = document.querySelector('textarea[name="about_description"]');

    if (textarea) {
        // ფუნქცია სიმაღლის დასარეგულირებლად
        function autoResize() {
            this.style.height = 'auto'; // ჯერ ვაბრუნებთ საწყისზე, რომ სწორად დათვალოს
            this.style.height = this.scrollHeight + 'px'; // შემდეგ ვუწერთ რეალურ სიმაღლეს
        }

        // ტექსტის წერისას (input)
        textarea.addEventListener('input', autoResize);

        // გვერდის ჩატვირთვისას (თუ უკვე წერია ტექსტი, რომ მაშინვე გაიზარდოს)
        autoResize.call(textarea);
    }
});




    function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.startsWith(name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}







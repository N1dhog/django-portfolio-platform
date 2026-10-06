

// 1. პროექტებში ფოტოს გადიდება (ზუსტად explore-ის იდენტური ლოგიკა)
function executeZoom(imgSrc) {
    const lightbox = document.getElementById('zoomLightbox');
    const zoomImg = document.getElementById('zoomImage');

    if (lightbox && zoomImg) {
        zoomImg.src = imgSrc;
        lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // უკანა ფონის სქროლის გათიშვა
    }
}

// 2. პროექტებში ფოტოს ზუმის დახურვა
function closeZoom() {
    const lightbox = document.getElementById('zoomLightbox');
    if (lightbox) {
        lightbox.style.display = 'none';
        const zoomImg = document.getElementById('zoomImage');
        if (zoomImg) zoomImg.src = ''; 
        document.body.style.overflow = 'auto'; // სქროლის დაბრუნება
    }
}

// კლავიატურის ESC ღილაკით დახურვა ორივე ტიპის ლაითბოქსისთვის
document.addEventListener('keydown', function(event) {
    if (event.key === "Escape") {
        if (typeof closeZoom === 'function') closeZoom();
        if (typeof closeExploreZoom === 'function') closeExploreZoom();
    }
});

// ========================================================
// დანარჩენი დამხმარე ფუნქციები (Dashboard & Select2)
// ========================================================

function navigateToProject(element) {
    const url = element.getAttribute('data-url');
    if (url) window.location.href = url;
}

function toggleProjectForm() {
    const form = document.getElementById('createProjectForm');
    const btn = document.getElementById('plusBtn');
    if (form && btn) {
        if (form.style.display === 'none' || form.style.display === '') {
            form.style.display = 'block';
            btn.style.display = 'none';
        } else {
            form.style.display = 'none';
            btn.style.display = 'block';
        }
    }
}

function showEditModal(id, title, desc, element) {
    const categoryIds = JSON.parse(event.currentTarget.getAttribute('data-categories') || "[]");
    const editForm = document.getElementById('editForm');
    const editTitle = document.getElementById('editTitle');
    const editDesc = document.getElementById('editDesc');

    if (editForm) editForm.action = `/my-projects/${id}/`;
    if (editTitle) editTitle.value = title;
    if (editDesc) editDesc.value = desc;
    
    if (typeof $ !== 'undefined' && $('#editCategorySelect').length) {
        $('#editCategorySelect').val(categoryIds).trigger('change');
    }
    if (typeof bootstrap !== 'undefined') {
        var editModal = new bootstrap.Modal(document.getElementById('editModal'));
        editModal.show();
    }
}

$(document).ready(function() {
    if ($.fn.select2) {
        $('#categorySelect').select2({
            placeholder: " ჩაწერეთ ან აირჩიეთ კატეგორიები...",
            allowClear: true,
            width: 'resolve'
        });
        $('#editCategorySelect').select2({
            dropdownParent: $('#editModal'),
            placeholder: " აირჩიეთ კატეგორიები...",
            allowClear: true,
            width: '100%'
        });
    }
});





function deletePhotoFunction(buttonElement) {
    // 1. ვიღებთ წაშლის URL-ს ღილაკის data-url ატრიბუტიდან
    const deleteUrl = buttonElement.getAttribute('data-url');
    
    if (!deleteUrl) {
        console.error("წაშლის URL ვერ მოიძებნა ღილაკზე!");
        return;
    }

    // 2. ვეკითხებით მომხმარებელს დასტურს
    if (confirm("დარწმუნებული ხართ, რომ გსურთ ამ ფოტოს წაშლა?")) {
        
        // 3. ვაგზავნით POST მოთხოვნას Django-სთან
        fetch(deleteUrl, {
            method: 'POST',
            headers: {
                // Django-სთვის აუცილებელია CSRF ტოკენის გაყოლება უსაფრთხოებისთვის
                'X-CSRFToken': getCookie('csrftoken'),
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success' || data.success) {
                // 4. თუ ბექენდმა წარმატებით წაშალა, ფოტოს ბარათს საიტიდან ვიზუალურადაც ვაქრობთ
                const masonryItem = buttonElement.closest('.masonry-item-public');
                if (masonryItem) {
                    masonryItem.style.transition = 'all 0.3s ease';
                    masonryItem.style.opacity = '0';
                    masonryItem.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        masonryItem.remove();
                        // თუ იყენებთ რაიმე Masonry ბიბლიოთეკას (მაგ. Isotope), აქ შეგიძლიათ მისი რეასემბლი გააკეთოთ
                    }, 300);
                }
            } else {
                alert(data.message || "ფოტოს წაშლისას დაფიქსირდა შეცდომა.");
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert("სერვერთან კავშირი ვერ დამყარდა.");
        });
    }
}

// დამხმარე ფუნქცია Django-ს CSRF ტოკენის წასაკითხად ქუქიებიდან
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

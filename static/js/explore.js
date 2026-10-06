

window.addEventListener('scroll', function() {
    const filter = document.querySelector('.behance-filter-container');
    
    // 🎯 თუ ფილტრი ამ გვერდზე არ არსებობს, კოდი აქ გაჩერდება და ერორს არ ამოაგდებს
    if (!filter) return; 

    const filterTop = filter.offsetTop;

    if (window.pageYOffset >= filterTop) {
        filter.classList.add('sticky-active');
    } else {
        filter.classList.remove('sticky-active');
    }
});


function openExploreZoom(element) {
    // თუ element საერთოდ არ გადმოეცა, ან არ აქვს getAttribute მეთოდი, 
    // ვცდილობთ ვიპოვოთ რეალური <img> ელემენტი მის შიგნით
    let targetImg = element;
    if (!element || typeof element.getAttribute !== 'function') {
        // ეძებს პირველივე img-ს იმ ბლოკში, სადაც კლიკი მოხდა
        targetImg = element.querySelector ? element.querySelector('img') : null;
    }

    // თუ სურათი მაინც ვერ ვიპოვეთ, ვიღებთ target-ს მიმდინარე event-იდან (ყოველი შემთხვევისთვის)
    if (!targetImg && window.event) {
        targetImg = window.event.target.closest('img') || window.event.target;
    }

    // თუ მაინც ვერაფერი ვიპოვეთ, რომელსაც getAttribute აქვს, ვაჩერებთ ფუნქციას, რომ არ დააეროროს
    if (!targetImg || typeof targetImg.getAttribute !== 'function') {
        console.error("Lightbox: ვერ მოხერხდა ვალიდური ელემენტის პოვნა ატრიბუტებისთვის.");
        return;
    }

    const imgSrc = element.getAttribute('data-lightbox-src') || '';
    const projectTitle = element.getAttribute('data-project-title') || '';
    const authorFullName = element.getAttribute('data-author-fullname') || '';
    const authorUsername = element.getAttribute('data-author-username') || '';
    const authorAvatar = element.getAttribute('data-author-avatar') || '';
    const profileUrl = element.getAttribute('data-profile-url') || '#';
const likeUrl = element.getAttribute('data-like-url');
    const totalLikes = element.getAttribute('data-likes');
    const isLiked = element.getAttribute('data-is-liked') === 'true';
    
    // 🎯 2. ვიპოვოთ მოდალის შიგნით არსებული ელემენტები
    const lightboxLikeBtn = document.getElementById('lightboxLikeBtn');
    const lightboxLikeIcon = document.getElementById('lightboxLikeIcon');
    const lightboxLikeCount = document.getElementById('lightboxLikeCount');
    
    // 🎯 3. შევავსოთ მონაცემები დინამიურად
    lightboxLikeBtn.setAttribute('data-url', likeUrl);
    lightboxLikeCount.textContent = totalLikes;
    
    // 🎯 4. სწორად შევღებოთ გული (იასამნისფრად ან დავტოვოთ ცარიელი)
    if (isLiked) {
        lightboxLikeIcon.className = "fa-solid text-purple fa-heart fs-4 like-icon";
    } else {
        lightboxLikeIcon.className = "fa-regular text-secondary fa-heart fs-4 like-icon";
    }
    // ... (აქედან ქვემოთ კოდი რჩება უცვლელი, როგორც გეწერათ) ...
    const lightbox = document.getElementById('exploreLightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxTitle = document.getElementById('lightboxProjectTitle');
    const lightboxFullName = document.getElementById('lightboxAuthorFullName');
    const lightboxAvatar = document.getElementById('lightboxAuthorAvatar');
    const lightboxLink = document.getElementById('lightboxAuthorLink');
    const lightboxNameSpan = document.getElementById('lightboxAuthorName');

    if (lightboxImg) lightboxImg.src = imgSrc;
    if (lightboxTitle) lightboxTitle.innerText = projectTitle;
    if (lightboxFullName) lightboxFullName.innerText = authorFullName;
    if (lightboxLink) lightboxLink.href = profileUrl;
    if (lightboxNameSpan) lightboxNameSpan.innerText = authorUsername;

    if (lightboxAvatar) {
        if (authorAvatar) {
            lightboxAvatar.src = authorAvatar;
            lightboxAvatar.style.display = 'block';
        } else {
            lightboxAvatar.style.display = 'none';
        }
    }

    if (lightbox) {
        lightbox.classList.add('active'); // ან lightbox.style.display = 'flex';
    }
}
function closeExploreZoom() {
    const lightbox = document.getElementById('exploreLightbox');
    if (lightbox) {
        // თუ გახსნისთვის იყენებთ style.display-ს:
        lightbox.style.display = 'none';
        
        // თუ გახსნისთვის იყენებთ კლასს (მაგ. active), მაშინ ეს ხაზიც დატოვეთ:
        lightbox.classList.remove('active');
    }
}


//კატწეგორიის სლაიდერი
document.addEventListener("DOMContentLoaded", function() {
    const wrapper = document.getElementById('filterWrapper');
    const btnLeft = document.getElementById('slideLeft');
    const btnRight = document.getElementById('slideRight');

    // 🎯 უსაფრთხოების ფარი: თუ რომელიმე ელემენტი გვერდზე არ არის, სკრიპტი აქ წყვეტს მუშაობას
    if (!wrapper || !btnLeft || !btnRight) {
        return; 
    }

    // ერთი დაწკაპუნებით რამდენი პიქსელით გადასკროლოს (დაახლოებით 3 ბარათი)
    const scrollAmount = 400; 

    btnRight.addEventListener('click', () => {
        wrapper.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });

    btnLeft.addEventListener('click', () => {
        wrapper.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });

    // დინამიურად დავმალოთ ისრები, თუ სკროლი საწყისშია ან ბოლოშია
    function toggleArrows() {
        btnLeft.style.opacity = wrapper.scrollLeft <= 5 ? "0" : "1";
        btnLeft.style.pointerEvents = wrapper.scrollLeft <= 5 ? "none" : "auto";
        
        let maxScroll = wrapper.scrollWidth - wrapper.clientWidth;
        btnRight.style.opacity = wrapper.scrollLeft >= maxScroll - 5 ? "0" : "1";
        btnRight.style.pointerEvents = wrapper.scrollLeft >= maxScroll - 5 ? "none" : "auto";
    }

    wrapper.addEventListener('scroll', toggleArrows);
    window.addEventListener('resize', toggleArrows);
    
    // პირველადი გაშვება
    setTimeout(toggleArrows, 300);
});





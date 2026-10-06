document.addEventListener('DOMContentLoaded', () => {
    if (window.matchMedia("(pointer: fine)").matches) {
        
        const cursorDot = document.querySelector('.custom-cursor-dot');
        const cursorOutline = document.querySelector('.custom-cursor-outline');

        // 1. მაუსის მოძრაობა (კოორდინატები)
        window.addEventListener('mousemove', (e) => {
            const posX = e.clientX;
            const posY = e.clientY;

            cursorDot.style.left = `${posX}px`;
            cursorDot.style.top = `${posY}px`;

            cursorOutline.animate({
                left: `${posX}px`,
                top: `${posY}px`
            }, { duration: 500, fill: "forwards" }); 
        });

        // 2. 🎯 გასწორებული HOVER ლოგიკა გალერეის სურათებისთვის (გადიდებამდე)
        document.addEventListener('mouseover', (e) => {
            // closest() ამოწმებს, ხომ არ დგას მაუსი ჩამოთვლილ ელემენტებში ან მათ შიგნით სადმე
            if (e.target.closest('a, button, input, textarea, .explore-img-wrapper, .explore-item, .project-item, .category-pill, .social-icons a, .search-item, img')) {
                cursorDot.classList.add('hover-active');
                cursorOutline.classList.add('hover-active');
            }
        });

        document.addEventListener('mouseout', (e) => {
            if (e.target.closest('a, button, input, textarea, .explore-img-wrapper, .explore-item, .project-item, .category-pill, .social-icons a, .search-item, img')) {
                cursorDot.classList.remove('hover-active');
                cursorOutline.classList.remove('hover-active');
            }
        });
    }
});
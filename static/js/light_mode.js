document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const themeIcon = document.getElementById('themeIcon');
    const body = document.body;

    // 1. ვამოწმებთ, აქვს თუ არა მომხმარებელს უკვე შენახული ნათელი რეჟიმი მეხსიერებაში
    const currentTheme = localStorage.getItem('site-theme');
    if (currentTheme === 'light') {
        body.classList.add('light-mode');
        themeIcon.classList.replace('fa-sun', 'fa-moon'); // აიქონის შეცვლა მთვარით
    }

    // 2. ღილაკზე დაკლიკების ფუნქცია
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            // ვრთავთ/ვთიშავთ კლასს
            body.classList.toggle('light-mode');
            
            // ვამოწმებთ, ამჟამად ჩართულია თუ არა ნათელი რეჟიმი
            if (body.classList.contains('light-mode')) {
                // ვინახავთ მეხსიერებაში
                localStorage.setItem('site-theme', 'light');
                // ვცვლით მზეს მთვარით (რომ ვაჩვენოთ "დააბრუნე მუქი რეჟიმი")
                themeIcon.classList.replace('fa-sun', 'fa-moon');
            } else {
                // ვაბრუნებთ მუქ რეჟიმს
                localStorage.setItem('site-theme', 'dark');
                themeIcon.classList.replace('fa-moon', 'fa-sun');
            }
        });
    }
});
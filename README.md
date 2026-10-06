# Full-Stack Django & JavaScript Multimedia Platform

A dynamic, secure, and responsive web platform built with **Django (Python)** and modern **JavaScript (ES6+)**. The platform enables users to manage multimedia content, personalize user profiles, interact via social features (like system and social link integration), and perform real-time search with debounced asynchronous API requests.

---

## 🌟 Key Features

### 🛠️ Backend & Security
* **User Authentication & Authorization:** Secure login, registration, password hashing, and session management using Django's core authentication framework.
* **Normalized Relational Database:** Clean database architecture preventing data redundancy with strict cascade rules (`on_delete`).
* **Robust Security:** Built-in protection against Cross-Site Request Forgery (CSRF), SQL Injection, and Cross-Site Scripting (XSS).

### 🎨 Frontend & User Experience (UX)
* **Real-Time Asynchronous Live Search:** Instant search functionality implemented using the native **Fetch API** without full page reloads.
* **Search Optimization (Debouncing):** Custom JS debouncing mechanism to delay API calls during typing, reducing unnecessary server load.
* **Responsive Layout:** Clean, fully responsive design powered by **HTML5, CSS3, and Bootstrap**.
* **Profile Customization:** Support for dynamic user avatars, biographical information, and custom social media connections.

---

## 🏗️ Tech Stack

* **Backend:** Python 3.x, Django
* **Database:** SQLite3
* **Frontend:** JavaScript (ES6+ Fetch API), HTML5, CSS3, Bootstrap 5
* **Architecture:** Model-View-Template (MVT)

---

## 📂 Project Structure

```text
├── core/                   # Django application logic (views, models, forms, urls)
├── templates/              # HTML templates
├── static/                 # CSS, JavaScript (search.js), and static images
│   ├── css/
│   └── js/
├── media/                  # User-uploaded files (avatars, images)
├── manage.py               # Django management script
├── requirements.txt        # Project dependencies
└── README.md               # Project documentation



# Installation & Setup Guide
Prerequisites
Make sure you have Python 3.10+ and Git installed on your machine.

1. Clone the Repository
Bash
git clone [https://github.com/your-username/your-repository-name.git](https://github.com/your-username/your-repository-name.git)
cd your-repository-name
2. Create and Activate Virtual Environment
Windows:

Bash
python -m venv venv
venv\Scripts\activate
macOS / Linux:

Bash
python3 -m venv venv
source venv/bin/activate
3. Install Dependencies
Bash
pip install -r requirements.txt
4. Run Database Migrations
Bash
python manage.py makemigrations
python manage.py migrate
5. Create Superuser (Optional for Admin Access)
Bash
python manage.py createsuperuser
6. Start Development Server
Bash
python manage.py runserver
Visit http://127.0.0.1:8000/ in your browser.

🔬 Asynchronous Live Search & Debouncing Logic
The Live Search feature uses an optimized client-side debouncing technique to prevent server strain:

JavaScript
// Debounce helper to delay search execution until typing pauses
function debounce(func, delay = 300) {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}
📜 License
This project was developed as a Bachelor's Thesis capstone project. Free to use for educational and demonstration purposes.
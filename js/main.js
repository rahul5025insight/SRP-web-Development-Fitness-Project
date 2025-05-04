// Dark Mode Toggle
// const themeToggle = document.createElement('button');
// themeToggle.className = 'theme-toggle';
// themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
// document.body.appendChild(themeToggle);

// Check for saved theme preference
// const currentTheme = localStorage.getItem('theme');
// if (currentTheme) {
//     document.documentElement.setAttribute('data-theme', currentTheme);
//     updateThemeIcon(currentTheme);
// }


// // function updateThemeIcon(theme) {
// //     const icon = themeToggle.querySelector('i');
// //     icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
// // }

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Animation on Scroll
const animateOnScroll = () => {
    const elements = document.querySelectorAll('.feature-card, .hero-content, .hero-image');
    
    elements.forEach(element => {
        const elementPosition = element.getBoundingClientRect().top;
        const screenPosition = window.innerHeight / 1.3;
        
        if (elementPosition < screenPosition) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
};

// Set initial styles for animation
document.querySelectorAll('.feature-card, .hero-content, .hero-image').forEach(element => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
});

window.addEventListener('scroll', animateOnScroll);
window.addEventListener('load', animateOnScroll);

// Form Validation
function validateForm(formId) {
    const form = document.getElementById(formId);
    const inputs = form.querySelectorAll('input[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.classList.add('error');
        } else {
            input.classList.remove('error');
        }
    });

    return isValid;
}

// Add error class styling
const style = document.createElement('style');
style.textContent = `
    .error {
        border-color: #ff4444 !important;
    }
    
    .error::placeholder {
        color: #ff4444;
    }
`;
document.head.appendChild(style);

// Mobile Menu Toggle
const createMobileMenu = () => {
    const nav = document.querySelector('nav');
    const mobileMenuBtn = document.createElement('button');
    mobileMenuBtn.className = 'mobile-menu-btn';
    mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
    nav.insertBefore(mobileMenuBtn, nav.firstChild);

    const navLinks = document.querySelector('.nav-links');
    
    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        mobileMenuBtn.querySelector('i').className = 
            navLinks.classList.contains('active') ? 'fas fa-times' : 'fas fa-bars';
    });
};

// Only create mobile menu if on mobile
if (window.innerWidth <= 768) {
    createMobileMenu();
}

// Add mobile menu styles
const mobileStyles = document.createElement('style');
mobileStyles.textContent = `
    .mobile-menu-btn {
        display: none;
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: var(--text-color);
    }

    @media (max-width: 768px) {
        .mobile-menu-btn {
            display: block;
        }

        .nav-links {
            position: fixed;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100vh;
            background-color: var(--background-color);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            transition: left 0.3s ease;
        }

        .nav-links.active {
            left: 0;
        }

        .nav-links a {
            margin: 1rem 0;
            font-size: 1.2rem;
        }
    }
`;
document.head.appendChild(mobileStyles); 
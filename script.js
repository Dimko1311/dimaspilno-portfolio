// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}));

// Smooth scrolling for navigation links
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

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// Form submission handling
const contactForm = document.querySelector('.contact-form');
contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(this);
    const name = formData.get('name');
    const email = formData.get('email');
    const company = formData.get('company');
    const message = formData.get('message');
    
    // Simple validation
    if (!name || !email || !message) {
        alert('Please fill in all required fields.');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        return;
    }
    
    // Simulate form submission
    const submitButton = this.querySelector('.btn-primary');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Sending...';
    submitButton.disabled = true;
    
    // Simulate API call delay
    setTimeout(() => {
        alert('Thank you for your message! I will get back to you within 24 hours.');
        this.reset();
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }, 1500);
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.service-card, .testimonial-card, .timeline-item');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
    });
});

// Add active state to navigation links based on scroll position
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Add typing effect for hero title
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.textContent = '';
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Copy account number function
function copyAccountNumber() {
    const accountNumber = document.getElementById('donation-account').textContent;
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(accountNumber).then(() => {
            showCopyNotification('Account number copied!');
        });
    } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = accountNumber;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showCopyNotification('Account number copied!');
    }
}

function showCopyNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--success-color);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        font-size: 0.9rem;
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
        box-shadow: var(--shadow-lg);
    `;
    
    document.body.appendChild(notification);
    
    // Show and hide notification
    setTimeout(() => notification.style.opacity = '1', 10);
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
}

// Load content from admin panel
function loadPortfolioData() {
    // Try to get data from localStorage directly
    let data = null;
    try {
        const liveData = localStorage.getItem('portfolio_live_data');
        const portfolioData = localStorage.getItem('portfolio_data');
        
        if (liveData) {
            data = JSON.parse(liveData);
            console.log('Loaded live data from admin panel');
        } else if (portfolioData) {
            data = JSON.parse(portfolioData);
            console.log('Loaded portfolio data from admin panel');
        } else {
            console.log('No admin data found, using default content');
            return; // Exit early if no data
        }
    } catch (error) {
        console.error('Error loading portfolio data:', error);
        return;
    }
    
    if (data) {
        // Update hero section
        if (data.heroTitle) {
            document.querySelector('.hero-title').textContent = data.heroTitle;
        }
        if (data.heroSubtitle) {
            document.querySelector('.hero-subtitle').textContent = data.heroSubtitle;
        }

        // Update portfolio image
        if (data.portfolioImage) {
            const heroPlaceholder = document.getElementById('hero-image-container');
            const portfolioImage = document.getElementById('portfolio-image');
            portfolioImage.src = data.portfolioImage;
            portfolioImage.style.display = 'block';
            heroPlaceholder.style.background = 'transparent';
        }

        // Update services
        if (data.services && data.services.length > 0) {
            const servicesGrid = document.querySelector('.services-grid');
            servicesGrid.innerHTML = '';
            
            data.services.forEach(service => {
                const serviceCard = document.createElement('div');
                serviceCard.className = 'service-card';
                serviceCard.innerHTML = `
                    <div class="service-icon">${service.icon}</div>
                    <h3>${service.title}</h3>
                    <p>${service.description}</p>
                `;
                servicesGrid.appendChild(serviceCard);
            });
        }

        // Update experience
        if (data.experience && data.experience.length > 0) {
            const timeline = document.querySelector('.timeline');
            timeline.innerHTML = '';
            
            data.experience.forEach(exp => {
                const timelineItem = document.createElement('div');
                timelineItem.className = 'timeline-item';
                
                const achievementsList = exp.achievements.map(achievement => 
                    `<li>${achievement}</li>`
                ).join('');
                
                timelineItem.innerHTML = `
                    <div class="timeline-marker"></div>
                    <div class="timeline-content">
                        <h3>${exp.title}</h3>
                        <p class="timeline-period">${exp.period}</p>
                        <ul>${achievementsList}</ul>
                    </div>
                `;
                timeline.appendChild(timelineItem);
            });
        }

        // Update testimonials
        if (data.testimonials && data.testimonials.length > 0) {
            const testimonialsGrid = document.querySelector('.testimonials-grid');
            testimonialsGrid.innerHTML = '';
            
            data.testimonials.forEach(testimonial => {
                const testimonialCard = document.createElement('div');
                testimonialCard.className = 'testimonial-card';
                testimonialCard.innerHTML = `
                    <p>"${testimonial.text}"</p>
                    <div class="testimonial-author">
                        <strong>${testimonial.author}</strong>
                        <span>${testimonial.position}</span>
                    </div>
                `;
                testimonialsGrid.appendChild(testimonialCard);
            });
        }

        // Update donation section
        if (data.donation) {
            const donationSection = document.getElementById('donation');
            const donationNav = document.querySelector('.donation-nav');
            
            if (data.donation.visible) {
                donationSection.style.display = 'block';
                donationNav.style.display = 'block';
            } else {
                donationSection.style.display = 'none';
                donationNav.style.display = 'none';
            }
            
            if (data.donation.title) {
                document.getElementById('donation-title').textContent = data.donation.title;
            }
            if (data.donation.message) {
                document.getElementById('donation-message').textContent = data.donation.message;
            }
            if (data.donation.account) {
                document.getElementById('donation-account').textContent = data.donation.account;
            }
        }

        // Update contact information
        if (data.contact) {
            const contactItems = document.querySelectorAll('.contact-item span:last-child');
            if (data.contact.email && contactItems[0]) {
                contactItems[0].textContent = data.contact.email;
            }
            if (data.contact.phone && contactItems[1]) {
                contactItems[1].textContent = data.contact.phone;
            }
            if (data.contact.location && contactItems[2]) {
                contactItems[2].textContent = data.contact.location;
            }
        }
    }
}

// Listen for storage changes from admin panel
window.addEventListener('storage', (e) => {
    if (e.key === 'portfolio_live_data' || e.key === 'portfolio_data') {
        loadPortfolioData();
    }
});

// Also check for updates periodically
setInterval(() => {
    loadPortfolioData();
}, 2000); // Check every 2 seconds

// Initialize typing effect when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Load portfolio data first
    loadPortfolioData();
    
    const heroTitle = document.querySelector('.hero-title');
    const originalText = heroTitle.textContent;
    
    setTimeout(() => {
        typeWriter(heroTitle, originalText, 50);
    }, 500);
});

// Add parallax effect to hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroImage = document.querySelector('.hero-placeholder');
    
    if (heroImage && scrolled < window.innerHeight) {
        const speed = scrolled * 0.3;
        heroImage.style.transform = `translateY(${speed}px)`;
    }
});

// Add hover effects for service cards
document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Add click-to-copy functionality for contact details
document.querySelectorAll('.contact-item').forEach(item => {
    item.addEventListener('click', function() {
        const text = this.querySelector('span:last-child').textContent;
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                showCopyNotification(this);
            });
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showCopyNotification(this);
        }
    });
});

function showCopyNotification(element) {
    const notification = document.createElement('div');
    notification.textContent = 'Copied!';
    notification.style.cssText = `
        position: absolute;
        background: var(--success-color);
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        font-size: 0.8rem;
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
    `;
    
    element.style.position = 'relative';
    element.appendChild(notification);
    
    // Position the notification
    const rect = element.getBoundingClientRect();
    notification.style.top = '-40px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
    
    // Show and hide notification
    setTimeout(() => notification.style.opacity = '1', 10);
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => element.removeChild(notification), 300);
    }, 2000);
}
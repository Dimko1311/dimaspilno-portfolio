// Image Cropping Manager
class ImageCropper {
    constructor() {
        this.cropper = null;
        this.originalImage = null;
        this.croppedCallback = null;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Crop button
        document.getElementById('crop-image-btn').addEventListener('click', () => {
            this.openCropModal();
        });

        // Modal close buttons
        document.querySelector('.crop-close-btn').addEventListener('click', () => {
            this.closeCropModal();
        });

        document.querySelector('.crop-modal-overlay').addEventListener('click', () => {
            this.closeCropModal();
        });

        // Crop controls
        document.getElementById('zoom-in-btn').addEventListener('click', () => {
            this.zoomIn();
        });

        document.getElementById('zoom-out-btn').addEventListener('click', () => {
            this.zoomOut();
        });

        document.getElementById('reset-crop-btn').addEventListener('click', () => {
            this.resetCrop();
        });

        // Aspect ratio buttons
        document.querySelectorAll('.aspect-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setAspectRatio(e.target.dataset.aspect);
                this.updateAspectButtons(e.target);
            });
        });

        // Action buttons
        document.getElementById('cancel-crop-btn').addEventListener('click', () => {
            this.closeCropModal();
        });

        document.getElementById('apply-crop-btn').addEventListener('click', () => {
            this.applyCrop();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (this.cropper && document.getElementById('crop-modal').style.display === 'flex') {
                switch (e.key) {
                    case 'Escape':
                        e.preventDefault();
                        this.closeCropModal();
                        break;
                    case 'Enter':
                        e.preventDefault();
                        this.applyCrop();
                        break;
                    case '+':
                    case '=':
                        e.preventDefault();
                        this.zoomIn();
                        break;
                    case '-':
                        e.preventDefault();
                        this.zoomOut();
                        break;
                    case 'r':
                    case 'R':
                        e.preventDefault();
                        this.resetCrop();
                        break;
                }
            }
        });
    }

    openCropModal() {
        const currentImage = document.getElementById('current-portfolio-image');
        if (!currentImage.src || currentImage.style.display === 'none') {
            alert('Please upload an image first');
            return;
        }

        this.originalImage = currentImage.src;
        const cropImage = document.getElementById('crop-image');
        cropImage.src = this.originalImage;

        document.getElementById('crop-modal').style.display = 'flex';

        // Initialize cropper after image loads
        cropImage.onload = () => {
            if (this.cropper) {
                this.cropper.destroy();
            }

            this.cropper = new Cropper(cropImage, {
                aspectRatio: NaN, // Free aspect ratio initially
                viewMode: 2,
                autoCropArea: 0.8,
                responsive: true,
                restore: false,
                checkCrossOrigin: false,
                checkOrientation: false,
                modal: true,
                guides: true,
                center: true,
                highlight: false,
                cropBoxMovable: true,
                cropBoxResizable: true,
                toggleDragModeOnDblclick: false,
                ready: () => {
                    this.updateDimensions();
                },
                crop: () => {
                    this.updateDimensions();
                }
            });
        };
    }

    closeCropModal() {
        if (this.cropper) {
            this.cropper.destroy();
            this.cropper = null;
        }
        document.getElementById('crop-modal').style.display = 'none';
        this.resetAspectButtons();
    }

    zoomIn() {
        if (this.cropper) {
            this.cropper.zoom(0.1);
        }
    }

    zoomOut() {
        if (this.cropper) {
            this.cropper.zoom(-0.1);
        }
    }

    resetCrop() {
        if (this.cropper) {
            this.cropper.reset();
            this.updateDimensions();
        }
    }

    setAspectRatio(ratio) {
        if (!this.cropper) return;

        if (ratio === 'free') {
            this.cropper.setAspectRatio(NaN);
        } else {
            this.cropper.setAspectRatio(parseFloat(ratio));
        }
    }

    updateAspectButtons(activeBtn) {
        document.querySelectorAll('.aspect-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        activeBtn.classList.add('active');
    }

    resetAspectButtons() {
        document.querySelectorAll('.aspect-btn').forEach(btn => {
            btn.classList.remove('active');
        });
    }

    updateDimensions() {
        if (!this.cropper) return;

        const data = this.cropper.getCropBoxData();
        const imageData = this.cropper.getImageData();
        
        // Calculate actual crop dimensions
        const scaleX = imageData.naturalWidth / imageData.width;
        const scaleY = imageData.naturalHeight / imageData.height;
        
        const cropWidth = Math.round(data.width * scaleX);
        const cropHeight = Math.round(data.height * scaleY);

        document.getElementById('crop-dimensions').textContent = 
            `Crop size: ${cropWidth} × ${cropHeight} pixels`;
    }

    applyCrop() {
        if (!this.cropper) return;

        const applyBtn = document.getElementById('apply-crop-btn');
        applyBtn.classList.add('loading');
        applyBtn.textContent = 'Processing...';

        // Get cropped canvas with high quality
        const canvas = this.cropper.getCroppedCanvas({
            maxWidth: 1200,
            maxHeight: 1200,
            minWidth: 256,
            minHeight: 256,
            fillColor: '#fff',
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high'
        });

        // Convert to blob with good quality
        canvas.toBlob((blob) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.croppedCallback(e.target.result);
                this.closeCropModal();
                
                // Reset button
                applyBtn.classList.remove('loading');
                applyBtn.textContent = 'Apply Crop';
            };
            reader.readAsDataURL(blob);
        }, 'image/jpeg', 0.9);
    }

    setCroppedCallback(callback) {
        this.croppedCallback = callback;
    }
}

// Admin Panel JavaScript
class PortfolioAdmin {
    constructor() {
        this.isAuthenticated = false;
        this.adminPassword = '2046';
        this.data = this.loadData();
        this.imageCropper = new ImageCropper();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuth();
        this.setupImageCropper();
    }

    setupImageCropper() {
        // Set callback for when image is cropped
        this.imageCropper.setCroppedCallback((croppedDataUrl) => {
            this.data.portfolioImage = croppedDataUrl;
            const img = document.getElementById('current-portfolio-image');
            const placeholder = document.getElementById('image-placeholder');
            img.src = croppedDataUrl;
            img.style.display = 'block';
            placeholder.style.display = 'none';
            
            // Show success message
            this.showSaveStatus('Image cropped successfully! Remember to save your changes.', 'success');
        });
    }

    setupEventListeners() {
        // Login form
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Logout
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.logout();
        });

        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Save all changes
        document.getElementById('save-all-btn').addEventListener('click', () => {
            this.saveAllChanges();
        });

        // Preview site
        document.getElementById('preview-btn').addEventListener('click', () => {
            window.open('/', '_blank');
        });

        // Clear storage
        document.getElementById('clear-storage-btn').addEventListener('click', () => {
            this.clearStorage();
        });

        // Image upload
        document.getElementById('portfolio-image-upload').addEventListener('change', (e) => {
            this.handleImageUpload(e);
        });

        // Remove image
        document.getElementById('remove-image-btn').addEventListener('click', () => {
            this.removeImage();
        });

        // Dynamic content buttons
        document.getElementById('add-service-btn').addEventListener('click', () => {
            this.addService();
        });

        document.getElementById('add-experience-btn').addEventListener('click', () => {
            this.addExperience();
        });

        document.getElementById('add-testimonial-btn').addEventListener('click', () => {
            this.addTestimonial();
        });
    }

    checkAuth() {
        const authStatus = localStorage.getItem('admin_authenticated');
        if (authStatus === 'true') {
            this.isAuthenticated = true;
            this.showAdminPanel();
        }
    }

    handleLogin() {
        const password = document.getElementById('admin-password').value;
        const errorElement = document.getElementById('login-error');

        if (password === this.adminPassword) {
            this.isAuthenticated = true;
            localStorage.setItem('admin_authenticated', 'true');
            this.showAdminPanel();
            errorElement.style.display = 'none';
        } else {
            errorElement.textContent = 'Incorrect password. Please try again.';
            errorElement.style.display = 'block';
        }
    }

    logout() {
        this.isAuthenticated = false;
        localStorage.removeItem('admin_authenticated');
        document.getElementById('login-container').style.display = 'flex';
        document.getElementById('admin-panel').style.display = 'none';
        document.getElementById('admin-password').value = '';
    }

    showAdminPanel() {
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('admin-panel').style.display = 'flex';
        this.loadFormData();
        this.updateStorageUsage();
    }

    clearStorage() {
        if (confirm('Are you sure you want to clear all stored data? This will reset everything to defaults.')) {
            localStorage.removeItem('portfolio_data');
            localStorage.removeItem('portfolio_live_data');
            this.data = this.loadData(); // Reload defaults
            this.loadFormData(); // Refresh form
            this.updateStorageUsage();
            this.showSaveStatus('Storage cleared successfully!', 'success');
        }
    }

    updateStorageUsage() {
        try {
            // Estimate localStorage usage
            let totalSize = 0;
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    totalSize += localStorage[key].length;
                }
            }
            
            // Convert to KB and estimate percentage (assuming 5MB limit)
            const sizeKB = Math.round(totalSize / 1024);
            const percentage = Math.round((totalSize / (5 * 1024 * 1024)) * 100);
            
            const storageElement = document.getElementById('storage-usage');
            storageElement.textContent = `Storage: ${sizeKB}KB (${percentage}%)`;
            
            // Color code based on usage
            if (percentage > 80) {
                storageElement.style.color = 'var(--danger-color)';
            } else if (percentage > 60) {
                storageElement.style.color = 'var(--warning-color)';
            } else {
                storageElement.style.color = 'var(--success-color)';
            }
        } catch (error) {
            document.getElementById('storage-usage').textContent = 'Storage: Unknown';
        }
    }

    switchTab(tabId) {
        // Remove active class from all tabs and panels
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));

        // Add active class to clicked tab and corresponding panel
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
        document.getElementById(`${tabId}-tab`).classList.add('active');
    }

    loadData() {
        const defaultData = {
            heroTitle: 'Professional Portfolio Management',
            heroSubtitle: 'Experienced portfolio manager specializing in strategic planning, risk management, and driving exceptional results for clients and organizations.',
            biography: 'Professional portfolio manager with extensive experience in strategic planning, team leadership, and financial management.',
            portfolioImage: null,
            services: [
                {
                    icon: '👥',
                    title: 'People Management',
                    description: 'Leading high-performing teams with focus on collaboration, growth, and achieving strategic objectives.'
                },
                {
                    icon: '📋',
                    title: 'Effective Project Planning',
                    description: 'Comprehensive project strategy and execution, ensuring timely delivery and optimal resource allocation.'
                },
                {
                    icon: '🛡️',
                    title: 'Crisis Management',
                    description: 'Swift decision-making and strategic response during challenging situations to minimize impact and maintain stability.'
                },
                {
                    icon: '⚖️',
                    title: 'Risk Minimization',
                    description: 'Proactive risk assessment and mitigation strategies to protect investments and ensure sustainable growth.'
                },
                {
                    icon: '⚡',
                    title: 'Efficiency Improvement',
                    description: 'Streamlining processes and optimizing workflows to maximize productivity and reduce operational costs.'
                },
                {
                    icon: '💼',
                    title: 'Attracting Financial Capital',
                    description: 'Developing compelling investment propositions and building relationships with key financial stakeholders.'
                }
            ],
            experience: [
                {
                    title: 'Senior Portfolio Manager',
                    period: '2020 - Present',
                    achievements: [
                        'Managed investment portfolios worth $50M+ with consistent above-market returns',
                        'Led cross-functional teams of 15+ professionals across multiple projects',
                        'Implemented risk management frameworks reducing portfolio volatility by 25%'
                    ]
                },
                {
                    title: 'Project Manager',
                    period: '2017 - 2020',
                    achievements: [
                        'Successfully delivered 20+ complex projects on time and under budget',
                        'Developed crisis management protocols adopted company-wide',
                        'Improved operational efficiency by 30% through process optimization'
                    ]
                },
                {
                    title: 'Financial Analyst',
                    period: '2014 - 2017',
                    achievements: [
                        'Conducted comprehensive market analysis and investment research',
                        'Supported capital raising efforts totaling $100M+',
                        'Built financial models used for strategic decision-making'
                    ]
                }
            ],
            testimonials: [
                {
                    text: "Dmitrij's strategic approach to portfolio management has consistently delivered exceptional results. His ability to navigate complex market conditions while maintaining focus on long-term growth is truly impressive.",
                    author: 'Sarah Johnson',
                    position: 'CEO, TechVentures Inc.'
                },
                {
                    text: "Working with Dmitrij during our company's restructuring was a game-changer. His crisis management skills and leadership helped us emerge stronger and more efficient than ever.",
                    author: 'Michael Chen',
                    position: 'CFO, Global Solutions Ltd.'
                },
                {
                    text: "The risk management frameworks Dmitrij implemented have significantly improved our portfolio stability. His expertise in attracting financial capital was instrumental in our recent funding round.",
                    author: 'Emma Rodriguez',
                    position: 'Investment Director, Capital Partners'
                }
            ],
            donation: {
                visible: true,
                title: 'Support SPILNO',
                message: 'Donations are appreciated and help support the development of my new startup — SPILNO. Thank you for your support!',
                account: '5167 8032 6155 4666'
            },
            contact: {
                email: 'dmitrij@portfolio-solutions.com',
                phone: '+1 (555) 123-4567',
                location: 'New York, NY'
            }
        };

        const savedData = localStorage.getItem('portfolio_data');
        return savedData ? { ...defaultData, ...JSON.parse(savedData) } : defaultData;
    }

    saveData() {
        try {
            const dataString = JSON.stringify(this.data);
            
            // Check if data size is reasonable (less than 4MB to be safe)
            if (dataString.length > 4 * 1024 * 1024) {
                throw new Error('Data too large');
            }
            
            localStorage.setItem('portfolio_data', dataString);
            this.showSaveStatus('Changes saved successfully!', 'success');
        } catch (error) {
            if (error.name === 'QuotaExceededError' || error.message === 'Data too large') {
                this.handleStorageQuotaExceeded();
            } else {
                this.showSaveStatus('Error saving changes. Please try again.', 'error');
                console.error('Save error:', error);
            }
        }
    }

    handleStorageQuotaExceeded() {
        // Try to free up space by removing image and saving again
        const imageBackup = this.data.portfolioImage;
        this.data.portfolioImage = null;
        
        try {
            localStorage.setItem('portfolio_data', JSON.stringify(this.data));
            this.showSaveStatus('Storage full! Image removed to save changes. Please use a smaller image.', 'warning');
            
            // Update UI to reflect removed image
            const img = document.getElementById('current-portfolio-image');
            const placeholder = document.getElementById('image-placeholder');
            img.style.display = 'none';
            placeholder.style.display = 'block';
            document.getElementById('portfolio-image-upload').value = '';
        } catch (secondError) {
            // If still failing, restore image and show error
            this.data.portfolioImage = imageBackup;
            this.showSaveStatus('Storage quota exceeded! Please clear browser data or use smaller content.', 'error');
        }
    }

    showSaveStatus(message = 'Changes saved successfully!', type = 'success') {
        const status = document.getElementById('save-status');
        const statusText = status.querySelector('.status-text');
        
        // Update message and styling based on type
        statusText.textContent = message;
        status.className = 'save-status';
        
        switch (type) {
            case 'success':
                status.style.background = 'var(--success-color)';
                break;
            case 'error':
                status.style.background = 'var(--danger-color)';
                break;
            case 'warning':
                status.style.background = 'var(--warning-color)';
                status.style.color = 'var(--text-primary)';
                break;
        }
        
        status.style.display = 'block';
        setTimeout(() => {
            status.style.display = 'none';
            status.style.color = 'white'; // Reset color
        }, 5000); // Show longer for warnings/errors
    }

    loadFormData() {
        // Load general info
        document.getElementById('hero-title').value = this.data.heroTitle;
        document.getElementById('hero-subtitle').value = this.data.heroSubtitle;
        document.getElementById('biography').value = this.data.biography;

        // Load portfolio image
        if (this.data.portfolioImage) {
            const img = document.getElementById('current-portfolio-image');
            const placeholder = document.getElementById('image-placeholder');
            const cropBtn = document.getElementById('crop-image-btn');
            
            img.src = this.data.portfolioImage;
            img.style.display = 'block';
            placeholder.style.display = 'none';
            cropBtn.style.display = 'inline-block';
        }

        // Load services
        this.renderServices();

        // Load experience
        this.renderExperience();

        // Load testimonials
        this.renderTestimonials();

        // Load donation settings
        document.getElementById('donation-visible').checked = this.data.donation.visible;
        document.getElementById('donation-title').value = this.data.donation.title;
        document.getElementById('donation-message').value = this.data.donation.message;
        document.getElementById('donation-account').value = this.data.donation.account;

        // Load contact info
        document.getElementById('contact-email').value = this.data.contact.email;
        document.getElementById('contact-phone').value = this.data.contact.phone;
        document.getElementById('contact-location').value = this.data.contact.location;
    }

    handleImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            // Check file size (limit to 5MB for initial upload since we'll crop it)
            if (file.size > 5 * 1024 * 1024) {
                alert('Image file is too large. Please choose an image smaller than 5MB.');
                return;
            }

            // Load image directly without compression for cropping
            const reader = new FileReader();
            reader.onload = (e) => {
                this.data.portfolioImage = e.target.result;
                const img = document.getElementById('current-portfolio-image');
                const placeholder = document.getElementById('image-placeholder');
                const cropBtn = document.getElementById('crop-image-btn');
                
                img.src = e.target.result;
                img.style.display = 'block';
                placeholder.style.display = 'none';
                cropBtn.style.display = 'inline-block';
                
                this.showSaveStatus('Image uploaded! You can now crop it if needed.', 'success');
            };
            reader.readAsDataURL(file);
        }
    }

    compressImage(file, callback) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            // Set maximum dimensions
            const maxWidth = 800;
            const maxHeight = 800;
            
            let { width, height } = img;
            
            // Calculate new dimensions
            if (width > height) {
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = (width * maxHeight) / height;
                    height = maxHeight;
                }
            }

            canvas.width = width;
            canvas.height = height;

            // Draw and compress
            ctx.drawImage(img, 0, 0, width, height);
            
            // Convert to compressed JPEG with quality 0.7
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
            callback(compressedDataUrl);
        };

        img.src = URL.createObjectURL(file);
    }

    removeImage() {
        this.data.portfolioImage = null;
        const img = document.getElementById('current-portfolio-image');
        const placeholder = document.getElementById('image-placeholder');
        const cropBtn = document.getElementById('crop-image-btn');
        
        img.style.display = 'none';
        placeholder.style.display = 'block';
        cropBtn.style.display = 'none';
        document.getElementById('portfolio-image-upload').value = '';
        
        this.showSaveStatus('Image removed successfully!', 'success');
    }

    renderServices() {
        const container = document.getElementById('services-list');
        container.innerHTML = '';

        this.data.services.forEach((service, index) => {
            const serviceElement = this.createServiceElement(service, index);
            container.appendChild(serviceElement);
        });
    }

    createServiceElement(service, index) {
        const template = document.getElementById('service-template');
        const element = template.content.cloneNode(true);

        element.querySelector('.service-icon').value = service.icon;
        element.querySelector('.service-title').value = service.title;
        element.querySelector('.service-description').value = service.description;

        element.querySelector('.remove-service-btn').addEventListener('click', () => {
            this.removeService(index);
        });

        return element;
    }

    addService() {
        this.data.services.push({
            icon: '📈',
            title: 'New Specialization',
            description: 'Description of this specialization...'
        });
        this.renderServices();
    }

    removeService(index) {
        this.data.services.splice(index, 1);
        this.renderServices();
    }

    renderExperience() {
        const container = document.getElementById('experience-list');
        container.innerHTML = '';

        this.data.experience.forEach((exp, index) => {
            const expElement = this.createExperienceElement(exp, index);
            container.appendChild(expElement);
        });
    }

    createExperienceElement(experience, index) {
        const template = document.getElementById('experience-template');
        const element = template.content.cloneNode(true);

        element.querySelector('.experience-title').value = experience.title;
        element.querySelector('.experience-period').value = experience.period;
        element.querySelector('.experience-achievements').value = experience.achievements.join('\n');

        element.querySelector('.remove-experience-btn').addEventListener('click', () => {
            this.removeExperience(index);
        });

        return element;
    }

    addExperience() {
        this.data.experience.push({
            title: 'New Position',
            period: '2024 - Present',
            achievements: ['Achievement 1', 'Achievement 2']
        });
        this.renderExperience();
    }

    removeExperience(index) {
        this.data.experience.splice(index, 1);
        this.renderExperience();
    }

    renderTestimonials() {
        const container = document.getElementById('testimonials-list');
        container.innerHTML = '';

        this.data.testimonials.forEach((testimonial, index) => {
            const testimonialElement = this.createTestimonialElement(testimonial, index);
            container.appendChild(testimonialElement);
        });
    }

    createTestimonialElement(testimonial, index) {
        const template = document.getElementById('testimonial-template');
        const element = template.content.cloneNode(true);

        element.querySelector('.testimonial-text').value = testimonial.text;
        element.querySelector('.testimonial-author').value = testimonial.author;
        element.querySelector('.testimonial-position').value = testimonial.position;

        element.querySelector('.remove-testimonial-btn').addEventListener('click', () => {
            this.removeTestimonial(index);
        });

        return element;
    }

    addTestimonial() {
        this.data.testimonials.push({
            text: 'New testimonial text...',
            author: 'Client Name',
            position: 'Position, Company'
        });
        this.renderTestimonials();
    }

    removeTestimonial(index) {
        this.data.testimonials.splice(index, 1);
        this.renderTestimonials();
    }

    saveAllChanges() {
        // Save general info
        this.data.heroTitle = document.getElementById('hero-title').value;
        this.data.heroSubtitle = document.getElementById('hero-subtitle').value;
        this.data.biography = document.getElementById('biography').value;

        // Save services
        this.data.services = [];
        document.querySelectorAll('.service-item').forEach(item => {
            this.data.services.push({
                icon: item.querySelector('.service-icon').value,
                title: item.querySelector('.service-title').value,
                description: item.querySelector('.service-description').value
            });
        });

        // Save experience
        this.data.experience = [];
        document.querySelectorAll('.experience-item').forEach(item => {
            const achievements = item.querySelector('.experience-achievements').value
                .split('\n')
                .filter(line => line.trim() !== '');
            
            this.data.experience.push({
                title: item.querySelector('.experience-title').value,
                period: item.querySelector('.experience-period').value,
                achievements: achievements
            });
        });

        // Save testimonials
        this.data.testimonials = [];
        document.querySelectorAll('.testimonial-item').forEach(item => {
            this.data.testimonials.push({
                text: item.querySelector('.testimonial-text').value,
                author: item.querySelector('.testimonial-author').value,
                position: item.querySelector('.testimonial-position').value
            });
        });

        // Save donation settings
        this.data.donation.visible = document.getElementById('donation-visible').checked;
        this.data.donation.title = document.getElementById('donation-title').value;
        this.data.donation.message = document.getElementById('donation-message').value;
        this.data.donation.account = document.getElementById('donation-account').value;

        // Save contact info
        this.data.contact.email = document.getElementById('contact-email').value;
        this.data.contact.phone = document.getElementById('contact-phone').value;
        this.data.contact.location = document.getElementById('contact-location').value;

        this.saveData();
        this.updateMainSite();
        this.updateStorageUsage();
    }

    updateMainSite() {
        // This function would typically send data to the main site
        // For now, we'll store it in localStorage and the main site will read it
        try {
            localStorage.setItem('portfolio_live_data', JSON.stringify(this.data));
            console.log('Portfolio data updated for main site');
        } catch (error) {
            console.error('Error updating main site data:', error);
        }
    }
}

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PortfolioAdmin();
});

// Export data function for external access
window.getPortfolioData = () => {
    const data = localStorage.getItem('portfolio_live_data');
    return data ? JSON.parse(data) : null;
};
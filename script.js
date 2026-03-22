// State management
let currentFile = null;
let currentResult = null;

// Page navigation
function showPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('profileDropdown').classList.remove('active');

    if (page === 'home') {
        document.getElementById('homePage').classList.add('active');
    } else if (page === 'upload') {
        document.getElementById('uploadPage').classList.add('active');
    } else if (page === 'results') {
        document.getElementById('resultsPage').classList.add('active');
    } else if (page === 'settings') {
        document.getElementById('settingsPage').classList.add('active');
    } else if (page === 'profile') {
        document.getElementById('profilePage').classList.add('active');
    }

    window.scrollTo(0, 0);
}

// File handling
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) processFile(file);
}

function processFile(file) {
    currentFile = file;
    const reader = new FileReader();

    reader.onload = function (e) {
        const preview = document.getElementById('previewImage');
        preview.src = e.target.result;

        document.getElementById('uploadZone').style.display = 'none';
        document.getElementById('uploadPreview').classList.add('active');
        document.getElementById('analyzeBtn').disabled = false;
    };

    reader.readAsDataURL(file);
}

function removeFile(event) {
    event.stopPropagation();
    currentFile = null;
    document.getElementById('fileInput').value = '';
    document.getElementById('uploadZone').style.display = 'block';
    document.getElementById('uploadPreview').classList.remove('active');
    document.getElementById('analyzeBtn').disabled = true;
}

function loadDemo() {
    // Create synthetic X-ray
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 500;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 400, 500);

    // Bone structure
    const gradient = ctx.createRadialGradient(200, 250, 20, 200, 250, 120);
    gradient.addColorStop(0, '#cbd5e1');
    gradient.addColorStop(0.5, '#94a3b8');
    gradient.addColorStop(1, '#e2e8f0');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(200, 250, 60, 100, 0, 0, Math.PI * 2);
    ctx.fill();

    // Trabecular pattern
    for (let i = 0; i < 200; i++) {
        const x = 150 + Math.random() * 100;
        const y = 180 + Math.random() * 140;
        ctx.fillStyle = `rgba(148, 163, 184, ${0.3 + Math.random() * 0.4})`;
        ctx.beginPath();
        ctx.arc(x, y, 1 + Math.random() * 2, 0, Math.PI * 2);
        ctx.fill();
    }

    canvas.toBlob(blob => {
        const file = new File([blob], 'demo_xray.jpg', { type: 'image/jpeg' });
        processFile(file);
    }, 'image/jpeg');
}

// Drag and drop
const uploadArea = document.getElementById('uploadArea');

if (uploadArea) {
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            processFile(file);
        }
    });
}

// Analysis
function startAnalysis() {
    if (!currentFile) return;

    const overlay = document.getElementById('loadingOverlay');
    const step = document.getElementById('loadingStep');
    const bar = document.getElementById('loadingBar');

    overlay.classList.add('active');

    const steps = [
        'Loading neural network...',
        'Preprocessing image...',
        'Extracting features...',
        'Generating predictions...',
        'Creating visualization...'
    ];

    let progress = 0;
    const interval = setInterval(() => {
        progress += 20;
        bar.style.width = progress + '%';
        step.textContent = steps[Math.floor(progress / 20) - 1] || 'Finalizing...';

        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                overlay.classList.remove('active');
                generateResults();
                showPage('results');
            }, 500);
        }
    }, 400);
}

function generateResults() {
    // Simulate different results based on random seed
    const rand = Math.random();
    let result;

    if (rand < 0.33) {
        result = {
            risk: 'low',
            percentage: 23,
            label: 'Low Risk',
            prediction: 'Normal Bone Density',
            confidence: '91.2%',
            tscore: '+0.5',
            recommendation: 'Bone density is within normal range. Maintain current lifestyle with adequate calcium intake and regular weight-bearing exercise.',
            color: 'var(--primary-teal)'
        };
    } else if (rand < 0.66) {
        result = {
            risk: 'medium',
            percentage: 68,
            label: 'Medium Risk',
            prediction: 'Osteopenia Detected',
            confidence: '87.3%',
            tscore: '-1.8',
            recommendation: 'Low bone density detected. Schedule a DEXA scan for confirmatory diagnosis. Consider calcium (1200mg/day) and vitamin D (800-1000 IU/day) supplementation.',
            color: 'var(--warning)'
        };
    } else {
        result = {
            risk: 'high',
            percentage: 89,
            label: 'High Risk',
            prediction: 'Osteoporosis Suspected',
            confidence: '94.7%',
            tscore: '-3.2',
            recommendation: 'Significant bone density reduction detected. Immediate DEXA scan recommended. Consult endocrinologist for treatment options including bisphosphonates.',
            color: 'var(--danger)'
        };
    }

    currentResult = result;
    displayResults(result);
}

function displayResults(result) {
    // Update badge
    const badge = document.getElementById('riskBadge');
    if (badge) {
        badge.className = `result-badge ${result.risk}`;
        badge.textContent = result.label;
    }

    // Update circular indicator
    const riskPercentage = document.getElementById('riskPercentage');
    if (riskPercentage) {
        riskPercentage.textContent = result.percentage + '%';
        riskPercentage.style.color = result.color;
    }

    // Rotate marker
    const marker = document.getElementById('riskMarker');
    if (marker) {
        const rotation = (result.percentage / 100) * 360;
        marker.style.transform = `rotate(${rotation}deg) translateY(-100px) rotate(-${rotation}deg)`;
        marker.style.borderColor = result.color;
    }

    // Update details
    const predictionText = document.getElementById('predictionText');
    if (predictionText) predictionText.textContent = result.prediction;
    
    const confidenceText = document.getElementById('confidenceText');
    if (confidenceText) confidenceText.textContent = result.confidence + ' Confidence';
    
    const recommendationText = document.getElementById('recommendationText');
    if (recommendationText) recommendationText.textContent = result.recommendation;

    // Set visualization image
    const previewImage = document.getElementById('previewImage');
    const vizImage = document.getElementById('vizImage');
    if (previewImage && vizImage) {
        vizImage.src = previewImage.src;
    }
}

function switchViz(type) {
    document.querySelectorAll('.viz-tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');

    const overlay = document.getElementById('heatmapOverlay');
    const image = document.getElementById('vizImage');

    if (overlay && image) {
        if (type === 'heatmap') {
            overlay.classList.add('active');
            image.style.filter = 'grayscale(100%)';
        } else if (type === 'original') {
            overlay.classList.remove('active');
            image.style.filter = 'none';
        } else {
            overlay.classList.remove('active');
            image.style.filter = 'contrast(1.1)';
        }
    }
}

function downloadReport() {
    alert('Report download feature would generate a PDF with full analysis details.');
}

// Theme management
function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeIcon();
}

function updateThemeIcon() {
    const isDark = document.documentElement.classList.contains('dark-theme');
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.textContent = isDark ? '☀️' : '🌙';
    }
}

// Profile management
let userData = {
    name: 'John Doe',
    age: '',
    gender: '',
    photo: ''
};

function handleProfilePhoto(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            userData.photo = e.target.result;
            updateProfileUI();
        };
        reader.readAsDataURL(file);
    }
}

function saveProfile(event) {
    event.preventDefault();
    userData.name = document.getElementById('profileName').value;
    userData.age = document.getElementById('profileAge').value;
    userData.gender = document.getElementById('profileGender').value;
    
    localStorage.setItem('userData', JSON.stringify(userData));
    updateProfileUI();
    alert('Profile updated successfully!');
}

function loadUserData() {
    const saved = localStorage.getItem('userData');
    if (saved) {
        userData = JSON.parse(saved);
        updateProfileUI();
    }
}

function updateProfileUI() {
    // Update Form
    const profileName = document.getElementById('profileName');
    const profileAge = document.getElementById('profileAge');
    const profileGender = document.getElementById('profileGender');
    
    if (profileName) profileName.value = userData.name || '';
    if (profileAge) profileAge.value = userData.age || '';
    if (profileGender) profileGender.value = userData.gender || '';
    
    // Update Display
    const displayUserName = document.getElementById('displayUserName');
    const dropdownUserName = document.getElementById('dropdownUserName');
    
    if (displayUserName) displayUserName.textContent = userData.name || 'Set Name';
    if (dropdownUserName) dropdownUserName.textContent = userData.name || 'Account';
    
    // Update Photos
    const preview = document.getElementById('profilePhotoPreview');
    const placeholder = document.getElementById('profilePhotoPlaceholder');
    const navPhoto = document.getElementById('navProfilePhoto');
    const navPlaceholder = document.getElementById('navProfilePlaceholder');
    
    if (userData.photo) {
        if (preview) {
            preview.src = userData.photo;
            preview.style.display = 'block';
        }
        if (placeholder) placeholder.style.display = 'none';
        
        if (navPhoto) {
            navPhoto.src = userData.photo;
            navPhoto.style.display = 'block';
        }
        if (navPlaceholder) navPlaceholder.style.display = 'none';
    } else {
        if (preview) preview.style.display = 'none';
        if (placeholder) placeholder.style.display = 'flex';
        
        if (navPhoto) navPhoto.style.display = 'none';
        if (navPlaceholder) navPlaceholder.style.display = 'block';
    }
}

// Dropdown management
const profileToggle = document.getElementById('profileToggle');
if (profileToggle) {
    profileToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const dropdown = document.getElementById('profileDropdown');
        if (dropdown) dropdown.classList.toggle('active');
    });
}

const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
}

window.addEventListener('click', () => {
    const dropdown = document.getElementById('profileDropdown');
    if (dropdown) dropdown.classList.remove('active');
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Load theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark-theme');
    }
    updateThemeIcon();

    // Load user data
    loadUserData();

    showPage('home');
});

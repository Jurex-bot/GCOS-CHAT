// Database
let users = [
    {
        id: 1,
        name: "Admin User",
        email: "admin@gcos.com",
        password: "admin123",
        role: "admin",
        avatar: "https://via.placeholder.com/150"
    },
    {
        id: 2,
        name: "John Doe",
        email: "john@gcos.com",
        password: "john123",
        role: "member",
        avatar: "https://via.placeholder.com/150"
    },
    {
        id: 3,
        name: "Jane Smith",
        email: "jane@gcos.com",
        password: "jane123",
        role: "member",
        avatar: "https://via.placeholder.com/150"
    }
];

let officers = [
    {
        id: 1,
        userId: 1,
        position: "President"
    }
];

let posts = [
    {
        id: 1,
        userId: 1,
        content: "Welcome to GCOS! We're excited to have you here.",
        image: "",
        timestamp: new Date(),
        likes: [2], // Array of user IDs who liked the post
        comments: [
            {
                id: 1,
                userId: 2,
                text: "Thanks for creating this platform!",
                timestamp: new Date()
            }
        ]
    },
    {
        id: 2,
        userId: 2,
        content: "Check out this beautiful scenery from my hike yesterday!",
        image: "https://source.unsplash.com/random/600x400/?nature",
        timestamp: new Date(Date.now() - 86400000), // Yesterday
        likes: [1, 3],
        comments: []
    }
];

let currentUser = null;
let currentPostId = null;
let postImageFile = null;

// DOM Elements
const loginWall = document.getElementById('loginWall');
const appContainer = document.getElementById('appContainer');
const wallLoginBtn = document.getElementById('wallLoginBtn');
const wallSignupBtn = document.getElementById('wallSignupBtn');
const loginModal = document.getElementById('loginModal');
const signupModal = document.getElementById('signupModal');
const commentModal = document.getElementById('commentModal');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const commentForm = document.getElementById('commentForm');
const logoutBtn = document.getElementById('logoutBtn');
const hamburger = document.querySelector('.hamburger');
const sidebar = document.querySelector('.sidebar');
const pages = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('.sidebar a');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const postBtn = document.getElementById('postBtn');
const postContent = document.getElementById('postContent');
const postsContainer = document.getElementById('postsContainer');
const photoPreview = document.getElementById('photoPreview');
const postPhotoUpload = document.getElementById('postPhotoUpload');
const membersList = document.getElementById('membersList');
const officersList = document.getElementById('officersList');
const memberSelect = document.getElementById('memberSelect');
const positionSelect = document.getElementById('positionSelect');
const customPosition = document.getElementById('customPosition');
const addOfficerBtn = document.getElementById('addOfficerBtn');
const commentsContainer = document.getElementById('commentsContainer');
const commentPostTitle = document.getElementById('commentPostTitle');
const changeAvatarBtn = document.getElementById('changeAvatarBtn');
const avatarUpload = document.getElementById('avatarUpload');

// Initialize
function init() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showApp();
    }
    setupEventListeners();
    renderMembers();
    renderOfficers();
    renderPosts();
    renderGallery();
}

// Event Listeners
function setupEventListeners() {
    // Login Wall
    wallLoginBtn.addEventListener('click', () => showModal(loginModal));
    wallSignupBtn.addEventListener('click', () => showModal(signupModal));

    // Modals
    document.querySelectorAll('.close').forEach(btn => {
        btn.addEventListener('click', closeModals);
    });
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) closeModals();
    });

    // Forms
    loginForm.addEventListener('submit', handleLogin);
    signupForm.addEventListener('submit', handleSignup);
    commentForm.addEventListener('submit', handleComment);

    // Navigation
    logoutBtn.addEventListener('click', handleLogout);
    hamburger.addEventListener('click', toggleSidebar);
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = link.getAttribute('data-page');
            showPage(pageId);
        });
    });

    // Buttons
    fullscreenBtn.addEventListener('click', toggleFullscreen);
    postBtn.addEventListener('click', createPost);
    addOfficerBtn.addEventListener('click', addOfficer);
    changeAvatarBtn.addEventListener('click', () => avatarUpload.click());

    // Photo Uploads
    postPhotoUpload.addEventListener('change', handlePostPhotoUpload);
    avatarUpload.addEventListener('change', handleAvatarUpload);

    // Dynamic Select
    positionSelect.addEventListener('change', (e) => {
        customPosition.style.display = e.target.value === 'Custom' ? 'block' : 'none';
    });
}

// User Functions
function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        showApp();
        closeModals();
        loginForm.reset();
    } else {
        alert('Invalid email or password');
    }
}

function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    
    if (users.some(u => u.email === email)) {
        alert('Email already registered');
        return;
    }
    
    const newUser = {
        id: users.length + 1,
        name,
        email,
        password,
        role: "member",
        avatar: `https://via.placeholder.com/150?text=${name.charAt(0)}`
    };
    
    users.push(newUser);
    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    showApp();
    closeModals();
    signupForm.reset();
    renderMembers();
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    hideApp();
}

function handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(event) {
        currentUser.avatar = event.target.result;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateUserUI();
    };
    reader.readAsDataURL(file);
}

// Post Functions
function handlePostPhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    postImageFile = file;
    const reader = new FileReader();
    reader.onload = function(event) {
        photoPreview.innerHTML = `<img src="${event.target.result}" alt="Preview">`;
        photoPreview.style.display = 'block';
    };
    reader.readAsDataURL(file);
}

function createPost() {
    const content = postContent.value.trim();
    if (!content && !postImageFile) {
        alert('Please enter some content or add a photo');
        return;
    }
    
    let imageUrl = '';
    if (postImageFile) {
        // In a real app, you would upload to a server
        // For demo, we'll use a data URL
        const reader = new FileReader();
        reader.onload = function(event) {
            imageUrl = event.target.result;
            finishPostCreation(content, imageUrl);
        };
        reader.readAsDataURL(postImageFile);
    } else {
        finishPostCreation(content, imageUrl);
    }
}

function finishPostCreation(content, imageUrl) {
    const newPost = {
        id: posts.length + 1,
        userId: currentUser.id,
        content,
        image: imageUrl,
        timestamp: new Date(),
        likes: [],
        comments: []
    };
    
    posts.unshift(newPost);
    postContent.value = '';
    photoPreview.style.display = 'none';
    photoPreview.innerHTML = '';
    postPhotoUpload.value = '';
    postImageFile = null;
    
    renderPosts();
    renderGallery();
}

function likePost(postId) {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    const likeIndex = post.likes.indexOf(currentUser.id);
    if (likeIndex === -1) {
        post.likes.push(currentUser.id);
    } else {
        post.likes.splice(likeIndex, 1);
    }
    
    renderPosts();
}

function showComments(postId) {
    currentPostId = postId;
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    commentPostTitle.textContent = `Comments on "${post.content.substring(0, 20)}${post.content.length > 20 ? '...' : ''}"`;
    renderComments();
    showModal(commentModal);
}

function handleComment(e) {
    e.preventDefault();
    const text = document.getElementById('commentText').value.trim();
    if (!text || !currentPostId) return;
    
    const post = posts.find(p => p.id === currentPostId);
    if (!post) return;
    
    post.comments.push({
        id: post.comments.length + 1,
        userId: currentUser.id,
        text,
        timestamp: new Date()
    });
    
    document.getElementById('commentText').value = '';
    renderComments();
    renderPosts();
}

// Officer Functions
function addOfficer() {
    const memberId = parseInt(memberSelect.value);
    let position = positionSelect.value;
    
    if (position === 'Custom') {
        position = customPosition.value.trim();
        if (!position) {
            alert('Please enter a custom position');
            return;
        }
    }
    
    if (!memberId || !position) {
        alert('Please select a member and position');
        return;
    }
    
    if (officers.some(o => o.userId === memberId)) {
        alert('This member is already an officer');
        return;
    }
    
    const user = users.find(u => u.id === memberId);
    if (!user) return;
    
    officers.push({
        id: officers.length + 1,
        userId: memberId,
        position
    });
    
    memberSelect.value = '';
    positionSelect.value = 'President';
    customPosition.style.display = 'none';
    customPosition.value = '';
    
    renderOfficers();
}

// Render Functions
function renderPosts() {
    postsContainer.innerHTML = '';
    
    // Sort posts by timestamp (newest first)
    const sortedPosts = [...posts].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    sortedPosts.forEach(post => {
        const user = users.find(u => u.id === post.userId);
        if (!user) return;
        
        const isLiked = post.likes.includes(currentUser.id);
        
        const postElement = document.createElement('div');
        postElement.className = 'post';
        postElement.innerHTML = `
            <div class="post-header">
                <img src="${user.avatar}" alt="${user.name}" class="post-avatar">
                <div>
                    <div class="post-user">${user.name}</div>
                    <div class="post-time">${formatDate(post.timestamp)}</div>
                </div>
            </div>
            <div class="post-content">
                <p>${post.content}</p>
                ${post.image ? `<img src="${post.image}" class="post-image">` : ''}
            </div>
            <div class="post-actions">
                <div class="post-action ${isLiked ? 'liked' : ''}" onclick="likePost(${post.id})">
                    <i class="fas fa-thumbs-up"></i> Like (${post.likes.length})
                </div>
                <div class="post-action" onclick="showComments(${post.id})">
                    <i class="fas fa-comment"></i> Comment (${post.comments.length})
                </div>
            </div>
        `;
        postsContainer.appendChild(postElement);
    });
}

function renderComments() {
    const post = posts.find(p => p.id === currentPostId);
    if (!post) return;
    
    commentsContainer.innerHTML = '';
    
    // Sort comments by timestamp (oldest first)
    const sortedComments = [...post.comments].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    sortedComments.forEach(comment => {
        const user = users.find(u => u.id === comment.userId);
        if (!user) return;
        
        const commentElement = document.createElement('div');
        commentElement.className = 'comment';
        commentElement.innerHTML = `
            <img src="${user.avatar}" alt="${user.name}" class="comment-avatar">
            <div class="comment-content">
                <div class="comment-user">${user.name}</div>
                <div class="comment-text">${comment.text}</div>
                <div class="comment-time">${formatTime(comment.timestamp)}</div>
            </div>
        `;
        commentsContainer.appendChild(commentElement);
    });
}

function renderGallery() {
    const galleryContainer = document.getElementById('galleryContainer');
    galleryContainer.innerHTML = '';
    
    // Get all posts with images
    const postsWithImages = posts.filter(post => post.image);
    
    if (postsWithImages.length === 0) {
        galleryContainer.innerHTML = '<p class="no-photos">No photos yet. Be the first to post one!</p>';
        return;
    }
    
    postsWithImages.forEach(post => {
        const user = users.find(u => u.id === post.userId);
        if (!user) return;
        
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        galleryItem.innerHTML = `
            <img src="${post.image}" alt="Post by ${user.name}">
            <div class="gallery-overlay">
                <span>Posted by ${user.name}</span>
            </div>
        `;
        galleryContainer.appendChild(galleryItem);
    });
}

function renderMembers() {
    membersList.innerHTML = '';
    
    // Sort members by name
    const sortedUsers = [...users].sort((a, b) => a.name.localeCompare(b.name));
    
    sortedUsers.forEach(user => {
        const isOfficer = officers.some(o => o.userId === user.id);
        const memberElement = document.createElement('div');
        memberElement.className = 'member-card';
        memberElement.innerHTML = `
            <img src="${user.avatar}" alt="${user.name}" class="member-avatar">
            <div class="member-info">
                <h4>${user.name}</h4>
                <p class="member-role">
                    ${user.role === 'admin' ? '<i class="fas fa-crown"></i> Admin' : ''}
                    ${isOfficer ? '<i class="fas fa-star"></i> Officer' : '<i class="fas fa-user"></i> Member'}
                </p>
            </div>
        `;
        membersList.appendChild(memberElement);
    });
    
    // Update member select for officers
    updateMemberSelect();
}

function renderOfficers() {
    officersList.innerHTML = '';
    
    if (officers.length === 0) {
        officersList.innerHTML = '<p class="no-officers">No officers yet.</p>';
        return;
    }
    
    // Sort officers by position
    const sortedOfficers = [...officers].sort((a, b) => a.position.localeCompare(b.position));
    
    sortedOfficers.forEach(officer => {
        const user = users.find(u => u.id === officer.userId);
        if (!user) return;
        
        const officerElement = document.createElement('div');
        officerElement.className = 'officer-card';
        officerElement.innerHTML = `
            <img src="${user.avatar}" alt="${user.name}" class="officer-avatar">
            <div class="officer-info">
                <h4>${user.name}</h4>
                <p class="officer-position">${officer.position}</p>
            </div>
            ${currentUser?.role === 'admin' ? `
            <div class="officer-actions">
                <button onclick="removeOfficer(${officer.id})"><i class="fas fa-trash"></i></button>
            </div>
            ` : ''}
        `;
        officersList.appendChild(officerElement);
    });
    
    updateMemberSelect();
}

function updateMemberSelect() {
    memberSelect.innerHTML = '<option value="">Select Member</option>';
    
    // Get non-admin, non-officer members
    const regularMembers = users.filter(user => 
        user.role !== 'admin' && !officers.some(o => o.userId === user.id)
    );
    
    regularMembers.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = user.name;
        memberSelect.appendChild(option);
    });
}

// UI Functions
function showApp() {
    loginWall.style.display = 'none';
    appContainer.style.display = 'block';
    updateUserUI();
    showPage('home'); // Show home page by default
}

function hideApp() {
    loginWall.style.display = 'flex';
    appContainer.style.display = 'none';
}

function updateUserUI() {
    if (!currentUser) return;
    
    // Update header
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userAvatar').src = currentUser.avatar;
    
    // Update sidebar
    document.getElementById('sidebarName').textContent = currentUser.name;
    document.getElementById('sidebarAvatar').src = currentUser.avatar;
    document.getElementById('sidebarRole').innerHTML = 
        currentUser.role === 'admin' ? 
        '<i class="fas fa-crown"></i> Admin' : 
        '<i class="fas fa-user"></i> Member';
    
    // Show/hide admin controls
    document.getElementById('adminOfficerControls').style.display = 
        currentUser.role === 'admin' ? 'flex' : 'none';
}

function showPage(pageId) {
    pages.forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    
    navLinks.forEach(link => link.classList.remove('active'));
    document.querySelector(`.sidebar a[data-page="${pageId}"]`).classList.add('active');
    
    // Refresh content if needed
    if (pageId === 'photos') renderGallery();
    if (pageId === 'members') renderMembers();
    if (pageId === 'officers') renderOfficers();
}

function toggleSidebar() {
    sidebar.classList.toggle('active');
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
}

function showModal(modal) {
    closeModals();
    modal.style.display = 'flex';
}

function closeModals() {
    loginModal.style.display = 'none';
    signupModal.style.display = 'none';
    commentModal.style.display = 'none';
}

// Helper Functions
function formatDate(date) {
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(date).toLocaleDateString(undefined, options);
}

function formatTime(date) {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Initialize the app
init();

// Global functions for HTML event handlers
window.likePost = likePost;
window.showComments = showComments;
window.removeOfficer = function(officerId) {
    if (currentUser?.role !== 'admin') return;
    
    if (confirm('Are you sure you want to remove this officer?')) {
        officers = officers.filter(o => o.id !== officerId);
        renderOfficers();
    }
}

// Request storage permission
function requestStoragePermission() {
  if (navigator.storage && navigator.storage.persist) {
    navigator.storage.persist().then(granted => {
      if (granted) {
        console.log("Storage permission granted");
      }
    });
  }
}

// Call this when user first logs in
requestStoragePermission();

// Save images to localStorage
function saveImageToStorage(key, file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      localStorage.setItem(key, e.target.result);
      resolve(e.target.result);
    };
    reader.readAsDataURL(file);
  });
}

// Load image from storage
function loadImageFromStorage(key) {
  return localStorage.getItem(key);
}

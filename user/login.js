let userData = JSON.parse(localStorage.getItem('userData')) || null;
let registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// Check if user is logged in on page load
window.onload = function() {
    if (currentUser) {
        displayUserPanel();
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const icon = document.querySelector('.theme-toggle i');
    icon.classList.toggle('fa-moon');
    icon.classList.toggle('fa-sun');
    
    // Save theme preference
    if (currentUser) {
        currentUser.preferences.darkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Update user in registeredUsers
        const userIndex = registeredUsers.findIndex(u => u.email === currentUser.email);
        if (userIndex !== -1) {
            registeredUsers[userIndex] = currentUser;
            localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
        }
    }
}

// Apply saved theme on page load
if (currentUser?.preferences?.darkMode) {
    document.body.classList.add('dark-mode');
    document.querySelector('.theme-toggle i').classList.replace('fa-moon', 'fa-sun');
}

// Email notification system configuration
const EmailConfig = {
    PUBLIC_KEY: 'R4skSLP0hClfAxyhZ',
    PRIVATE_KEY: 'us_dTSxTPxaebAMzDgoWH',
    TEMPLATE_ID: 'template_e67xksq',
    SERVICE_ID: 'service_a0uo1sn'
};

// Email notification system
const EmailNotificationSystem = {
    // Initialize EmailJS
    init: function() {
        emailjs.init(EmailConfig.PUBLIC_KEY);
    },

    // Send notification email
    sendNotification: async function(user, notification) {
        try {
            const templateParams = {
                to_name: user.name,
                to_email: user.email,
                message: notification.message,
                subject: notification.subject,
                website_name: 'Your Music Platform',
                from_name: 'Music Platform Team'
            };

            const response = await emailjs.send(
                EmailConfig.SERVICE_ID,
                EmailConfig.TEMPLATE_ID,
                templateParams
            );

            if (response.status === 200) {
                showNotification('Email notification sent successfully', 'success');
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to send email:', error);
            showNotification('Failed to send email notification', 'error');
            return false;
        }
    }
};

// Notification preferences system
const NotificationPreferences = {
    getDefaults: function() {
        return {
            newContent: true,
            systemUpdates: true,
            newFeatures: true,
            emailNotifications: true
        };
    },

    // Save user preferences
    savePreferences: function(preferences) {
        if (currentUser) {
            currentUser.preferences = {
                ...currentUser.preferences,
                notifications: preferences
            };
            
            // Update localStorage
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            // Update in registeredUsers
            const userIndex = registeredUsers.findIndex(u => u.email === currentUser.email);
            if (userIndex !== -1) {
                registeredUsers[userIndex] = currentUser;
                localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
            }
        }
    }
};


// Content tracking system
const ContentTracker = {
    getLastViewedContent: function() {
        return localStorage.getItem('lastViewedContent') || null;
    },

    setLastViewedContent: function(contentId) {
        localStorage.setItem('lastViewedContent', contentId);
    },

    checkForNewContent: function() {
        // This would typically check against your API or content database
        const lastViewed = this.getLastViewedContent();
        // Mock check for new content - replace with actual implementation
        return {
            hasNew: true,
            newItems: [
                { id: 'new1', type: 'song', title: 'New Release' },
                { id: 'new2', type: 'playlist', title: 'Featured Playlist' }
            ]
        };
    }
};

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notifications');
    const notificationMessage = document.getElementById('notification-message');
    const icon = notification.querySelector('i');

    // Reset any existing animations
    notification.classList.remove('animate-in', 'animate-out');
    
    // Force a reflow
    void notification.offsetWidth;

    // Set message
    notificationMessage.textContent = message;

    // Set appropriate icon and color based on type
    if (type === 'success') {
        notification.style.backgroundColor = '#1DB954';
        icon.className = 'fas fa-check-circle';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#ff4444';
        icon.className = 'fas fa-exclamation-circle';
    }

    // Show notification
    requestAnimationFrame(() => {
        notification.classList.add('animate-in');
    });

    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('animate-in');
        notification.classList.add('animate-out');
        
        setTimeout(() => {
            notification.classList.remove('animate-out');
        }, 300);
    }, 3000);
}


function closeUserPanel() {
    document.getElementById("userPanel").style.display = "none";
}


function handleAccountClick() {
    if (currentUser) {
        // User is logged in - show user panel
        displayUserPanel();
    } else {
        // No user is logged in - show login modal if there are registered users
        // otherwise show create account modal
        const hasRegisteredUsers = registeredUsers.length > 0;
        if (hasRegisteredUsers) {
            document.getElementById("loginModal").style.display = "flex";
        } else {
            document.getElementById("createAccountModal").style.display = "flex";
        }
    }
}


function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.nextElementSibling;
    
    if (input.type === "password") {
        input.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
    } else {
        input.type = "password";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
    }
}

function checkPasswordStrength(password) {
    const strengthBar = document.getElementById("strength-bar");
    let strength = 0;
    
    if (password.length >= 8) strength += 25;
    if (password.match(/[A-Z]/)) strength += 25;
    if (password.match(/[0-9]/)) strength += 25;
    if (password.match(/[^A-Za-z0-9]/)) strength += 25;
    
    strengthBar.style.width = strength + "%";
    
    if (strength <= 25) {
        strengthBar.style.backgroundColor = "#ff4444";
    } else if (strength <= 50) {
        strengthBar.style.backgroundColor = "#ffbb33";
    } else if (strength <= 75) {
        strengthBar.style.backgroundColor = "#00C851";
    } else {
        strengthBar.style.backgroundColor = "#007E33";
    }
}


// Modify the createAccount function to include email notification
function createAccount() {
    const name = document.getElementById("name").value;
    const surname = document.getElementById("surname").value;
    const age = document.getElementById("age").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const imageFile = document.getElementById("image").files[0];

    // Check if email already exists
    if (registeredUsers.some(user => user.email === email)) {
        showNotification("This email is already registered!", "error");
        return;
    }

    if (name && surname && age && email && password && imageFile) {
        const reader = new FileReader();
        reader.onload = async () => {
            const newUser = {
                name,
                surname,
                age,
                email,
                password,
                image: reader.result,
                preferences: {
                    ...NotificationPreferences.getDefaults(),
                    darkMode: false
                },
                createdAt: new Date().toISOString()
            };

            registeredUsers.push(newUser);
            localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));

            // Send welcome email
            await EmailNotificationSystem.sendNotification(newUser, {
                subject: 'Welcome to Our Music Platform',
                message: `
                    Dear ${newUser.name},
                    
                    Welcome to our Music Platform! We're excited to have you join our community.
                    
                    With your new account, you can:
                    - Create and manage playlists
                    - Discover new music
                    - Join live streaming sessions
                    - Connect with other music lovers
                    
                    Start exploring now!
                    
                    Best regards,
                    The Music Platform Team
                `
            });

            showNotification("Account created successfully! Please login.", "success");
            document.getElementById("createAccountModal").style.display = "none";
            document.getElementById("createAccountForm").reset();

            // Show login modal after successful account creation
            setTimeout(() => {
                document.getElementById("loginModal").style.display = "flex";
            }, 500);
        };
        reader.readAsDataURL(imageFile);
    } else {
        showNotification("Please fill all fields.", "error");
    }
}

// Add function to send content update notifications
async function sendContentUpdateNotification(user, newContent) {
    if (user?.preferences?.notifications?.emailNotifications) {
        await EmailNotificationSystem.sendNotification(user, {
            subject: 'New Content Available on Music Platform',
            message: `
                Hi ${user.name},
                
                We've got some new content that might interest you:
                
                ${newContent.newItems.map(item => 
                    `- New ${item.type}: ${item.title}`
                ).join('\n')}
                
                Log in to check it out!
                
                Best regards,
                The Music Platform Team
            `
        });
    }
}

// Modify the content checker to include email notifications
function checkForNewContent() {
    if (currentUser?.preferences?.notifications?.newContent) {
        const newContent = ContentTracker.checkForNewContent();
        
        if (newContent.hasNew) {
            showNotification('New content is available!');
            sendContentUpdateNotification(currentUser, newContent);
        }
    }
}

//periodic content check
function startContentCheck() {
    setInterval(() => {
        if (currentUser?.preferences?.notifications?.newContent) {
            const newContent = ContentTracker.checkForNewContent();
            
            if (newContent.hasNew) {
                showNotification('New content is available!');
                
                if (currentUser.preferences.emailNotifications) {
                    EmailNotificationSystem.sendNotification(currentUser, {
                        subject: 'New Content Available',
                        message: `Check out our latest updates: ${newContent.newItems.map(item => item.title).join(', ')}`
                    });
                }
            }
        }
    }, 3600000); // Check every hour
}

function login() {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    const user = registeredUsers.find(u => u.email === email && u.password === password);

    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        document.getElementById("loginModal").style.display = "none";
        showNotification("Welcome back, " + user.name + "!");
        displayUserPanel();
        document.getElementById("loginForm").reset();
    } else {
        showNotification("Invalid email or password.", "error");
    }
}



function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    document.getElementById("userPanel").style.display = "none";
    showNotification("Logged out successfully");
}


function displayUserPanel() {
    if (!currentUser) return;

    const userPanel = document.getElementById("userPanel");
    document.getElementById("userImage").src = currentUser.image;
    document.getElementById("userName").textContent = `${currentUser.name} ${currentUser.surname}`;
    document.getElementById("userEmail").textContent = currentUser.email;
    document.getElementById("userAge").textContent = `Age: ${currentUser.age}`;
    userPanel.style.display = "block";
}


// Close modals when clicking outside
window.onclick = function(event) {
    if (event.target.className === "modl") {
        event.target.style.display = "none";
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Get all links that should trigger modals
    const modalLinks = document.querySelectorAll('a[href^="#"]');
    
    modalLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent default anchor behavior
            
            // Hide all modals first
            const modals = document.querySelectorAll('.modl');
            modals.forEach(modal => modal.style.display = 'none');
            
            // Get the target modal ID from the href
            const modalId = this.getAttribute('href').substring(1);
            const targetModal = document.getElementById(modalId);
            
            if (targetModal) {
                targetModal.style.display = 'flex';
            }
        });
    });
    

    // Initialize email system
    EmailNotificationSystem.init();
    
    // Start periodic content checks
    setInterval(checkForNewContent, 3600000);
});


// Add function to handle notification preference updates
function updateNotificationPreferences() {
    if (currentUser) {
        const preferences = {
            newContent: document.getElementById('newContentNotif').checked,
            systemUpdates: document.getElementById('systemUpdatesNotif').checked,
            emailNotifications: document.getElementById('emailNotif').checked
        };

        NotificationPreferences.savePreferences(preferences);
        showNotification('Notification preferences updated', 'success');

        // Send test email if email notifications are enabled
        if (preferences.emailNotifications) {
            EmailNotificationSystem.sendNotification(currentUser, {
                subject: 'Notification Settings Updated',
                message: `
                    Hi ${currentUser.name},
                    
                    This email confirms that your notification preferences have been updated.
                    You will now receive email notifications about new content and updates.
                    
                    Best regards,
                    The Music Platform Team
                `
            });
        }
    }
}

//user-songs
let playLists = JSON.parse(localStorage.getItem('playUrList')) || [];

function createPlaylist() {
    const name = document.getElementById('playlistName').value;
    const genre = document.getElementById('playlistGenre').value;
    const imageInput = document.getElementById('playlistImage');

    // Debug logs
    console.log('Creating playlist...');
    console.log('Name:', name);
    console.log('Genre:', genre);
    console.log('Image Input:', imageInput.files[0]);

    if (!name || !genre || !imageInput.files[0]) {
        alert('Please fill all fields!');
        return;
    }

    const reader = new FileReader();
    reader.onload = () => {
        const newPlaylist = {
            id: Date.now(),
            name,
            genre,
            image: reader.result,
            songs: []
        };
        playlists.push(newPlaylist);

        // Debug log for playlists
        console.log('New Playlist:', newPlaylist);
        console.log('Playlists Array:', playlists);

        localStorage.setItem('playUrList', JSON.stringify(playlists));
        renderPlaylists();
    };
    reader.readAsDataURL(imageInput.files[0]);
}

function renderPlaylists() {
    const playlistsContainer = document.getElementById('playUrList');
    playlistsContainer.innerHTML = '';
    playLists.forEach(playlist => { 
        const playlistDiv = document.createElement('div');
        playlistDiv.className = 'playlist';
        playlistDiv.innerHTML = `
            <img src="${playlist.image}" alt="Playlist Image" width="50">
            <h4>${playlist.name}</h4>
            <p>${playlist.genre}</p>
            <button onclick="openPlaylist(${playlist.id})">Open</button>
            <button onclick="deletePlaylist(${playlist.id})">Delete</button>
        `;
        playlistsContainer.appendChild(playlistDiv);
    });
}


function deletePlaylist(id) {
    playLists = playLists.filter(playlist => playlist.id !== id);
    localStorage.setItem('playUrList', JSON.stringify(playLists));
    renderPlaylists();
}

function openPlaylist(id) {
    const playlist = playLists.find(p => p.id === id);
    document.getElementById('modalPlaylistName').textContent = playlist.name;
    document.getElementById('modal').style.display = 'block';
    renderSongs(playlist);
}

function renderSongs(playlist) {
    const songsList = document.getElementById('songsList');
    songsList.innerHTML = '';
    playlist.songs.forEach(song => {
        const songDiv = document.createElement('div');
        songDiv.className = 'song';
        songDiv.innerHTML = `
            <img src="${song.image}" alt="Song Image" width="50">
            <h5>${song.name}</h5>
            <audio controls src="${song.file}"></audio>
        `;
        songsList.appendChild(songDiv);
    });
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

function addSong() {
    const songFileInput = document.getElementById('songFile');
    const songName = document.getElementById('songName').value;
    const songImageInput = document.getElementById('songImage');
    const playlistName = document.getElementById('modalPlaylistName').textContent;
    const playlist = playlists.find(p => p.name === playlistName);

    if (!songFileInput.files[0] || !songName || !songImageInput.files[0]) {
        alert('Please fill all fields!');
        return;
    }

    const reader = new FileReader();
    reader.onload = () => {
        const songReader = new FileReader();
        songReader.onload = () => {
            const newSong = {
                name: songName,
                file: songReader.result,
                image: reader.result
            };
            playlist.songs.push(newSong);
            localStorage.setItem('playUrList', JSON.stringify(playlists));
            renderSongs(playlist);
        };
        songReader.readAsDataURL(songFileInput.files[0]);
    };
    reader.readAsDataURL(songImageInput.files[0]);
}

document.addEventListener('DOMContentLoaded', renderPlaylists);


//
const userPanel = document.getElementById('userPanel');
const resizer = document.getElementById('resizer');

resizer.addEventListener('mousedown', (e) => {
    e.preventDefault();

    const initialX = e.clientX;
    const initialWidth = userPanel.offsetWidth;

    function resize(e) {
        const deltaX = initialX - e.clientX; // Movement difference
        const newWidth = initialWidth + deltaX; // Adjust width based on movement

        if (newWidth >= window.innerWidth * 0.2 && newWidth <= window.innerWidth) { // Respect min/max widths
            userPanel.style.width = `${newWidth}px`;
        }
    }

    function stopResize() {
        document.removeEventListener('mousemove', resize);
        document.removeEventListener('mouseup', stopResize);
    }

    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopResize);
});

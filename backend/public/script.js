const API_URL = '';

function showRegister() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
}

function showLogin() {
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
}

async function register() {
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const username = document.getElementById('regUsername').value;

    const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username })
    });
    const data = await response.json();
    if (response.ok) {
        alert('Registration successful! Please login.');
        showLogin();
    } else {
        alert(data.message);
    }
}

async function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (response.ok) {
        localStorage.setItem('token', data.token);
        location.href = 'index.html';
    } else {
        alert(data.message);
    }
}

function logout() {
    localStorage.removeItem('token');
    location.href = 'auth.html';
}

async function loadProfile() {
    const token = localStorage.getItem('token');
    if (!token) {
        location.href = 'auth.html';
        return;
    }
    const response = await fetch(`${API_URL}/users/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const user = await response.json();
    if (!response.ok) {
        alert(user.message);
        return;
    }
    document.getElementById('profileInfo').innerHTML = `
        <h2>${user.username}</h2>
        <p>${user.email}</p>
    `;
    loadUserPosts();
}

function toggleEdit() {
    const editDiv = document.getElementById('editProfile');
    editDiv.style.display = editDiv.style.display === 'none' ? 'block' : 'none';
}

async function updateProfile() {
    const token = localStorage.getItem('token');
    const email = document.getElementById('editEmail').value;
    const username = document.getElementById('editUsername').value;

    const response = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, username })
    });
    const data = await response.json();
    if (response.ok) {
        loadProfile();
        toggleEdit();
    } else {
        alert(data.message);
    }
}

async function createPost() {
    const token = localStorage.getItem('token');
    if (!token) {
        location.href = 'auth.html';
        return;
    }
    const title = document.getElementById('postTitle').value;
    const text = document.getElementById('postText').value;
    const songUrl = document.getElementById('songUrl').value;

    const response = await fetch(`${API_URL}/blogs`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, text, songUrl })
    });
    const data = await response.json();
    if (response.ok) {
        loadUserPosts();
        document.getElementById('postTitle').value = '';
        document.getElementById('postText').value = '';
        document.getElementById('songUrl').value = '';
    } else {
        alert(data.message);
    }
}

async function loadUserPosts() {
    const token = localStorage.getItem('token');
    if (!token) {
        location.href = 'auth.html';
        return;
    }
    const response = await fetch(`${API_URL}/blogs`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const posts = await response.json();
    if (!response.ok) {
        alert(posts.message);
        return;
    }
    const postsDiv = document.getElementById('userPosts');
    postsDiv.innerHTML = posts.map(post => `
        <div class="post" id="post-${post._id}">
            <p>${post.author.username} - ${new Date(post.createdAt).toLocaleString()}</p>
            <h3>${post.title}</h3>
            <img src="${post.song.image}" width="100">
            <p>${post.song.artist} - <a href="${post.song.url}" target="_blank">${post.song.name}</a></p>
            <div class="edit-form" id="edit-form-${post._id}" style="display: none;">
                <input type="text" id="edit-title-${post._id}" value="${post.title}" placeholder="Title">
                <textarea id="edit-text-${post._id}" placeholder="Text">${post.text}</textarea>
                <button onclick="savePost('${post._id}')">Save</button>
                <button onclick="cancelEdit('${post._id}')">Cancel</button>
            </div>
            <button onclick="showEditForm('${post._id}')">Edit</button>
            <button onclick="deletePost('${post._id}')">Delete</button>
        </div>
    `).join('');
}

function showEditForm(postId) {
    document.getElementById(`edit-form-${postId}`).style.display = 'block';
}

async function savePost(postId) {
    const token = localStorage.getItem('token');
    const title = document.getElementById(`edit-title-${postId}`).value;
    const text = document.getElementById(`edit-text-${postId}`).value;

    const response = await fetch(`${API_URL}/blogs/${postId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, text })
    });
    const data = await response.json();
    if (response.ok) {
        loadUserPosts();
    } else {
        alert(data.message);
    }
}

function cancelEdit(postId) {
    document.getElementById(`edit-form-${postId}`).style.display = 'none';
}

async function deletePost(id) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/blogs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (response.ok) {
        loadUserPosts();
    } else {
        alert(data.message);
    }
}

async function loadAllPosts() {
    const response = await fetch(`${API_URL}/blogs/all`);
    const posts = await response.json();
    if (!response.ok) {
        alert(posts.message);
        return;
    }
    const postsDiv = document.getElementById('allPosts');
    postsDiv.innerHTML = posts.map(post => `
        <div class="post" onclick="location.href='post.html?id=${post._id}'">
            <p>${post.author.username} - ${new Date(post.createdAt).toLocaleString()}</p>
            <h3>${post.title}</h3>
            <img src="${post.song.image}" width="100">
            <p>${post.song.artist} - <a href="${post.song.url}" target="_blank">${post.song.name}</a></p>
        </div>
    `).join('');
}

async function loadPost() {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    const postResponse = await fetch(`${API_URL}/blogs/${postId}`);
    const post = await postResponse.json();
    if (!postResponse.ok) {
        alert(post.message);
        return;
    }
    document.getElementById('postDetails').innerHTML = `
        <p>${post.author.username} - ${new Date(post.createdAt).toLocaleString()}</p>
        <h3>${post.title}</h3>
        <img src="${post.song.image}" width="100">
        <p>${post.song.artist} - <a href="${post.song.url}" target="_blank">${post.song.name}</a></p>
        <p>${post.text}</p>
    `;

    const token = localStorage.getItem('token');
    const commentsResponse = await fetch(`${API_URL}/comments/${postId}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    const comments = await commentsResponse.json();
    if (!commentsResponse.ok) {
        alert(comments.message);
        return;
    }
    document.getElementById('commentList').innerHTML = comments.map(comment => `
        <div class="comment">
            <p>${comment.author.username} - ${new Date(comment.createdAt).toLocaleString()}</p>
            <p>${comment.text}</p>
        </div>
    `).join('');
}

async function addComment() {
    const token = localStorage.getItem('token');
    if (!token) {
        location.href = 'auth.html';
        return;
    }
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');
    const text = document.getElementById('commentText').value;

    const response = await fetch(`${API_URL}/comments`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text, postId })
    });
    const data = await response.json();
    if (response.ok) {
        loadPost();
        document.getElementById('commentText').value = '';
    } else {
        alert(data.message);
    }
}

if (window.location.pathname.includes('profile.html')) {
    loadProfile();
} else if (window.location.pathname.includes('index.html')) {
    loadAllPosts();
} else if (window.location.pathname.includes('post.html')) {
    loadPost();
}
document.addEventListener('DOMContentLoaded', () => {
    // Auth Sim
    const loginForm = document.getElementById('loginForm');
    const loginContainer = document.getElementById('loginContainer');
    const dashboardContainer = document.getElementById('dashboardContainer');
    const loginError = document.getElementById('loginError');
    
    // Check if logged in
    if (localStorage.getItem('adminAuth') === 'true') {
        showDashboard();
    }

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (username === 'admin' && password === 'admin123') {
            localStorage.setItem('adminAuth', 'true');
            showDashboard();
        } else {
            loginError.style.display = 'block';
        }
    });

    // Poster Preview logic
    const posterInput = document.getElementById('posterInput');
    const posterPreview = document.getElementById('posterPreview');
    posterInput.addEventListener('change', function() {
        if(this.files && this.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                posterPreview.src = e.target.result;
                posterPreview.style.display = 'block';
            }
            reader.readAsDataURL(this.files[0]);
        }
    });

    // Form submission (Add/Edit)
    const eventForm = document.getElementById('eventForm');
    const addMessage = document.getElementById('addMessage');

    eventForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(eventForm);
        const editId = document.getElementById('editEventId').value;
        
        const method = editId ? 'PUT' : 'POST';
        const url = editId ? `${API_BASE_URL}/events/${editId}` : `${API_BASE_URL}/events`;

        try {
            const response = await fetch(url, {
                method: method,
                // Do NOT set Content-Type header when sending FormData! Browser sets it with boundary.
                body: formData
            });

            if (response.ok) {
                showMessage(editId ? 'Event updated successfully!' : 'Event created successfully!', 'success');
                resetEventForm();
                loadEvents(); // Reload table
            } else {
                showMessage('Failed to save event.', 'error');
            }
        } catch (error) {
            console.error('Error saving event:', error);
            showMessage('Server error.', 'error');
        }
    });

    function showMessage(msg, type) {
        addMessage.style.display = 'block';
        addMessage.textContent = msg;
        if(type === 'success') {
            addMessage.style.backgroundColor = 'rgba(52, 211, 153, 0.2)';
            addMessage.style.color = '#065f46';
        } else {
            addMessage.style.backgroundColor = 'rgba(248, 113, 113, 0.2)';
            addMessage.style.color = '#991b1b';
        }
        setTimeout(() => addMessage.style.display = 'none', 3000);
    }
});

function showDashboard() {
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('dashboardContainer').style.display = 'block';
    loadEvents();
    loadRegistrations();
}

function logout() {
    localStorage.removeItem('adminAuth');
    location.reload();
}

function switchTab(tabId, el) {
    document.querySelectorAll('.admin-section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.admin-nav button').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active');
    el.classList.add('active');
    
    if(tabId === 'manageEvents') loadEvents();
    if(tabId === 'registrations') loadRegistrations();
}

async function loadEvents() {
    const tbody = document.getElementById('adminEventsTable');
    try {
        const response = await fetch(`${API_BASE_URL}/events`);
        const events = await response.json();
        
        if (events.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No events found.</td></tr>';
            return;
        }

        tbody.innerHTML = events.map(event => {
            const posterUrl = event.poster_image ? `http://localhost:5000${event.poster_image}` : 'https://placehold.co/100x100/eeeeee/999999?text=N/A';
            return `
            <tr>
                <td><img src="${posterUrl}" alt="poster" style="width: 50px; height: 50px; object-fit: cover; border-radius: 0.25rem;"></td>
                <td>${formatDate(event.event_date)}</td>
                <td><strong>${event.event_name}</strong></td>
                <td>${event.venue}</td>
                <td>
                    <button class="btn btn-outline" style="padding: 0.25rem 0.5rem; font-size: 0.875rem; border-color: var(--primary-color); color: var(--primary-color);" onclick='editEvent(${JSON.stringify(event)})'>Edit</button>
                    <button class="btn btn-primary" style="padding: 0.25rem 0.5rem; font-size: 0.875rem; background: #ef4444;" onclick="deleteEvent(${event.id})">Delete</button>
                </td>
            </tr>
        `}).join('');
    } catch (error) {
        console.error('Error:', error);
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:red;">Failed to load events.</td></tr>';
    }
}

function editEvent(event) {
    // Switch to form tab
    const addTabBtn = document.querySelector('.admin-nav button:nth-child(2)');
    switchTab('addEvent', addTabBtn);

    document.getElementById('formTitle').textContent = 'Editing Event: ' + event.event_name;
    document.getElementById('editEventId').value = event.id;
    document.getElementById('event_name').value = event.event_name;
    
    // Convert DATETIME to datetime-local format string
    const d = new Date(event.event_date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    document.getElementById('event_date').value = d.toISOString().slice(0,16);

    document.getElementById('venue').value = event.venue;
    document.getElementById('time').value = event.time;
    document.getElementById('organizer').value = event.organizer;
    document.getElementById('description').value = event.description;

    const preview = document.getElementById('posterPreview');
    if(event.poster_image) {
        preview.src = `http://localhost:5000${event.poster_image}`;
        preview.style.display = 'block';
    } else {
        preview.style.display = 'none';
        preview.src = '';
    }
}

function resetEventForm() {
    document.getElementById('eventForm').reset();
    document.getElementById('editEventId').value = '';
    document.getElementById('formTitle').textContent = 'Create New Event';
    document.getElementById('posterPreview').style.display = 'none';
    document.getElementById('posterPreview').src = '';
}

async function loadRegistrations() {
    const tbody = document.getElementById('registrationsTable');
    try {
        const response = await fetch(`${API_BASE_URL}/registrations`);
        const registrations = await response.json();
        
        if (registrations.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No registrations found.</td></tr>';
            return;
        }

        tbody.innerHTML = registrations.map(reg => `
            <tr>
                <td><strong>#${reg.id}</strong></td>
                <td>
                    <div style="font-weight:600;">${reg.name}</div>
                    <div style="font-size:0.875rem; color:#6b7280;">${reg.department} (${reg.year})</div>
                </td>
                <td>
                    <div>${reg.email}</div>
                    <div style="font-size:0.875rem; color:#6b7280;">${reg.phone || 'N/A'}</div>
                </td>
                <td>${reg.event_name}</td>
                <td>
                    <button class="btn btn-outline" style="padding: 0.25rem 0.5rem; font-size: 0.875rem; border-color: #ef4444; color: #ef4444;" onclick="deleteRegistration(${reg.id})">Delete Reg</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error:', error);
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:red;">Failed to load registrations.</td></tr>';
    }
}

async function deleteEvent(id) {
    if(!confirm('Are you sure you want to delete this event? This will also delete all registrations associated with it.')) return;
    try {
        const response = await fetch(`${API_BASE_URL}/events/${id}`, { method: 'DELETE' });
        if(response.ok) loadEvents();
        else alert('Failed to delete event');
    } catch (error) { console.error('Error:', error); alert('Server error'); }
}

async function deleteRegistration(id) {
    if(!confirm('Delete this user registration?')) return;
    try {
        const response = await fetch(`${API_BASE_URL}/registrations/${id}`, { method: 'DELETE' });
        if(response.ok) loadRegistrations();
        else alert('Failed to delete registration');
    } catch (error) { console.error('Error:', error); alert('Server error'); }
}

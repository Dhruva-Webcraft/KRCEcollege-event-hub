document.addEventListener('DOMContentLoaded', async () => {
    let allEvents = [];
    
    const eventsGrid = document.getElementById('eventsGrid');
    const eventsTableBody = document.getElementById('eventsTableBody');
    const searchName = document.getElementById('searchName');
    const searchOrganizer = document.getElementById('searchOrganizer');
    const searchDate = document.getElementById('searchDate');
    const globalSearch = document.getElementById('globalSearch');

    const btnGridView = document.getElementById('btnGridView');
    const btnTableView = document.getElementById('btnTableView');
    const eventsTableContainer = document.getElementById('eventsTableContainer');

    btnGridView.addEventListener('click', () => {
        btnGridView.classList.add('active');
        btnTableView.classList.remove('active');
        eventsGrid.classList.add('active');
        eventsTableContainer.classList.remove('active');
    });

    btnTableView.addEventListener('click', () => {
        btnTableView.classList.add('active');
        btnGridView.classList.remove('active');
        eventsTableContainer.classList.add('active');
        eventsGrid.classList.remove('active');
    });

    async function loadEvents() {
        try {
            const response = await fetch(`${API_BASE_URL}/events`);
            allEvents = await response.json();
            renderEvents(allEvents);
        } catch (error) {
            console.error('Error fetching events:', error);
            eventsGrid.innerHTML = '<p style="color:red;">Failed to load events.</p>';
        }
    }

    function renderEvents(eventsToRender) {
        if (eventsToRender.length === 0) {
            eventsGrid.innerHTML = '<p>No events found.</p>';
            eventsTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No events found.</td></tr>';
            return;
        }

        // Render Grid
        eventsGrid.innerHTML = eventsToRender.map(e => {
            const posterUrl = e.poster_image ? `http://localhost:5000${e.poster_image}` : 'https://placehold.co/600x400/eeeeee/999999?text=No+Poster';
            return `
                <div class="glass-card event-card">
                    <img src="${posterUrl}" alt="Event poster" class="event-poster">
                    <div class="event-content">
                        <h3 style="margin-bottom: 0.5rem; font-size: 1.25rem;">${e.event_name}</h3>
                        <p style="color: var(--primary-color); font-size: 0.875rem; font-weight: 500;">
                            <ion-icon name="calendar-outline" style="vertical-align: middle"></ion-icon> ${formatDate(e.event_date)}
                        </p>
                        <p style="color: #6b7280; font-size: 0.875rem; margin-top: 0.5rem;">Organizer: ${e.organizer}</p>
                        <div class="countdown" data-date="${e.event_date}">Loading timer...</div>
                        <a href="event-details.html?id=${e.id}" class="btn btn-outline" style="margin-top: 1rem; width:100%;">View Details</a>
                    </div>
                </div>
            `;
        }).join('');

        // Render Table
        eventsTableBody.innerHTML = eventsToRender.map(e => {
            const posterUrl = e.poster_image ? `http://localhost:5000${e.poster_image}` : 'https://placehold.co/100x100/eeeeee/999999?text=N/A';
            return `
                <tr>
                    <td><img src="${posterUrl}" alt="poster" style="width: 50px; height: 50px; object-fit: cover; border-radius: 0.25rem;"></td>
                    <td><strong>${e.event_name}</strong></td>
                    <td>${formatDate(e.event_date)}</td>
                    <td>${e.organizer}</td>
                    <td><div class="countdown" style="padding: 0; background:transparent;" data-date="${e.event_date}">-</div></td>
                    <td>
                        <a href="event-details.html?id=${e.id}" class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.875rem;">Details</a>
                    </td>
                </tr>
            `;
        }).join('');

        updateCountdowns();
    }

    function filterEvents() {
        const nameTerm = searchName.value.toLowerCase();
        const orgTerm = searchOrganizer.value.toLowerCase();
        const dateTerm = searchDate.value; // YYYY-MM-DD
        const globalTerm = globalSearch ? globalSearch.value.toLowerCase() : '';

        const filtered = allEvents.filter(e => {
            const matchName = e.event_name.toLowerCase().includes(nameTerm) || e.event_name.toLowerCase().includes(globalTerm);
            const matchOrg = e.organizer.toLowerCase().includes(orgTerm);
            
            let matchDate = true;
            if (dateTerm) {
                const eDate = new Date(e.event_date).toISOString().split('T')[0];
                matchDate = eDate === dateTerm;
            }

            return matchName && matchOrg && matchDate;
        });

        renderEvents(filtered);
    }

    // Attach listeners
    searchName.addEventListener('input', filterEvents);
    searchOrganizer.addEventListener('input', filterEvents);
    searchDate.addEventListener('change', filterEvents);
    if(globalSearch) globalSearch.addEventListener('input', filterEvents);

    loadEvents();
});

document.addEventListener('DOMContentLoaded', async () => {
    const featuredEventsContainer = document.getElementById('featuredEvents');

    try {
        const response = await fetch(`${API_BASE_URL}/events`);
        const events = await response.json();

        // Show only first 3 for featured
        const featured = events.slice(0, 3);

        if (featured.length === 0) {
            featuredEventsContainer.innerHTML = '<p style="text-align: center; width: 100%;">No events found.</p>';
            return;
        }

        featuredEventsContainer.innerHTML = featured.map(event => `
            <div class="event-card">
                <div class="event-date">${formatDate(event.event_date)}</div>
                <h3 class="event-title">${event.event_name}</h3>
                <p class="event-desc">${event.description.substring(0, 100)}...</p>
                <a href="event-details.html?id=${event.id}" class="btn btn-primary">View Details</a>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error fetching events:', error);
        featuredEventsContainer.innerHTML = '<p style="text-align: center; color: red; width: 100%;">Failed to load events. Ensure backend is running.</p>';
    }
});

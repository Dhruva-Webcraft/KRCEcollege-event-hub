document.addEventListener('DOMContentLoaded', async () => {
    const eventDetailsContainer = document.getElementById('eventDetails');
    
    // Get ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');

    if (!eventId) {
        eventDetailsContainer.innerHTML = '<p style="text-align: center; color: red;">No event specified. Go back to <a href="events.html">Events</a>.</p>';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/events/${eventId}`);
        
        if (!response.ok) {
            throw new Error('Event not found');
        }

        const event = await response.json();

        eventDetailsContainer.innerHTML = `
            <div class="event-date">${formatDate(event.event_date)}</div>
            <h2 class="event-title" style="font-size: 2.5rem; margin-bottom: 1rem;">${event.event_name}</h2>
            
            <div class="event-details-info">
                <p><strong>Venue:</strong> ${event.venue}</p>
                <p><strong>Time:</strong> ${event.time}</p>
                <p><strong>Organizer:</strong> ${event.organizer}</p>
            </div>
            
            <div style="margin-top: 2rem;">
                <h3 style="margin-bottom: 1rem;">About this Event</h3>
                <p style="color: #4b5563; line-height: 1.6;">${event.description}</p>
            </div>

            <div style="margin-top: 3rem; text-align: center;">
                <a href="register.html?event_id=${event.id}" class="btn btn-primary" style="padding: 1rem 3rem; font-size: 1.25rem;">Register for Event</a>
            </div>
        `;
    } catch (error) {
        console.error('Error fetching event details:', error);
        eventDetailsContainer.innerHTML = '<p style="text-align: center; color: red;">Failed to load event details. It may have been deleted.</p>';
    }
});

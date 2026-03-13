document.addEventListener('DOMContentLoaded', async () => {
    const eventSelect = document.getElementById('event_id');
    const registrationForm = document.getElementById('registrationForm');
    const messageBox = document.getElementById('messageBox');
    const qrCodeContainer = document.getElementById('qrCodeContainer');
    const qrCodeCanvas = document.getElementById('qrCodeCanvas');
    
    // Check url params
    const urlParams = new URLSearchParams(window.location.search);
    const preselectedEventId = urlParams.get('event_id');

    // Load Events into Select dropdown
    try {
        const response = await fetch(`${API_BASE_URL}/events`);
        const events = await response.json();

        eventSelect.innerHTML = '<option value="">-- Select an Event --</option>';
        events.forEach(event => {
            const option = document.createElement('option');
            option.value = event.id;
            option.textContent = `${event.event_name} (${formatDate(event.event_date)})`;
            if (preselectedEventId && parseInt(preselectedEventId) === event.id) {
                option.selected = true;
            }
            eventSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching events:', error);
        eventSelect.innerHTML = '<option value="">Error loading events</option>';
    }

    // Submit handler
    registrationForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(registrationForm);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                const result = await response.json();
                
                // Show QR Code
                const qrData = JSON.stringify({
                    registrationId: result.registrationId,
                    eventId: data.event_id,
                    name: data.name
                });
                
                QRCode.toCanvas(qrCodeCanvas, qrData, { width: 200, color: { dark: '#1f2937', light: '#ffffff' } }, function (error) {
                    if (error) console.error('QR Generate Error:', error);
                });

                registrationForm.style.display = 'none';
                qrCodeContainer.style.display = 'block';
                showMessage('Registration Successful! Email reminder sent.', 'success');
                
            } else {
                showMessage('Registration failed. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            showMessage('An error occurred. Check backend connection.', 'error');
        }
    });

    function showMessage(msg, type) {
        messageBox.style.display = 'block';
        messageBox.textContent = msg;
        if (type === 'success') {
            messageBox.style.backgroundColor = 'rgba(52, 211, 153, 0.2)';
            messageBox.style.color = '#065f46';
            messageBox.style.border = '1px solid #34d399';
        } else {
            messageBox.style.backgroundColor = 'rgba(248, 113, 113, 0.2)';
            messageBox.style.color = '#991b1b';
            messageBox.style.border = '1px solid #f87171';
        }
    }
});

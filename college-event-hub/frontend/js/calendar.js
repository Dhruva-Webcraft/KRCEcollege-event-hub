document.addEventListener('DOMContentLoaded', async () => {
    const calendarGrid = document.getElementById('calendarGrid');
    const monthYearDisplay = document.getElementById('monthYearDisplay');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');

    let currentDate = new Date();
    let eventsData = [];

    // Fetch Events
    async function fetchEvents() {
        try {
            const response = await fetch(`${API_BASE_URL}/events`);
            eventsData = await response.json();
            renderCalendar();
        } catch (error) {
            console.error('Error fetching calendar events:', error);
            calendarGrid.innerHTML = '<div style="grid-column: 1 / -1; padding: 2rem; text-align: center; color: red;">Failed to load events for calendar.</div>';
        }
    }

    function renderCalendar() {
        calendarGrid.innerHTML = '';
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        // Display Header
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        monthYearDisplay.textContent = `${monthNames[month]} ${year}`;

        // Get first day of month (0 = Sun, 6 = Sat)
        const firstDayIndex = new Date(year, month, 1).getDay();
        
        // Get number of days in the month
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Get previous month days for prepending empty/faded slots
        const prevMonthDays = new Date(year, month, 0).getDate();

        // Today's date check
        const today = new Date();
        const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;

        // Populate empty slots before first day
        for (let i = firstDayIndex; i > 0; i--) {
            const emptyCell = document.createElement('div');
            emptyCell.classList.add('calendar-cell', 'empty');
            // Optional: Show faded previous month dates
            const dateNum = prevMonthDays - i + 1;
            emptyCell.innerHTML = `<span class="date-num" style="opacity:0.3">${dateNum}</span>`;
            calendarGrid.appendChild(emptyCell);
        }

        // Populate days
        for (let day = 1; day <= daysInMonth; day++) {
            const cellDateString = new Date(year, month, day).toISOString().split('T')[0];
            const cell = document.createElement('div');
            cell.classList.add('calendar-cell');
            
            if (isCurrentMonth && day === today.getDate()) {
                cell.classList.add('today');
            }

            // Cell header (the day number)
            const dayNum = document.createElement('span');
            dayNum.classList.add('date-num');
            dayNum.textContent = day;
            cell.appendChild(dayNum);

            // Filter events for this specific day
            const dayEvents = eventsData.filter(e => {
                const eDate = new Date(e.event_date).toISOString().split('T')[0];
                return eDate === cellDateString;
            });

            // Append events into cell
            dayEvents.forEach(e => {
                const pill = document.createElement('div');
                pill.classList.add('cal-event-pill');
                pill.textContent = e.event_name;
                pill.title = e.event_name + ' at ' + e.time;
                pill.onclick = () => window.location.href = `event-details.html?id=${e.id}`;
                cell.appendChild(pill);
            });

            calendarGrid.appendChild(cell);
        }

        // Fill remaining grid spaces (optional but good for UI stability)
        const totalCellsRendered = firstDayIndex + daysInMonth;
        const totalGridCellsNeeded = Math.ceil(totalCellsRendered / 7) * 7;
        const rem = totalGridCellsNeeded - totalCellsRendered;
        
        for (let i = 1; i <= rem; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.classList.add('calendar-cell', 'empty');
            emptyCell.innerHTML = `<span class="date-num" style="opacity:0.3">${i}</span>`;
            calendarGrid.appendChild(emptyCell);
        }
    }

    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    fetchEvents();
});

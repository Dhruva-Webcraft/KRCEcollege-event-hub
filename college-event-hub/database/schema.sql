CREATE DATABASE IF NOT EXISTS college_events;
USE college_events;

CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_name VARCHAR(255) NOT NULL,
    event_date DATETIME NOT NULL,
    description TEXT,
    venue VARCHAR(255),
    time VARCHAR(50),
    organizer VARCHAR(255),
    poster_image VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    department VARCHAR(100),
    year VARCHAR(50),
    phone VARCHAR(20),
    event_id INT,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Dummy data (we use future dates so countdown works, plus optional poster column)
INSERT IGNORE INTO events (id, event_name, event_date, description, venue, time, organizer, poster_image) VALUES
(1, 'Tech Symposium 2026', '2026-05-15 09:00:00', 'Annual tech symposium featuring coding competitions, hackathons, and guest lectures.', 'Main Auditorium', '09:00 AM', 'Computer Science Dept', NULL),
(2, 'Cultural Fest', '2026-06-20 17:00:00', 'A grand celebration of arts, music, and dance from various cultures.', 'Open Air Theatre', '05:00 PM', 'Student Council', NULL),
(3, 'AI & Machine Learning Workshop', '2026-04-10 10:00:00', 'Hands-on workshop covering basics to advanced topics in AI and ML.', 'Lab 101', '10:00 AM', 'AI Club', NULL);

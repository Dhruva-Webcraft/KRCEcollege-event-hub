const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('./db');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Setup uploads folder logic
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}
app.use('/uploads', express.static(uploadDir));

// Setup Multer for Event Posters
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Setup Nodemailer Ethereal Account for testing
let transporter;
nodemailer.createTestAccount().then(account => {
    transporter = nodemailer.createTransport({
        host: account.smtp.host,
        port: account.smtp.port,
        secure: account.smtp.secure,
        auth: {
            user: account.user,
            pass: account.pass
        }
    });
    console.log('Nodemailer test account created:', account.user);
}).catch(err => {
    console.error('Failed to create Ethereal account, email sending will just be simulated.', err);
});

// GET /api/events
app.get('/api/events', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM events ORDER BY event_date ASC');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});

// GET /api/events/:id
app.get('/api/events/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM events WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Event not found' });
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch event details' });
    }
});

// POST /api/events
app.post('/api/events', upload.single('poster'), async (req, res) => {
    const { event_name, event_date, description, venue, time, organizer } = req.body;
    let poster_image = req.file ? `/uploads/${req.file.filename}` : null;
    try {
        const [result] = await pool.query(
            'INSERT INTO events (event_name, event_date, description, venue, time, organizer, poster_image) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [event_name, event_date, description, venue, time, organizer, poster_image]
        );
        res.json({ id: result.insertId, message: 'Event added successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to add event' });
    }
});

// PUT /api/events/:id
app.put('/api/events/:id', upload.single('poster'), async (req, res) => {
    const { event_name, event_date, description, venue, time, organizer } = req.body;
    let poster_image = req.file ? `/uploads/${req.file.filename}` : undefined;
    
    try {
        let query = 'UPDATE events SET event_name=?, event_date=?, description=?, venue=?, time=?, organizer=?';
        let params = [event_name, event_date, description, venue, time, organizer];
        
        if (poster_image !== undefined) {
            query += ', poster_image=?';
            params.push(poster_image);
        }
        
        query += ' WHERE id=?';
        params.push(req.params.id);

        await pool.query(query, params);
        res.json({ message: 'Event updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update event' });
    }
});

// DELETE /api/events/:id
app.delete('/api/events/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM events WHERE id = ?', [req.params.id]);
        res.json({ message: 'Event deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete event' });
    }
});

// POST /api/register
app.post('/api/register', async (req, res) => {
    const { name, email, department, year, phone, event_id } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO registrations (name, email, department, year, phone, event_id) VALUES (?, ?, ?, ?, ?, ?)',
            [name, email, department, year, phone, event_id]
        );
        const registrationId = result.insertId;

        // Fetch event details to send email
        const [eventRows] = await pool.query('SELECT * FROM events WHERE id = ?', [event_id]);
        if (eventRows.length > 0 && transporter) {
            const ev = eventRows[0];
            const mailOptions = {
                from: '"College Event Hub" <noreply@collegeevents.com>',
                to: email,
                subject: `Registration Confirmation: ${ev.event_name}`,
                text: `Hello ${name},\n\nYou have successfully registered for ${ev.event_name}.\nDate: ${new Date(ev.event_date).toLocaleDateString()} at ${ev.time}\nVenue: ${ev.venue}\n\nYour Registration ID is ${registrationId}.\nThank you!`,
            };
            transporter.sendMail(mailOptions).then(info => {
                console.log('Registration email sent. Preview URL:', nodemailer.getTestMessageUrl(info));
            }).catch(console.error);
        }

        res.json({ message: 'Registration successful!', registrationId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to register' });
    }
});

// GET /api/registrations
app.get('/api/registrations', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT r.*, e.event_name 
            FROM registrations r 
            JOIN events e ON r.event_id = e.id 
            ORDER BY r.id DESC
        `);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch registrations' });
    }
});

// DELETE /api/registrations/:id
app.delete('/api/registrations/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM registrations WHERE id = ?', [req.params.id]);
        res.json({ message: 'Registration deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete registration' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

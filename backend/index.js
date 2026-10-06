const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Add a root route so it shows in the browser
app.get('/', (req, res) => {
    res.send('<h1>Vehicle Tracking API is Running! 🚀</h1><p>Endpoints: /api/tracks, /api/suggestions/names</p>');
});

// Initialize SQLite database
const db = new sqlite3.Database(path.join(__dirname, 'tracking.db'), (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        db.run(`CREATE TABLE IF NOT EXISTS tracks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            mobile_no TEXT,
            invoice TEXT,
            driver_pass TEXT,
            consignment_place TEXT,
            vehicle_source TEXT,
            vehicle_no TEXT,
            supplier_driver_name TEXT,
            items_in_container TEXT
        )`);
    }
});

// Create a new track
app.post('/api/tracks', (req, res) => {
    const {
        mobile_no,
        invoice,
        driver_pass,
        consignment_place,
        vehicle_source,
        vehicle_no,
        supplier_driver_name,
        items_in_container
    } = req.body;

    const sql = `INSERT INTO tracks (
        mobile_no, invoice, driver_pass, consignment_place, vehicle_source, vehicle_no, supplier_driver_name, items_in_container
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    db.run(sql, [mobile_no, invoice, driver_pass, consignment_place, vehicle_source, vehicle_no, supplier_driver_name, items_in_container], function(err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.status(201).json({
            "id": this.lastID,
            "message": "Track added successfully!"
        });
    });
});

// Get all tracks
app.get('/api/tracks', (req, res) => {
    const sql = "SELECT * FROM tracks ORDER BY id DESC";
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "data": rows
        });
    });
});

// Get unique names for autosuggest
app.get('/api/suggestions/names', (req, res) => {
    const sql = "SELECT DISTINCT supplier_driver_name FROM tracks WHERE supplier_driver_name IS NOT NULL AND supplier_driver_name != ''";
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        const names = rows.map(row => row.supplier_driver_name);
        res.json({
            "data": names
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

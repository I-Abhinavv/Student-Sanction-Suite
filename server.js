const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'studentsList',
  password: '*******',
  port: 5432,
});

app.post('/api/add-student', async (req, res) => {
  const { studentName, registrationNo, batch, blackDots, fine, hostelDebarred, messDebarred, punishmentReason } = req.body;

  try {
    const client = await pool.connect();
    const queryText = 'INSERT INTO students (student_name, registration_no, batch, black_dots, fine, hostel_debarred, mess_debarred, punishment_reason) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)';
    const values = [studentName, registrationNo, batch, blackDots, fine, hostelDebarred, messDebarred, punishmentReason];
    await client.query(queryText, values);
    client.release();
    res.json({ message: 'Student added successfully' });
  } catch (error) {
    console.error('Error adding student:', error);
    res.status(500).json({ error: 'Failed to add student' });
  }
});

app.get('/api/student-records', async (req, res) => {
  try {
    const client = await pool.connect();
    const queryText = 'SELECT student_name, registration_no, batch, black_dots, fine, hostel_debarred, mess_debarred, punishment_reason FROM students';
    const result = await client.query(queryText);
    client.release();
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching student records:', error);
    res.status(500).json({ error: 'Failed to fetch student records' });
  }
});

app.delete('/api/remove-student/:registrationNo', async (req, res) => {
  const registrationNo = req.params.registrationNo;

  try {
    const client = await pool.connect();
    const queryText = 'DELETE FROM students WHERE registration_no = $1';
    const values = [registrationNo];
    await client.query(queryText, values);
    client.release();
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ error: 'Failed to delete student' });
  }
});

app.post('/api/disciplinary-check', async (req, res) => {
  const { name, registrationNo, batch } = req.body;

  try {
    const client = await pool.connect();
    const queryText = 'SELECT black_dots, fine, hostel_debarred, mess_debarred, punishment_reason FROM students WHERE student_name = $1 AND registration_no = $2 AND batch = $3';
    const values = [name, registrationNo, batch];
    const result = await client.query(queryText, values);
    client.release();

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'No disciplinary records found for the student' });
    } else {
      const disciplinaryData = result.rows[0];
      res.json(disciplinaryData);
    }
  } catch (error) {
    console.error('Error fetching disciplinary record:', error);
    res.status(500).json({ error: 'Failed to fetch disciplinary record' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

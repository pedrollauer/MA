import express from 'express';

// Initialize the express app
const app = express();
const port = 3000;

// Middleware to parse JSON bodies (good practice, though not strictly needed for these GET routes)
app.use(express.json());

// --- Define Endpoints ---

// 1. /reg endpoint
app.get('/reg', (req, res) => {
  console.log('Received request for /reg');
  res.status(200).json({ message: 'This is the /reg endpoint.' });
});

// 2. /consu endpoint
app.get('/consu', (req, res) => {
  console.log('Received request for /consu');
  res.status(200).json({ message: 'Welcome to the /consu endpoint.' });
});

// 3. /new endpoint
app.get('/new', (req, res) => {
  console.log('Received request for /new');
  res.status(200).json({ message: 'You have reached the /new endpoint.' });
});

// --- Start the Server ---
app.listen(port, () => {
  console.log(`Server running successfully on http://localhost:${port}`);
});

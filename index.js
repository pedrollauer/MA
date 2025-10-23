import express from 'express';

// Initialize the express app
const app = express();
const port = 3000;

// Middleware to parse JSON bodies (good practice, though not strictly needed for these GET routes)
app.use(express.json());

function generateRandomCode(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let resultCode = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    resultCode += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return resultCode;
}
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

app.get('/new', (req, res) => {
  console.log('Received request for /new');
  
  // Generate the 5-character random part
  const randomPart = generateRandomCode(5);
  // Combine with the prefix
  const finalCode = `FISIO-${randomPart}`;

  res.status(200).json({ 
    message: 'Código:',
    code: finalCode 
  });
});

// --- Start the Server ---
app.listen(port, () => {
  console.log(`Server running successfully on http://localhost:${port}`);
});

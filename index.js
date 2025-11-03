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

app.get('/new', async (req, res) => {
  console.log('Received request for /new');
  
  const randomPart = generateRandomCode(5);
  const finalCode = `FISIO-${randomPart}`;

  try {
    const sql = 'INSERT INTO codigos (codigo) VALUES ($1) RETURNING *';
    const values = [finalCode];
    
    // Executa a query
    const result = await pool.query(sql, values);

    res.status(201).json({
      message: 'Código criado e salvo com sucesso:',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Erro ao salvar no banco de dados:', error);
    res.status(500).json({
      error: 'Erro interno do servidor ao salvar o código.',
      details: error.message
    });
  }
});

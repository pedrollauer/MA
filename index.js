// PASSO 1: Carrega o .env (mudou a sintaxe)
require('dotenv').config();

// PASSO 2: Converte todos os imports para require
const express = require('express');
const { Pool } = require('pg');
const Jimp = require('jimp'); // Esta é a importação correta para CommonJS!
const path = require('path');

// --- Configurações Iniciais ---
const app = express();
const port = process.env.PORT || 3000;

// PASSO 3: __dirname funciona "magic_amente" em CommonJS
// Você não precisa mais do 'fileURLToPath'
// const __filename = fileURLToPath(import.meta.url); <-- DELETADO
// const __dirname = path.dirname(__filename); <-- DELETADO

// --- Variáveis de Posição da Imagem ---
const TEXT_POS_X = 970;
const TEXT_POS_Y = 593;

// --- Configuração do Banco de Dados ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// --- Array de Links Falsos para /pix ---
const dummyLinks = [
  "https://link.fake/pix/pagamento_01",
  "https://link.fake/pix/pagamento_02",
  "https://link.fake/pix/pagamento_03",
  "https://link.fake/pix/pagamento_04",
  "https://link.fake/pix/pagamento_05"
];

app.use(express.json());

// --- Funções ---
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

app.get('/reg', (req, res) => {
  console.log('Received request for /reg');
  
  res.send(`
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Registrar Código</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; display: grid; place-items: center; min-height: 90vh; background-color: #f8f9fa; color: #333; }
        form { background: #ffffff; border: 1px solid #dee2e6; padding: 30px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        h2 { margin-top: 0; }
        input { font-size: 1.1rem; padding: 10px; margin-right: 10px; border: 1px solid #ced4da; border-radius: 4px; width: 200px; }
        button { font-size: 1.1rem; padding: 10px 18px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; transition: background-color 0.2s; }
        button:hover { background-color: #0056b3; }
      </style>
    </head>
    <body>
      <form action="/usar-codigo" method="GET">
        <h2>Registrar Uso do Código</h2>
        <label for="codigo-input">Código:</label>
        <input type="text" id="codigo-input" name="codigo" placeholder="FISIO-XXXXX" required>
        <button type="submit">Usar Código</button>
      </form>
    </body>
    </html>
  `);
});

// NOVO ENDPOINT: /usar-codigo (para processar o formulário do /reg)
app.get('/usar-codigo', async (req, res) => {
  console.log('Received request for /usar-codigo');
  
  const { codigo } = req.query;

  if (!codigo) {
    return res.status(400).send('<h1>Erro:</h1><p>Nenhum código foi fornecido.</p><a href="/reg">Tentar novamente</a>');
  }

  try {
    const upperCaseCodigo = codigo.toUpperCase();
    const sql = 'UPDATE codigos SET used = 1 WHERE codigo = $1 AND used = 0 RETURNING *';
    const values = [upperCaseCodigo];

    const result = await pool.query(sql, values);

    if (result.rowCount > 0) {
      res.send(`<h1>Sucesso!</h1><p>O código "${upperCaseCodigo}" foi marcado como usado.</p><a href="/reg">Registrar outro</a>`);
    } else {
      res.status(404).send(`<h1>Erro</h1><p>Código "${upperCaseCodigo}" não encontrado ou já foi utilizado.</p><a href="/reg">Tentar novamente</a>`);
    }

  } catch (error) {
    console.error('Erro ao atualizar o código:', error);
    res.status(500).send('<h1>Erro Interno</h1><p>Ocorreu um problema no servidor.</p>');
  }
});


// 2. /consu
app.get('/consu', async (req, res) => {
  const { codigo } = req.query;
  if (!codigo) {
    return res.status(400).json({ error: 'O parâmetro "codigo" é obrigatório.' });
  }
  try {
    const sql = 'SELECT used FROM codigos WHERE codigo = $1';
    const result = await pool.query(sql, [codigo]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Código não encontrado.' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// 3. /new
app.get('/new', async (req, res) => {
  const randomPart = generateRandomCode(5);
  const finalCode = `FISIO-${randomPart}`;
  try {
    const sql = 'INSERT INTO codigos (codigo) VALUES ($1) RETURNING *';
    const result = await pool.query(sql, [finalCode]);
    res.status(201).json({
      message: 'Código criado e salvo com sucesso:',
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// 4. /pix
app.get('/pix', (req, res) => {
  const { n } = req.query;
  if (n === undefined) {
    return res.status(400).json({ error: 'O parâmetro "n" é obrigatório.' });
  }
  const index = parseInt(n, 10);
  if (isNaN(index) || index < 0 || index >= dummyLinks.length) {
    return res.status(404).json({ error: 'Índice fora do intervalo.' });
  }
  res.status(200).json({ n: index, link: dummyLinks[index] });
});

// 5. /novo (SEM MUDANÇAS NO CÓDIGO INTERNO, SÓ A IMPORTAÇÃO)
app.get('/novo', async (req, res) => {
  console.log('Received request for /novo');

  try {
    // 1. Gerar e Salvar no DB
    const randomPart = generateRandomCode(5);
    const finalCode = `FISIO-${randomPart}`;
    const sql = 'INSERT INTO codigos (codigo) VALUES ($1) RETURNING *';
    await pool.query(sql, [finalCode]);

    // 2. Processar Imagem
    // __dirname agora funciona automaticamente
    const imagePath = path.join(__dirname, 'img.jpg'); 
    
    // O Jimp.read funciona como esperado (sem .default)
    const image = await Jimp.read(imagePath); 
    const font = await Jimp.loadFont(Jimp.FONT_SANS_64_BLACK);

    image.print(
      font,
      TEXT_POS_X,
      TEXT_POS_Y,
      finalCode
    );

    const imageBuffer = await image.getBufferAsync(Jimp.MIME_JPEG);

    // 3. Retornar Imagem
    res.setHeader('Content-Type', 'image/jpeg');
    res.send(imageBuffer);

  } catch (error) {
    console.error('Erro no endpoint /novo:', error);
    if (error.code === 'ENOENT') {
      return res.status(500).json({ error: 'Erro: img.jpeg não foi encontrada.' });
    }
    res.status(500).json({
      error: 'Erro interno do servidor.',
      details: error.message
    });
  }
});

// --- Start the Server ---
app.listen(port, () => {
  console.log(`Servidor rodando com sucesso na http://localhost:${port}`);
});

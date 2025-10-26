// TODOS OS IMPORTS FICAM AQUI NO TOPO
import express from 'express';
import cors, { CorsOptions } from 'cors';
import { connectDB } from './Config/db.js';

// IMPORTE SEU ARQUIVO DE ROTAS AQUI
// import userRoutes from './Routes/UserRoutes.js';

// Chame a conexão com o banco
connectDB();

// Configure o app (Middleware)
const app = express();

// Configuração tipada de CORS
const corsOptions: CorsOptions = {
  origin: process.env.FRONTEND_URL || 'https://ignisapp.com',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Defina suas rotas
app.get('/', (req, res) => {
  res.send('API do IgnisApp está rodando!');
});

// "MONTE" SUAS ROTAS AQUI
// app.use('/api/users', userRoutes);

// Inicie o servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
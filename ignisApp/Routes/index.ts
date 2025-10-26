// TODOS OS IMPORTS FICAM AQUI NO TOPO
import express from 'express';
import cors, { CorsOptions } from 'cors';
import { connectDB } from '../Config/db.js';
import { router } from './routes.js';
import { errorMiddleware } from '../Middleware/errorMiddleware.js';
import UserRoutes from './UserRoutes.js';
import OccurrenceRoutes from './OccurrenceRoutes.js';

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

// Defina rota raiz
app.get('/', (req, res) => {
  res.send('API do IgnisApp está rodando!');
});

// Montando as rotas
app.use('/api', router);
app.use('/api/users', UserRoutes);
app.use('/api/occurrence', OccurrenceRoutes);

// Middleware de erro
app.use(errorMiddleware);

// Inicie o servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
// TODOS OS IMPORTS FICAM AQUI NO TOPO
import express from 'express';
import cors from 'cors';
import { connectDB } from '../Config/db.js'; 
import { router } from './routes.js';
import { errorMiddleware } from '../Middleware/errorMiddleware.js'
import UserRoutes from './UserRoutes.js'; 
import OccurrenceRoutes from './OccurrenceRoutes.js';


// Chame a conexão com o banco
connectDB();

// Configure o app (Middleware)
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', router);

// Defina suas rotas
app.get('/', (req, res) => {
  res.send('API do IgnisApp está rodando!');
});


// Montando as rotas
app.use('/api/users', UserRoutes);
app.use('/api/Occurrence', OccurrenceRoutes);


// Middleware de erro
app.use(errorMiddleware);


// Inicie o servidor
app.listen(5000, () => {
  console.log('Servidor rodando na porta 5000');
});
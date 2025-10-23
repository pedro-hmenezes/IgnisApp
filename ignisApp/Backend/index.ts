// TODOS OS IMPORTS FICAM AQUI NO TOPO
import express from 'express';
import cors from 'cors';
import { connectDB } from './Config/db.js'; 

// IMPORTE SEU ARQUIVO DE ROTAS AQUI
//import userRoutes from './Routes/UserRoutes.js'; 

// Chame a conexão com o banco
connectDB();

// Configure o app (Middleware)
const app = express();
app.use(cors());
app.use(express.json());

// Defina suas rotas
app.get('/', (req, res) => {
  res.send('API do IgnisApp está rodando!');
});

// "MONTE" SUAS ROTAS AQUI
//app.use('/api/users', userRoutes);

// Inicie o servidor
app.listen(5000, () => {
  console.log('Servidor rodando na porta 5000');
});
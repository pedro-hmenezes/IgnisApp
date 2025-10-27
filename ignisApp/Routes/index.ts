// index.ts (Back-end - Ex: na raiz do projeto ou dentro de src/)

// TODOS OS IMPORTS FICAM AQUI NO TOPO
import express from 'express';
import cors, { CorsOptions } from 'cors';
import { connectDB } from '../Config/db.js'; // Ajuste o caminho se necessário
import { router } from './routes.js'; // Parece não ser usado se UserRoutes e OccurrenceRoutes são definidos separadamente
import { errorMiddleware } from '../Middleware/errorMiddleware.js'; // Ajuste o caminho se necessário
import UserRoutes from './UserRoutes.js'; // Ajuste o caminho se necessário (ex: './routes/UserRoutes.js')
import OccurrenceRoutes from './OccurrenceRoutes.js'; // Ajuste o caminho se necessário (ex: './routes/OccurrenceRoutes.js')

// Chame a conexão com o banco
connectDB();

// Configure o app (Middleware)
const app = express();

// --- Configuração CORS CORRIGIDA ---
const allowedOrigins = [
  process.env.FRONTEND_URL || 'https://ignis-app-front-lv8y.vercel.app', // URL da Vercel
  // Adicione outras origens permitidas se necessário (ex: localhost para testes locais)
  // 'http://localhost:5173' 
];

const corsOptions: CorsOptions = {
  origin: function (origin, callback) {
    // Permite requisições sem 'origin' (ex: Postman) ou se a origem estiver na lista
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Mantido, importante se usar cookies/sessions
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // <<< ADICIONADO PATCH e OPTIONS
  allowedHeaders: ['Content-Type', 'Authorization'] // Mantido
};

// Aplica o middleware CORS ANTES das rotas
app.use(cors(corsOptions));

// Habilita o Express a lidar com requisições OPTIONS automaticamente com as opções definidas
app.options('*', cors(corsOptions)); 
// --- Fim da Configuração CORS ---


// Outros Middlewares Essenciais
app.use(express.json()); // Para parsear body JSON

// Defina rota raiz (opcional)
app.get('/', (req, res) => {
 res.send('API do IgnisApp está rodando!');
});

// Montando as rotas da API (DEPOIS do CORS e express.json)
// app.use('/api', router); // Remover se 'router' não for mais usado
app.use('/api/users', UserRoutes);
app.use('/api/occurrences', OccurrenceRoutes); // <<< CORRIGIDO: Usei '/occurrences' (plural) para consistência com o front

// Middleware de erro (DEPOIS das rotas)
app.use(errorMiddleware);

// Inicie o servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
 console.log(`Servidor rodando na porta ${PORT}`);
});

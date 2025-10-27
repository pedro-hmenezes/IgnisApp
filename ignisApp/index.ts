// index.ts (Back-end - Raiz do Projeto)

// TODOS OS IMPORTS FICAM AQUI NO TOPO
import express from 'express';
import cors, { CorsOptions } from 'cors';
import { connectDB } from './Config/db.js'; // Ajuste o caminho se necessário
// 1. IMPORTE AS ROTAS E MIDDLEWARES (Ajuste os caminhos!)
import { errorMiddleware } from './Middleware/errorMiddleware.js'; 
import UserRoutes from './Routes/UserRoutes.js'; 
import OccurrenceRoutes from './Routes/OccurrenceRoutes.js'; 
// Se você tiver um arquivo './Routes/routes.js' que exporta outros roteadores, importe-o também
// import { router as otherApiRoutes } from './Routes/routes.js'; 

// Chame a conexão com o banco
connectDB();

// Configure o app (Middleware)
const app = express();

// --- Configuração CORS CORRIGIDA ---
const allowedOrigins = [
  // <<< IMPORTANTE: Coloque a URL EXATA do seu front-end Vercel aqui >>>
  process.env.FRONTEND_URL || 'https://ignis-app-front-lv8y.vercel.app', 
  // Adicione localhost se precisar testar localmente
  // 'http://localhost:5173' 
];

const corsOptions: CorsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.error(`CORS Error: Origin '${origin}' not allowed.`); // Log do erro CORS
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, 
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // <<< MÉTODOS COMPLETOS
  allowedHeaders: ['Content-Type', 'Authorization'] 
};

// Aplica o middleware CORS ANTES das rotas
app.use(cors(corsOptions));

// Habilita o Express a lidar com requisições OPTIONS automaticamente
app.options('*', cors(corsOptions)); 
// --- Fim da Configuração CORS ---

// Outros Middlewares Essenciais
app.use(express.json()); // Para parsear body JSON

// Rota raiz (opcional)
app.get('/', (req, res) => {
 res.send('API do IgnisApp está rodando!');
});

// === MONTANDO AS ROTAS DA API ===
// Monta outras rotas que possam existir em './Routes/routes.js' no prefixo /api
// if (otherApiRoutes) {
//    app.use('/api', otherApiRoutes); 
// }
// Monta as rotas de usuário no prefixo /api/users
app.use('/api/users', UserRoutes); 
// Monta as rotas de ocorrência no prefixo /api/occurrences
app.use('/api/occurrences', OccurrenceRoutes); // <<< ROTA CORRIGIDA (PLURAL)
// =============================

// Middleware de erro (DEVE SER O ÚLTIMO app.use)
app.use(errorMiddleware);

// Inicie o servidor
const PORT = process.env.PORT || 5000; // Render usa process.env.PORT
app.listen(PORT, () => {
 console.log(`Servidor rodando na porta ${PORT}`);
});

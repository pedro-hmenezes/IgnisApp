// index.ts (Back-end - Raiz do Projeto)

// TODOS OS IMPORTS FICAM AQUI NO TOPO
import express, { Request, Response } from 'express';
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

// --- Configuração CORS ROBUSTA ---
// Dica: ajuste FRONTEND_URL, FRONTEND_URLS (separadas por vírgula) nas variáveis de ambiente do Render
const explicitOrigins = [
  process.env.FRONTEND_URL, // uma única URL
  ...(process.env.FRONTEND_URLS?.split(',').map((s: string) => s.trim()).filter(Boolean) ?? []),
  'https://ignis-app-front-lv8y.vercel.app',
  'https://iqnisapp.com',
  'https://ignisapp.com',
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean) as string[];

function isAllowedOrigin(origin?: string | null): boolean {
  if (!origin) return true; // permite chamadas sem origin (ex: Postman)
  try {
    const url = new URL(origin);
    const host = url.host; // ex: my-app.vercel.app
    // Libera domínios explícitos
    if (explicitOrigins.includes(origin)) return true;
    // Libera qualquer subdomínio do Vercel
    if (host.endsWith('.vercel.app')) return true;
    // Libera localhost em portas comuns
    if (url.hostname === 'localhost') return true;
  } catch {
    // se o origin não for uma URL válida, bloqueia
  }
  return false;
}

const corsOptions: CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      console.error(`CORS Error: Origin '${origin}' not allowed.`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // OK mesmo sem cookies; mantém compatibilidade
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
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
app.get('/', (_req: Request, res: Response) => {
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

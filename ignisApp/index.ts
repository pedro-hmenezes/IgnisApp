import express, { Request, Response } from 'express';
import cors, { CorsOptions } from 'cors';
import { connectDB } from './Config/db.js'; 


import { errorMiddleware } from './Middleware/errorMiddleware.js'; 
import UserRoutes from './Routes/UserRoutes.js'; 
import OccurrenceRoutes from './Routes/OccurrenceRoutes.js'; 
import { router } from './Routes/routes.js'; 


// Chame a conexão com o banco
connectDB();

// Configure o app (Middleware)
const app = express();

// --- Configuração CORS ROBUSTA ---
const explicitOrigins = [
  process.env.FRONTEND_URL, 
  ...(process.env.FRONTEND_URLS?.split(',').map((s: string) => s.trim()).filter(Boolean) ?? []),
  'https://ignis-app-front-lv8y.vercel.app',
  'https://iqnisapp.com',
  'https://ignisapp.com',
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean) as string[];

function isAllowedOrigin(origin?: string | null): boolean {
  if (!origin) return true; 
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
  credentials: true, 
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// --- Fim da Configuração CORS ---

// Outros Middlewares Essenciais
app.use(express.json()); // Para parsear body JSON

// Rota raiz (opcional)
app.get('/', (_req: Request, res: Response) => {
 res.send('API do IgnisApp está rodando!');
});

// === MONTANDO AS ROTAS DA API ===
// Monta outras rotas que possam existir em './Routes/routes.js' no prefixo /api
if (router) {
   app.use('/api', router); 
 }
// Monta as rotas de usuário no prefixo /api/users
app.use('/api/users', UserRoutes); 
// Monta as rotas de ocorrência no prefixo /api/occurrences
app.use('/api/occurrences', OccurrenceRoutes); 
// =============================

// Middleware de erro 
app.use(errorMiddleware);

// Inicie o servidor
const PORT = process.env.PORT || 5000; 
app.listen(PORT, () => {
 console.log(`Servidor rodando na porta ${PORT}`);
});

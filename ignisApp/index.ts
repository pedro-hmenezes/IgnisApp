import express, { Request, Response } from 'express';
import cors, { CorsOptions } from 'cors';
import { connectDB } from './Config/db.js';
import { errorMiddleware } from './Middleware/errorMiddleware.js';
import UserRoutes from './Routes/UserRoutes.js';
import OccurrenceRoutes from './Routes/OccurrenceRoutes.js';
import MediaRoutes from './Routes/MediaRoutes.js';
import SignatureRoutes from './Routes/SignatureRoutes.js';
import OccurrenceFinalizationRoutes from './Routes/OccurrenceFinalizationRoutes.js';
import CloudinaryMediaRoutes from './Routes/CloudinaryMediaRoutes.js';
import { router } from './Routes/routes.js';

// Chame a conexão com o banco
connectDB();

// Configure o app (Middleware)
const app = express();

// --- Configuração CORS ---
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

// Habilita o Express a lidar com requisições OPTIONS automaticamente com as opções definidas
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    cors(corsOptions)(req, res, next);
  } else {
    next();
  }
});

// --- Fim da Configuração CORS ---

// Outros Middlewares Essenciais
app.use(express.json()); // Para parsear body JSON

// Rota raiz (opcional)
app.get('/', (_req: Request, res: Response) => {
  res.send('API do IgnisApp está rodando!');
});

// === MONTANDO AS ROTAS DA API ===
if (router) {
  app.use('/api', router);
}
app.use('/api/users', UserRoutes);
app.use('/api/occurrences', OccurrenceRoutes);
app.use('/api/occurrences', OccurrenceFinalizationRoutes); // Rotas de finalização
app.use('/api/media', MediaRoutes);
app.use('/api/media/cloudinary', CloudinaryMediaRoutes); // Rotas Cloudinary
app.use('/api/signatures', SignatureRoutes);

// Middleware de erro 
app.use(errorMiddleware);

// Inicie o servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

import { z } from 'zod';

export const userSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  passwordHash: z.string().min(8),
  role: z.enum(['operador', 'major', 'administrador'])
});

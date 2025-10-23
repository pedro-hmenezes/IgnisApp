// services/logService.ts

import { LogModel } from '../Models/Log';

/**
 * Registra uma ação no sistema com detalhes e, opcionalmente, o usuário responsável.
 * 
 * @param action - A ação realizada (ex: 'Criação de relatório', 'Login', etc.)
 * @param details - Detalhes adicionais sobre a ação
 * @param user - (Opcional) ID ou nome do usuário que realizou a ação
 */
export const registerLog = async (action: string, details: string, user?: string) => {
  try {
    const log = new LogModel({ action, details, user });
    await log.save();

    console.log(`[LOG - ${log.dateTime.toISOString()}] Ação: ${action}. Detalhes: ${details}`);
  } catch (error) {
    console.error('Erro ao registrar log:', error);
  }
};

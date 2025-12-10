import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Occurrence from '../Models/Occurrence.js';

// Carregar variáveis de ambiente
dotenv.config();

/**
 * Script para corrigir status das ocorrências
 * Normaliza todos os status para minúsculas
 */
async function fixOccurrenceStatus() {
    try {
        // Conectar ao banco de dados
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error('MONGODB_URI não definida no .env');
        }

        await mongoose.connect(mongoUri);
        console.log('Conectado ao MongoDB');

        // Buscar todas as ocorrências
        const occurrences = await Occurrence.find({});
        console.log(`Total de ocorrências encontradas: ${occurrences.length}`);

        let updated = 0;
        let errors = 0;

        for (const occ of occurrences) {
            try {
                const originalStatus = occ.statusGeral;
                const normalizedStatus = originalStatus.toLowerCase().trim();

                if (originalStatus !== normalizedStatus) {
                    console.log(`Corrigindo ocorrência ${occ.numAviso}:`);
                    console.log(`   De: "${originalStatus}" -> Para: "${normalizedStatus}"`);

                    // Validar que o status normalizado é válido
                    if (!['em andamento', 'finalizada', 'cancelada'].includes(normalizedStatus)) {
                        console.error(`Status inválido: "${normalizedStatus}"`);
                        errors++;
                        continue;
                    }

                    // Atualizar diretamente no banco
                    await Occurrence.updateOne(
                        { _id: occ._id },
                        { $set: { statusGeral: normalizedStatus } }
                    );
                    
                    updated++;
                    console.log('Atualizado');
                }
            } catch (err) {
                console.error(`Erro ao processar ocorrência ${occ._id}:`, err);
                errors++;
            }
        }

        console.log('\n Resumo:');
        console.log(`   Total: ${occurrences.length}`);
        console.log(`   Atualizados: ${updated}`);
        console.log(`   Erros: ${errors}`);
        console.log(`   Sem alterações: ${occurrences.length - updated - errors}`);

        // Verificar resultado
        const emAndamento = await Occurrence.countDocuments({ statusGeral: 'em andamento' });
        const finalizadas = await Occurrence.countDocuments({ statusGeral: 'finalizada' });
        const canceladas = await Occurrence.countDocuments({ statusGeral: 'cancelada' });

        console.log('\n Status após correção:');
        console.log(`   Em andamento: ${emAndamento}`);
        console.log(`   Finalizadas: ${finalizadas}`);
        console.log(`   Canceladas: ${canceladas}`);

        await mongoose.disconnect();
        console.log('\nScript finalizado com sucesso!');
    } catch (error) {
        console.error('Erro ao executar script:', error);
        process.exit(1);
    }
}

// Executar script
fixOccurrenceStatus();

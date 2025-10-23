
import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';

export class ReportService {
  static async export(id: number, format: string, user: any, occurrences: any[]): Promise<string> {
    const generatedAt = new Date();
    const filename = `report_${id}.${format.toLowerCase()}`;
    const filePath = path.join(__dirname, '../../exports', filename);

    switch (format) {
      case 'PDF': {
        const doc = new PDFDocument();
        doc.pipe(fs.createWriteStream(filePath));
        doc.fontSize(14).text(`Relatório de Ocorrências - ${generatedAt.toLocaleString()}`);
        doc.text(`Usuário: ${user.name}`);
        doc.text(`Total de Ocorrências: ${occurrences.length}`);
        doc.moveDown();
        occurrences.forEach(occ => {
          doc.text(` - Ocorrência ID: ${occ.id}, Tipo: ${occ.type}, Status: ${occ.status}`);
        });
        doc.end();
        break;
      }
      case 'CSV': {
        const csvContent = [
          ['ID', 'Tipo', 'Status'],
          ...occurrences.map(occ => [occ.id, occ.type, occ.status])
        ].map(row => row.join(',')).join('\n');
        fs.writeFileSync(filePath, csvContent);
        break;
      }
      case 'JSON': {
        const jsonData = {
          id,
          generatedAt,
          user,
          occurrences
        };
        fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));
        break;
      }
      default:
        throw new Error('Formato não suportado');
    }

    return filePath;
  }
}

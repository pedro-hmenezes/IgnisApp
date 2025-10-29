import type { IOccurrence } from '../Interfaces/OccurrenceInterfaces.js';
import type { IUser } from './User';
import type { Document } from 'mongoose';
 
type OccurrenceDoc = IOccurrence & Document;
 
export class Report {
  private id: number;
  private generatedAt: Date;
  private format: string;
  private user: IUser;
  private occurrences: OccurrenceDoc[];
 
  constructor(
    id: number,
    format: string,
    user: IUser,
    occurrences: OccurrenceDoc[],
    generatedAt: Date = new Date()
  ) {
    this.id = id;
    this.format = format;
    this.user = user;
    this.occurrences = occurrences;
    this.generatedAt = generatedAt;
  }
 
  public generate(): string {
    console.log(`Gerando relatório ID: ${this.id} para o usuário ${this.user.name}.`);
 
    let content = `Relatório de Ocorrências - Gerado em: ${this.generatedAt.toLocaleString()}\n`;
    content += `Formato: ${this.format}\n`;
    content += `Usuário: ${this.user.name}\n`;
    content += `Total de Ocorrências: ${this.occurrences.length}\n\n`;
 
    this.occurrences.forEach((occ) => {
      content += ` - Ocorrência ID: ${occ._id}, Tipo: ${occ.tipoOcorrencia}, Status: ${occ.statusGeral}\n`;
    });
 
    return content;
  }
 
  public export(): void {
    const reportContent = this.generate();
    console.log(`Exportando o relatório ID: ${this.id} no formato ${this.format}...`);
    // Lógica de exportação real pode ser implementada aqui
  }
 
  public getId(): number {
    return this.id;
  }
 
  public getGeneratedAt(): Date {
    return this.generatedAt;
  }
}
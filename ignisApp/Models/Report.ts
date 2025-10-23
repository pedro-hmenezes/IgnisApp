import { Occurrence } from './Occurrence';
import type { IUser } from './User';

export class Report {
  // Atributos
  private id: number;
  private generatedAt: Date;
  private format: string; // Ex: 'PDF', 'CSV', 'JSON'

  // Relações
  private user: IUser; // O usuário que solicitou o relatório (consulta)
  private occurrences: Occurrence[]; // As ocorrências que o relatório irá agregar

  constructor(
    id: number,
    format: string,
    user: IUser,
    occurrences: Occurrence[],
    generatedAt: Date = new Date()
  ) {
    this.id = id;
    this.format = format;
    this.user = user;
    this.occurrences = occurrences;
    this.generatedAt = generatedAt;
  }

  // Métodos
  public generate(): string {
    console.log(`Gerando relatório ID: ${this.id} para o usuário ${this.user.name}.`);

    let content = `Relatório de Ocorrências - Gerado em: ${this.generatedAt.toLocaleString()}\n`;
    content += `Formato: ${this.format}\n`;
    content += `Usuário: ${this.user.name}\n`;
    content += `Total de Ocorrências: ${this.occurrences.length}\n\n`;

    // Simulação de geração de conteúdo
    this.occurrences.forEach(occ => {
      content += ` - Ocorrência ID: ${occ.getId()}, Tipo: ${occ.getType()}, Status: ${occ.getStatus()}\n`;
    });

    return content;
  }

  public export(): void {
    const reportContent = this.generate();
    console.log(`Exportando o relatório ID: ${this.id} no formato ${this.format}...`);
    // Aqui você pode implementar a lógica real de exportação
  }

  // Getters
  public getId(): number {
    return this.id;
  }

  public getGeneratedAt(): Date {
    return this.generatedAt;
  }
}
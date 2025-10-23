export class Signature {
    // Atributos
    private id: number;
    private signerName: string;
    private signatureImage: string; // Usando string para representar o caminho do arquivo ou base64
    private signedAt: Date;

    constructor(id: number, signerName: string, signatureImage: string, signedAt: Date = new Date()) {
        this.id = id;
        this.signerName = signerName;
        this.signatureImage = signatureImage;
        this.signedAt = signedAt;
    }

    // Métodos
    public collect(): void {
        console.log(`Coletando assinatura de: ${this.signerName} em ${this.signedAt.toISOString()}.`);
        // Lógica para capturar e armazenar a imagem da assinatura.
    }
    
    // Getters
    public getId(): number {
        return this.id;
    }

    public getSignerName(): string {
        return this.signerName;
    }
    
    public getSignatureImage(): string {
        return this.signatureImage;
    }
}
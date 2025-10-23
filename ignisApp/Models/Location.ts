export class Location {
    // Atributos
    private latitude: number;
    private longitude: number;
    private accuracy: number;
    private capturedAt: Date;

    constructor(latitude: number, longitude: number, accuracy: number, capturedAt: Date = new Date()) {
        this.latitude = latitude;
        this.longitude = longitude;
        this.accuracy = accuracy;
        this.capturedAt = capturedAt;
    }

    // Métodos
    public getCoordinates(): { latitude: number, longitude: number } {
        // Retorna um objeto com as coordenadas
        return {
            latitude: this.latitude,
            longitude: this.longitude
        };
    }

    // Getters para os demais atributos
    public getAccuracy(): number {
        return this.accuracy;
    }

    public getCapturedAt(): Date {
        return this.capturedAt;
    }
}
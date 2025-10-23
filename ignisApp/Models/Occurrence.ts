import { Location } from './Location';
import type { IMedia } from './Media';
import { Signature } from './Signature';

export class Occurrence {
    // Atributos
    private id: number;
    private dateTime: Date;
    private type: string;
    private description: string;
    private status: string;

    // Relações
    private media: IMedia[] = [];
    private signatures: Signature[] = [];
    private location?: Location;

    constructor(id: number, type: string, description: string, status: string, dateTime: Date = new Date()) {
        this.id = id;
        this.dateTime = dateTime;
        this.type = type;
        this.description = description;
        this.status = status;
    }

    public addMedia(m: IMedia): void {
        this.media.push(m);
    }

    // ... restante do código
}
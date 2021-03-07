export default class HTTPException extends Error {

    readonly statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);

        this.statusCode = statusCode;
    }

    public log(): void {
        console.log(`ERROR ${this.statusCode} - ${this.message}`);
    }
}
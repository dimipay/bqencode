export abstract class Base {
	public abstract encode(input: string | Buffer): string;
	public abstract decode(str: string): Buffer;
}

export class InvalidEncodingError extends Error {
	constructor() {
		super("Invalid encoding");
	}
}

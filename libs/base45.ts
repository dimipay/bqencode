import { Base, InvalidEncodingError } from "./base";

class Base45 extends Base {
	private readonly charset = new Charset(
		"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:",
	);

	/**
	 * encodes a string or buffer to base45
	 * @param input {string | Buffer}
	 */
	public encode(input: string | Buffer): string {
		if (input.length === 0) {
			return "";
		}

		let result = "";
		const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);

		for (let i = 0; i < buf.length; i += 2) {
			if (i + 1 < buf.length) {
				let val = buf.readUint16BE(i);
				for (let j = 0; j < 3; j++) {
					result += this.charset.charAt(val % 45);
					val = Math.floor(val / 45);
				}
			} else {
				let val = buf.readUint8(i);
				for (let j = 0; j < 2; j++) {
					result += this.charset.charAt(val % 45);
					val = Math.floor(val / 45);
				}
			}
		}
		return result;
	}

	/**
	 * decode a base45 string to a buffer
	 * @param str {string}
	 */
	public decode(str: string): Buffer {
		if (!this.isBase45(str)) {
			throw new InvalidEncodingError();
		}

		if (str.length === 0) {
			return Buffer.alloc(0);
		}

		const input = Array.from(str).map((c) => this.charset.indexOf(c) as number);
		const result: number[] = [];

		for (let i = 0; i < str.length; i += 3) {
			if (i + 2 < str.length) {
				const val = input[i] + input[i + 1] * 45 + input[i + 2] * 45 ** 2;
				result.push(val >> 8, val & 0xff);
			} else {
				const val = input[i] + input[i + 1] * 45;
				result.push(val);
			}
		}
		return Buffer.from(result);
	}

	public isBase45(str: string): boolean {
		const r = str.length % 3;
		return (
			new RegExp(`^[${this.charset.charset}]*$`).test(str) &&
			(r === 0 || r === 2)
		);
	}
}

class Charset {
	private readonly charsetObj: Record<string, number>;

	constructor(public readonly charset: string) {
		this.charsetObj = Object.fromEntries(
			Array.from(charset).map((c, i) => [c, i]),
		);
	}

	public charAt(index: number): string {
		return this.charset[index];
	}

	public indexOf(char: string): number | undefined {
		return this.charsetObj[char];
	}

	public parse(str: string): number[] {
		return Array.from(str).map((c) => this.indexOf(c) as number);
	}
}

export const base45 = new Base45();

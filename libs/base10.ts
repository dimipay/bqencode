import { Base, InvalidEncodingError } from "./base";
import { readBigInt56BE, writeBigInt56BE } from "./utils";

class Base10 extends Base {
	private readonly byteLength = [3, 5, 8, 10, 13, 15];

	/**
	 * encodes a string or buffer to base94
	 * @param input {string | Buffer}
	 * @return {string}
	 */
	public encode(input: string | Buffer): string {
		let result = "";
		const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);
		for (let i = 0; i < buf.length; i += 7) {
			if (i + 6 < buf.length) {
				const val = readBigInt56BE(buf, i);
				result += String(val).padStart(17, "0");
			} else {
				const size = buf.length - i;
				const length = this.byteLength[size - 1];
				const val = buf.readUintBE(i, size);
				result += String(val).padStart(length, "0");
			}
		}
		return result;
	}

	/**
	 * decode a base94 string to a buffer
	 * @param str {string}
	 * @return {Buffer}
	 */
	public decode(str: string): Buffer {
		if (str.length === 0) {
			return Buffer.alloc(0);
		}

		if (!this.isBase10(str)) {
			throw new InvalidEncodingError();
		}

		const chunk = str.match(/\d{1,17}/g) as string[];
		const lastSize =
			str.length % 17 ? this.byteLength.indexOf(str.length % 17) + 1 : 7;
		const result = Buffer.alloc(chunk.length * 7 - (7 - lastSize));

		for (let i = 0; i < chunk.length; i++) {
			if (chunk[i].length === 17) {
				writeBigInt56BE(BigInt(chunk[i]), result, i * 7);
			} else {
				result.writeUintBE(Number(chunk[i]), i * 7, lastSize);
			}
		}
		return result;
	}

	/**
	 * @param str {string}
	 * @returns {boolean}
	 */
	public isBase10(str: string): boolean {
		const r = str.length % 17;
		return /^\d*$/.test(str) && (r === 0 || this.byteLength.includes(r));
	}
}

export const base10 = new Base10();

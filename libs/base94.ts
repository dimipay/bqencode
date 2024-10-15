import { Base, InvalidEncodingError } from "./base";

class Base94 extends Base {
	private readonly byteLength = [2, 3, 4];

	/**
	 * @param input {string | Buffer}
	 * @returns {string}
	 */
	public encode(input: string | Buffer): string {
		if (input.length === 0) {
			return "";
		}

		let result = "";
		const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);

		for (let i = 0; i < buf.length; i += 4) {
			if (i + 3 < buf.length) {
				let val = buf.readUint32BE(i);
				for (let j = 0; j < 5; j++) {
					result += String.fromCharCode((val % 94) + 33);
					val = Math.floor(val / 94);
				}
			} else {
				const size = buf.length - i;
				const length = this.byteLength[size - 1];
				let val = buf.readUintBE(i, size);
				for (let j = 0; j < length; j++) {
					result += String.fromCharCode((val % 94) + 33);
					val = Math.floor(val / 94);
				}
			}
		}
		return result;
	}

	/**
	 * @param str {string}
	 * @returns {Buffer}
	 */
	public decode(str: string): Buffer {
		if (str.length === 0) {
			return Buffer.alloc(0);
		}

		if (!this.isBase94(str)) {
			throw new InvalidEncodingError();
		}

		const chunk = str.match(/.{1,5}/g) as string[];
		const lastSize =
			str.length % 5 ? this.byteLength.indexOf(str.length % 5) + 1 : 4;
		const result = Buffer.alloc(chunk.length * 4 - (4 - lastSize));

		for (let i = 0; i < chunk.length; i++) {
			const buf = Buffer.from(
				Array.from(chunk[i]).map((c) => c.charCodeAt(0) - 33),
			);
			if (chunk[i].length === 5) {
				const val =
					buf[0] +
					buf[1] * 94 +
					buf[2] * 94 ** 2 +
					buf[3] * 94 ** 3 +
					buf[4] * 94 ** 4;
				result.writeUint32BE(val, i * 4);
			} else {
				let val: number;
				if (chunk[i].length === 4) {
					val = buf[0] + buf[1] * 94 + buf[2] * 94 ** 2 + buf[3] * 94 ** 3;
				} else if (chunk[i].length === 3) {
					val = buf[0] + buf[1] * 94 + buf[2] * 94 ** 2;
				} else {
					val = buf[0] + buf[1] * 94;
				}
				result.writeUintBE(val, i * 4, lastSize);
			}
		}
		return result;
	}

	public isBase94(str: string): boolean {
		const r = str.length % 5;
		return (
			/^[\x21-\x7e]*$/.test(str) && (r === 0 || this.byteLength.includes(r))
		);
	}
}

export const base94 = new Base94();

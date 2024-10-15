import crypto from "node:crypto";
import { describe, expect, it } from "vitest";
import { InvalidEncodingError, base45 } from "..";

describe("base45", () => {
	const cases: [input: string | Buffer, result: string][] = [
		["", ""],
		["AB", "BB8"],
		["Hello!!", "%69 VD92EX0"],
		["base-45", "UJCLQE7W581"],
		["ietf!", "QED8WEX0"],
		[Buffer.from([10]), "A0"],
		[Buffer.from([0x12, 0xab]), "9G2"],
		[
			Buffer.from("b7c6aa3984e5b440df5eba71879c95b834", "hex"),
			"LANHNL1 GJZMWASTPNL6HX-I71",
		],
	];

	it.each(cases)("encode %s", (input, result) => {
		expect(base45.encode(input)).toBe(result);
	});

	it.each(cases)("decode %s", (input, result) => {
		const bufInput = Buffer.isBuffer(input) ? input : Buffer.from(input);
		expect(base45.decode(result)).toEqual(bufInput);
	});

	it("random test", () => {
		for (let i = 0; i < 100; i++) {
			const length = Math.floor(Math.random() * 100) + 1;
			const input = crypto.randomBytes(length);

			const encode = base45.encode(input);
			const decode = base45.decode(encode);

			expect(decode).toEqual(input);
		}
	});

	it.each([["AD!"], ["bb8"]])("throw when invalid base45: %S", (str) => {
		expect(() => base45.decode(str)).toThrow(InvalidEncodingError);
	});
});

import { describe, expect, it } from "vitest";
import { InvalidEncodingError, base10 } from "..";

describe("base10", () => {
	const cases: [input: Buffer | string, result: string][] = [
		["", ""],
		[Buffer.from([0x50]), "080"],
		[Buffer.from("ab", "hex"), "171"],
		[Buffer.from("abef", "hex"), "44015"],
		[Buffer.from("1212", "hex"), "04626"],
		[Buffer.from("1000", "hex"), "04096"],
		[Buffer.from("34ac5f", "hex"), "03451999"],
		[Buffer.from("7a7abf", "hex"), "08026815"],
		[Buffer.from("fefefe", "hex"), "16711422"],
		[Buffer.from("659ABAC0", "hex"), "1704639168"],
		[Buffer.from("1111111111", "hex"), "0073300775185"],
		[Buffer.from("ABABABABABAB", "hex"), "188753807911851"],
		[Buffer.from("4eb3ff8c69ad92", "hex"), "22152958337199506"],
		[Buffer.from("2ad28a8ea01c77c0", "hex"), "12053441562025079192"],
		[
			Buffer.from("6e8d2188f85be49b791e60", "hex"),
			"311174226095871722608406112",
		],
		[
			Buffer.from("b7c6aa3984e5b440df5eba71879c95b834", "hex"),
			"517283551498008841825999645740431609812020",
		],
	];

	it.each(cases)("encode %#", (input, result) => {
		expect(base10.encode(input)).toBe(result);
	});

	it.each(cases)("decode %#", (input, result) => {
		const bufInput = Buffer.isBuffer(input) ? input : Buffer.from(input);
		expect(base10.decode(result)).toEqual(bufInput);
	});

	it.each(["12D", "1212", "919581"])("throw when invalid base10: %s", (str) => {
		expect(() => base10.decode(str)).toThrow(InvalidEncodingError);
	});
});

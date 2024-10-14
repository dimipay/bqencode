import { describe, expect, it } from "vitest";
import { InvalidEncodingError, base94 } from "..";

describe("base94", () => {
	const cases: [input: string | Buffer, result: string][] = [
		["", ""],
		[Buffer.from([0x50]), "q!"],
		[Buffer.from("ab", "hex"), 'n"'],
		[Buffer.from("abef", "hex"), "8}%"],
		[Buffer.from("1212", "hex"), "5R!"],
		[Buffer.from("1000", "hex"), "WL!"],
		[Buffer.from("34ac5f", "hex"), "F`/%"],
		[Buffer.from("7a7abf", "hex"), "^H_*"],
		[Buffer.from("fefefe", "hex"), ")<,5"],
		[Buffer.from("659ABAC0", "hex"), "7j@o6"],
		[Buffer.from("1111111111", "hex"), "*'f_$2!"],
		[Buffer.from("ABABABABABAB", "hex"), "vn[tER|%"],
		[Buffer.from("4eb3ff8c69ad92", "hex"), "u=gv1ml@)"],
		[Buffer.from("2ad28a8ea01c77c0", "hex"), "KG}3*u[-GC"],
		[
			Buffer.from("b7c6aa3984e5b440df5eba71879c95b834", "hex"),
			"Fq.OHU[IU=P@w~POP9.>U!",
		],
	];

	it.each(cases)("encode %#", (input, result) => {
		expect(base94.encode(input)).toBe(result);
	});

	it.each(cases)("decode %#", (input, result) => {
		const bufInput = Buffer.isBuffer(input) ? input : Buffer.from(input);
		expect(base94.decode(result)).toEqual(bufInput);
	});

	it.each(["a", "abcdef", "테스트"])("throw when invalid base94: %s", (str) => {
		expect(() => base94.decode(str)).toThrow(InvalidEncodingError);
	});
});

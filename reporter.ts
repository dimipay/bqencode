/* istanbul ignore file */
import reporter from "./reporters/reporter.json";

const moddes = ["numeric", "alphanumeric", "byte"] as const;
type Mode = (typeof moddes)[number];

const bases = ["base10", "base45", "base64", "base94"] as const;
type Base = (typeof bases)[number];

abstract class AbstractBase {
	abstract readonly BYTES_LENGTH: number[];
	abstract readonly DEFAULT_BYTES: number;
	abstract readonly mode: Mode;

	charLength(byte: number): number {
		let length =
			Math.floor(byte / this.DEFAULT_BYTES) *
			this.BYTES_LENGTH[this.DEFAULT_BYTES - 1];
		const remainder = byte % this.DEFAULT_BYTES;
		if (remainder > 0) {
			length += this.BYTES_LENGTH[remainder - 1];
		}
		return length;
	}

	version(charLength: number): number {
		const capacity = AbstractBase.capacity[this.mode];
		for (let i = 0; i < capacity.length; i++) {
			if (charLength <= capacity[i]) {
				return i + 1;
			}
		}
		return -1;
	}

	static readonly capacity: Record<Mode, number[]> = {
		numeric: [
			41, 77, 127, 187, 255, 322, 370, 461, 552, 652, 772, 883, 1022, 1101,
			1250, 1408, 1548, 1725, 1903, 2061, 2232, 2409, 2620, 2812, 3057, 3283,
			3517, 3669, 3909, 4158, 4417, 4686, 4965, 5253, 5529, 5836, 6153, 6479,
			6743, 7089,
		],
		alphanumeric: [
			25, 47, 77, 114, 154, 195, 224, 279, 335, 395, 468, 535, 619, 667, 758,
			854, 938, 1046, 1153, 1249, 1352, 1460, 1588, 1704, 1853, 1990, 2132,
			2223, 2369, 2520, 2677, 2840, 3009, 3183, 3351, 3537, 3729, 3927, 4087,
			4296,
		],
		byte: [
			17, 32, 53, 78, 106, 134, 154, 192, 230, 271, 321, 367, 425, 458, 520,
			586, 644, 718, 792, 858, 929, 1003, 1091, 1171, 1273, 1367, 1465, 1528,
			1628, 1732, 1840, 1952, 2068, 2188, 2303, 2431, 2563, 2699, 2809, 2953,
		],
	};
}

class Base10 extends AbstractBase {
	readonly BYTES_LENGTH = [3, 5, 8, 10, 13, 15, 17, 20];
	readonly DEFAULT_BYTES = 7;

	readonly mode = "numeric";
}

class Base45 extends AbstractBase {
	readonly BYTES_LENGTH = [2, 3, 5, 6, 8, 9, 11, 12];
	readonly DEFAULT_BYTES = 2;

	readonly mode = "alphanumeric";
}

class Base64 extends AbstractBase {
	readonly BYTES_LENGTH = [];
	readonly DEFAULT_BYTES = 0;

	readonly mode = "byte";

	override charLength(bytes: number): number {
		return Math.ceil((4 * bytes) / 3);
	}
}

class Base94 extends AbstractBase {
	readonly BYTES_LENGTH = [2, 3, 4, 5, 7, 8, 9, 10];
	readonly DEFAULT_BYTES = 4;
	readonly mode = "byte";
}

const base10 = new Base10();
const base45 = new Base45();
const base64 = new Base64();
const base94 = new Base94();

const instances = { base10, base45, base64, base94 };

async function makeReporter() {
	const reporter: Reporter = {
		base10: [],
		base45: [],
		base64: [],
		base94: [],
	};

	for (let i = 1; i <= 2919; i++) {
		for (const base of bases) {
			const length = instances[base].charLength(i);
			const version = instances[base].version(length);
			if (version !== -1) {
				reporter[base].push({ length, version });
			}
		}
	}

	await Bun.write("./reporter.json", JSON.stringify(reporter, null, 2));
}

type Reporter = Record<
	Base,
	{
		length: number;
		version: number;
	}[]
>;

async function compare() {
	const rep: string[] = ["byte,version,bases,length"];
	for (let i = 1; i <= 2919; i++) {
		const leastLengthBases: Base[] = [];
		let leastLength = Number.MAX_SAFE_INTEGER;
		for (const base of bases) {
			if (reporter[base][i - 1] === undefined) {
				continue;
			}
			if (reporter[base][i - 1].length < leastLength) {
				leastLength = reporter[base][i - 1].length;
				leastLengthBases.length = 0;
			}
			if (reporter[base][i - 1].length === leastLength) {
				leastLengthBases.push(base);
			}
		}

		const leastVersionBases: Base[] = [];
		let leastVersion = Number.MAX_SAFE_INTEGER;
		for (const base of leastLengthBases) {
			if (reporter[base][i - 1].version < leastVersion) {
				leastVersion = reporter[base][i - 1].version;
				leastVersionBases.length = 0;
			}
			if (reporter[base][i - 1].version === leastVersion) {
				leastVersionBases.push(base);
			}
		}

		rep.push(
			`${i},${leastVersion},"${leastLengthBases.join(",")}",${leastLength}`,
		);
	}

	console.log(rep);

	await Bun.write("./reporter2.csv", rep.join("\n"));
}

// makeReporter()
compare();

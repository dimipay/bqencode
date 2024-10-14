export function readBigInt56BE(buf: Buffer, offset = 0): bigint {
	if (buf[offset] === undefined || buf[offset + 6] === undefined) {
		throw new RangeError("Cannot access beyond buffer length");
	}
	const first = buf.readUintBE(offset, 3);
	const last = buf.readUint32BE(offset + 3);
	return (BigInt(first) << 32n) | BigInt(last);
}

export function writeBigInt56BE(value: bigint, buf: Buffer, offset = 0) {
	const first = Number(value >> 32n);
	buf[offset] = first >> 16;
	buf[offset + 1] = (first >> 8) & 0xff;
	buf[offset + 2] = first & 0xff;

	const second = Number(value & 0xffffffffn);
	buf[offset + 3] = second >> 24;
	buf[offset + 4] = (second >> 16) & 0xff;
	buf[offset + 5] = (second >> 8) & 0xff;
	buf[offset + 6] = second & 0xff;
}

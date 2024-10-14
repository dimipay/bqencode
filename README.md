# Binary Encoding for QR Codes

## Installation

```bash
bun add @dimipay/bqencode

# or

npm install @dimipay/bqencode
```

## Base 10

encode 7 bytes to 17 characters.

```ts
import { base10 } from "bqencode";

const buf = Buffer.from('b7c6aa3984e5b440df5eba71879c95b834', 'hex');
const enc = base10.encode(buf);
console.log(enc); // '517283551498008841825999645740431609812020'

const dec = base10.decode(enc)
console.log(dec.toString('hex')); // 'b7c6aa3984e5b440df5eba71879c95b834'
```

## Base 45

encode 2 bytes to 3 characters.

```ts
import { base45 } from "bqencode";

const buf = Buffer.from('b7c6aa3984e5b440df5eba71879c95b834', 'hex');
const enc = base45.encode(buf);
console.log(enc); // 'LANHNL1 GJZMWASTPNL6HX-I71'

const dec = base45.decode(enc)
console.log(dec.toString('hex')); // 'b7c6aa3984e5b440df5eba71879c95b834'
```

## Base 94

eocode 4 bytes to 5 characters.

```ts
import { base94 } from "bqencode";

const buf = Buffer.from('b7c6aa3984e5b440df5eba71879c95b834', 'hex');
const enc = base94.encode(buf);
console.log(enc); // 'Fq.OHU[IU=P@w~POP9.>U!'

const dec = base94.decode(enc)
console.log(dec.toString('hex')); // 'b7c6aa3984e5b440df5eba71879c95b834'
```
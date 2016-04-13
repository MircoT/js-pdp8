## Test

### Install dependencies

```bash
npm install --dev 
```

### Start tests

```bash
npm test
```

### Start tests and coverage

```bash
npm run-script test_and_cover
```

## Use the emulator

Here is an example of how to use it in nodejs:
```javascript
var PDP8 = require('./pdp8');

var vm = new PDP8();

vm.compile(`ORG 100\n
LDA X\n
STA Y\n
HLT\n
X, DEC 10\n
Y, DEC 0\n
END`);

vm.start();

while(vm.ctrlUnit.S) {
    vm.next();
}

console.log(vm.status)
console.log(vm.getRam())
```

You can find more source examples [here](https://github.com/MircoT/js-pdp8/tree/master/lib/test/sources).

### Generate compatible Javascript code

```bash
babel pdp8.js --presets es2015 --out-file pdp8-compiled.js

# You can compress it like that

uglifyjs pdp8-compiled.js --compress -o pdp8-compiled.min.js
```
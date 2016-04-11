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
var PDP8 = require('pdp8');

var vm = new PDP8();

vm.compile(`ORG 100
LDA X
STA Y
HLT
X, DEC 10
Y, DEC 0`

vm.start();

while(vm.ctrlUnit.S) {
    vm.next();
}

console.log(vm.status)
console.log(vm.getRam())
```
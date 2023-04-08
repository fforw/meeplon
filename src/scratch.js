
const mask = 0

let v = 5;
const before = v;
const change = 3
v = v & ~change

console.log(v, (before & change) & mask)

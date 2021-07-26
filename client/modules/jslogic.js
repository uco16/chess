export function arraysEqual(a, b) {
  return (Array.isArray(a) &&
	  Array.isArray(b) &&
	  a.length === b.length &&
	  a.every((val, index) => val === b[index]));
}

export function arraysAdd(a, b) {
  if (a.length != b.length) {
    throw new Error('Cannot add arrays of different length');
  }
  let sum = [];
  for (let i=0; i<a.length; i++) {
    sum.push(a[i]+b[i]);
  }
  return sum;
}

export function nullMatrix(cols,rows) {
  let mx = [];
  for (let col=0; col<9; col++) {
    mx[col] = [];
    for (let row=0; row<9; row++) {
      mx[col][row] = null;
    }
  }
  return mx;
}

export function copyMatrix(mx) {
  // returns shallow copy of matrix, as long as the objects are strings/ints/etc.
  let new_mx = [];
  for (var col=0; col < mx.length; ++col) {
    new_mx[col] = mx[col].slice();
  }
  return new_mx;
}

export function any(array, boolFunc) {
  // returns true iff boolFunc(x) is not null/0/''/false for all x in array
  for (let i=0; i<array.length; i++) {
    if (boolFunc(array[i])) { return true; }
  }
  return false;
}

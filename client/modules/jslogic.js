export function arraysEqual(a, b) {
  return Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.every((val, index) => val === b[index]);
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

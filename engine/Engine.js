const { spawn, exec } = require('child_process');

module.exports = class Engine {
  constructor(verbose=false) {
    this.verbose = verbose;
    if (this.verbose)
      console.log("Initialising Engine");

    this.Arborist = spawn("./engine/Arborist.out");

    this.Arborist.stdout.on('data', (data) => {
      let dstr = data.toString();
      if (this.verbose)
	console.log(`stdout: ` + dstr);
      if (dstr.substring(0,9)==='best move')
      {
	let long_move = dstr.substring(11, 15);
	let [initial, final] = matrixMove(long_move);
	this.emit('move', initial, final);
	this.move(initial, final);
      }
    });

    this.Arborist.stderr.on('data', (data) => {
      console.log(`stderr: ${data}`);
    });
    this.Arborist.on('close', (code) => {
      console.log(`Arborist exited with code ${code}`);
    });

    this.emitFuncs = {'any': []};
  }

  onAny(func) {
    this.emitFuncs['any'].push(func);
  }

  resetEvents() {
    for (let funcName of Object.keys(this.emitFuncs))
      this.emitFuncs[funcName] = [() => {}];
  }

  on(eventName, func) {
    if (this.emitFuncs.hasOwnProperty(eventName))
      this.emitFuncs[eventName].push(func);
    else
      this.emitFuncs[eventName] = [func];
  }

  emit(eventName, ...args) {
    for (let func of this.emitFuncs[eventName])
      func(...args);
    for (let anyFunc of this.emitFuncs['any'])
      anyFunc(eventName, ...args);
  }

  newGame(color, fen) {
    this.Arborist.stdin.write(`position fen ${fen}\n`);
  }

  startThinking(depth=5) {
    this.Arborist.stdin.write(`go ${depth}\n`);
  }

  move(initial, final) {
    let longMove = algebraic(initial) + algebraic(final);
    this.Arborist.stdin.write(`moves ${longMove}\n`);
  }

  exit() {
    this.resetEvents();
    this.Arborist.stdin.write(`exit\n`);
  }
}

function algebraic(square) {
  let [col, row] = square;
  return 'abcdefgh'[col]+(row+1);
}

function square(algebraic) {
  let col = algebraic.charCodeAt(0) - 97;
  let row = algebraic[1] - '1';
  return [col, row];
}

function matrixMove(longMove) {
  let iSq = longMove.substring(0, 2);
  let fSq = longMove.substring(2, 4);
  return [square(iSq), square(fSq)];
}

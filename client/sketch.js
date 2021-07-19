// imports from custom client-side functions
import isLegal from './modules/isLegal.js';
import {addtoMoveList} from './modules/movelist.js';
import {arraysEqual} from './modules/jslogic.js';
import ChessGame from './modules/ChessGame.js';

// default variables
let size = document.getElementById('chessboard').clientWidth;
let padding = size/16;  // width of the edge of the board
let boardsize = size - 2 * padding;
let sqs = boardsize / 8;
let pcs = sqs/1.5;
let playerColor;

// Board colours
const darkcol = [128, 64, 0];
const lightcol = [255, 166, 77];

function sketch (p) {  
  // "instance mode" https://github.com/processing/p5.js/wiki/p5.js-overview#instantiation--namespace
  let selectedPiece = null;
  let pieceImages;
  let previousMoveFinal = null;
  let game;

  // const socket = io();
  // io from socket.io not explicitly imported since we just include the script in index.html
  // explicitly importing and setting sketch.js to a module seems to break socket.io?

  // define what to do when move is received
  socket.on('move', (initial, final, itype, ftype) => { move(initial, final); });

  p.preload = () => {
    // load images before doing anything else
    pieceImages = {
      'pawn': p.loadImage('client/pieces/pawn.png'),
      'rook': p.loadImage('client/pieces/rook.png'),
      'knight_left': p.loadImage('client/pieces/knight_left.png'),
      'knight_right': p.loadImage('client/pieces/knight_right.png'),
      'bishop_left': p.loadImage('client/pieces/bishop_left.png'),
      'bishop_right': p.loadImage('client/pieces/bishop_right.png'),
      'queen': p.loadImage('client/pieces/queen.png'),
      'king': p.loadImage('client/pieces/king.png'),
      'pawn_white': p.loadImage('client/pieces/pawn_white.png'),
      'rook_white': p.loadImage('client/pieces/rook_white.png'),
      'knight_left_white': p.loadImage('client/pieces/knight_left_white.png'),
      'knight_right_white': p.loadImage('client/pieces/knight_right_white.png'),
      'bishop_left_white': p.loadImage('client/pieces/bishop_left_white.png'),
      'bishop_right_white': p.loadImage('client/pieces/bishop_right_white.png'),
      'queen_white': p.loadImage('client/pieces/queen_white.png'),
      'king_white': p.loadImage('client/pieces/king_white.png'),
    };
  }

  p.setup = () => {
    p.createCanvas(size, size);
    drawBoard();
    game = new ChessGame(p, pieceImages);
    drawUnselectedPieces();
  }

  function drawUnselectedPieces() {
    // draw board with pieces, except selected Piece
    for (let i = 0 ; i < game.activePieces.length; i++) {
      if (game.activePieces[i] != selectedPiece) {
	drawPiece(game.activePieces[i]);
      }
    }
  }

  function drawPiece(piece) {
    let x, y;
    [x, y] = ColRowtoXY(...piece.position);
    p.image(piece.img, x+(sqs-pcs)/2, y+(sqs-pcs)/2, pcs, pcs);
  }

  function dragPiece(piece) {
    let x, y;
    [x, y] = [p.mouseX - pcs/2, p.mouseY - pcs/1.6];
    p.image(piece.img, x, y, pcs, pcs);
  }

  function drawBoard() {

    // draw the board without pieces
    p.background(204, 68, 0);
    p.strokeWeight(0);
    p.fill(...lightcol);
    p.square(padding, padding, boardsize)
    p.fill(...darkcol);
    let row;
    let col;
    for (col = 0; col < 8; col++) {
      for (row = 0; row < 8; row++) {
	if ((row + col) % 2 == 0) {
	  p.square(...ColRowtoXY(col, row), sqs);
	}
      }
    }
  }

  p.draw = () => {
    if (p.mouseIsPressed && selectedPiece != null) {
      drawBoard();
      drawUnselectedPieces();
      dragPiece(selectedPiece);
    }
  }

  p.mousePressed = () => {
    // mouse down selects/grabs piece of own colour
    let col, row;
    [col, row] = mousePos();
    if (0 <= col && col < 8 && 0 <= row && row < 8) {
      let pieceUnderMouse = game.pieces[col][row];
      if (pieceUnderMouse != null && pieceUnderMouse.color == playerColor) {
	selectedPiece = pieceUnderMouse;
      }
    }
  }

  p.mouseReleased = () => {
    if (selectedPiece) {
      const startPos = selectedPiece.position;
      const endPos = mousePos();
      drawBoard();
      drawUnselectedPieces();

      if (isLegal(startPos, endPos, game.strRep(), previousMoveFinal, playerColor)) {
	let initialPieceType = game.pieces[startPos[0]][startPos[1]].type;
	let finalPieceType;
	if (game.isEmpty(endPos)) {
	  finalPieceType = 'empty';
	} else {
	  let finalPiece = game.pieces[endPos[0]][endPos[1]];
	  finalPieceType = finalPiece.type;
	}
	sendMove(selectedPiece.position, mousePos(), initialPieceType, finalPieceType);  // send move to server
	move(selectedPiece.position, mousePos());  // play move client side
      }
      drawPiece(selectedPiece);
      selectedPiece = null;
    }
  }

  function sendMove(initial, final, initialPieceName, finalPieceName) {
    socket.emit('move', initial, final, initialPieceName, finalPieceName);
    addtoMoveList(initial, final, initialPieceName, finalPieceName);
  }

  function move(initial, final) {
    let piece = game.pieces[initial[0]][initial[1]];
    game.pieces[initial[0]][initial[1]] = null;

    let targetPiece = game.pieces[final[0]][final[1]];
    // check for enpassant
    if (previousMoveFinal !== null) {
      let previous_move_piece = game.pieces[previousMoveFinal[0]][previousMoveFinal[1]];
      if (previous_move_piece.type == "pawn") {
	if (arraysEqual(initial, [previousMoveFinal[0]-1, previousMoveFinal[1]])
	    || arraysEqual(initial, [previousMoveFinal[0]+1, previousMoveFinal[1]])) {
	  if (final[0] == previousMoveFinal[0]) {
	    // is enpassant
	    targetPiece = previous_move_piece;
	    game.pieces[previousMoveFinal[0]][previousMoveFinal[1]] = null;
	  }
	}
      }
    }
    if (targetPiece) {
      //in the case of a capture, we need to remove the captured piece
      //from the active pieces
      game.deactivate(targetPiece);
    }

    game.pieces[final[0]][final[1]] = piece;
    piece.position = final;
    drawBoard();
    drawUnselectedPieces();
    drawPiece(piece);
    previousMoveFinal = final;
  }

  function mousePos() {
    // return [col, row] under mouse position
    return XYtoColRow(p.mouseX, p.mouseY);
  }

  // mobile device behaviour
  //p.touchMoved = () => {
  //  return false;  // prevent default behaviour
  //}
};

function XYtoColRow(x, y) {
  // transform x, y coordinates into col, row coordinates
  // 
  // x, y are computer graphics style, so y counts form the top
  // whereas col, row counts from bottom left to top right
  let col = Math.floor((x - padding)/sqs);
  let row = Math.floor((y - padding)/sqs);
  if (playerColor == 'white') {
    row = 7 - row;
  } else {
    col = 7 - col;
  }
  return [col, row];
}

function ColRowtoXY(col, row) {
  let x;
  let y;
  if (playerColor == 'white') {
    x = padding + col*sqs;
    y = padding + (7 - row)*sqs;
  } else {
    x = padding + (7-col)*sqs;
    y = padding + row*sqs;
  }
  return [x, y];
}

socket.on('match', (color) => {
  playerColor = color;
  console.log("sketch: match, start game with colour " + playerColor);
  new p5(sketch, 'chessboard');
});

// imports from custom client-side functions
import isLegal from './modules/isLegal.js';
import inCheck from './modules/inCheck.js';
import isCheckmate from './modules/isCheckmate.js';
import {addtoMoveList} from './modules/movelist.js';
import ChessGame from './modules/ChessGame.js';
import inputPromotion from './modules/promotion.js';
import {arraysEqual} from './modules/jslogic.js';

// debugging
let verbose=true;

// move sound
const moveSound = new Audio('move.mp3');

// default variables
let size = document.getElementById('chessboard').clientWidth;
let padding = size/16;  // width of the edge of the board
let boardsize = size - 2 * padding;
let sqs = boardsize / 8;
let pcs = sqs/1.5;
let playerColor;
let opponentColor;
let defaultFEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
let awaitingPromotion = false;


// Board colours
const backcol = [204, 68, 0];
const darkcol = [128, 64, 0];
const lightcol = [255, 166, 77];

// board lettering
const letterCol = [133, 45, 1];
const font = 'Times New Roman';

function sketch (p) {  
  // "instance mode" https://github.com/processing/p5.js/wiki/p5.js-overview#instantiation--namespace
  let selectedPiece = null;
  let pieceImages;
  let game;
  
  // has mouse left starting position?
  let leftStartPos = false

  // const socket = io();
  // io from socket.io not explicitly imported since we just include the script in index.html
  // explicitly importing and setting sketch.js to a module seems to break socket.io?

  // define what to do when opponent's move is received
  socket.on('move', (initial, final, iType, fType, promotionOption) => { 
    if (verbose) {console.log('received move', [initial, final], [iType, fType], promotionOption);}

    // play and render move on board
    move(initial, final); 
    if (promotionOption) {
      // promoting pawn is currently on 'final' square
      promote(final, promotionOption);
    }

    if (verbose) {console.log(game.toFEN());}
    // add to move list
    addtoMoveList(initial, final, iType, fType, inCheck(game.strRep(), playerColor),
                  isCheckmate(game.strRep(), playerColor, game.previousMoveFinal, 
			      game.canCastle[playerColor], game.activeColor));
  });

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
    game = new ChessGame(defaultFEN);
    drawUnselectedPieces();
    
  }

  p.draw = () => {
    if (selectedPiece !== null) {
      drawBoard();
      drawUnselectedPieces();
      dragPiece(selectedPiece);
    }
  }

  function drawUnselectedPieces() {
    // draw board with pieces, except selected Piece
    for (let i = 0 ; i < game.activePieces.length; i++) {
      if (game.activePieces[i] != selectedPiece) {
	drawPiece(game.activePieces[i]);
      }
    }
  }

  function pieceImg(piece) {
    let orientation = '';
    if (piece.type==='knight' || piece.type==='bishop') {
      orientation = '_left';
    }
    let color = '';
    if (piece.color==='white') {
      color = '_white';
    }
    return pieceImages[piece.type + orientation + color];
  }

  function drawPiece(piece) {
    let [x, y] = ColRowtoXY(...piece.position);
    p.image(pieceImg(piece), x+(sqs-pcs)/2, y+(sqs-pcs)/2, pcs, pcs);
  }

  
  function dragPiece(piece) {
    let [x, y] = [p.mouseX - pcs/2, p.mouseY - pcs/1.6];
    p.image(pieceImg(piece), x, y, pcs, pcs);
    
    // check if mouse has left starting position, 
    // i.e. if current mouse position is different from the position where the
    // selected piece was picked up
    if (!arraysEqual(mousePos(), selectedPiece.position)) {
      leftStartPos = true;
    }
  }

  function drawBoard() {
    // draw the board without pieces
    p.background(...backcol);
    p.strokeWeight(0);
    p.fill(...lightcol);
    p.square(padding, padding, boardsize)
    p.fill(...darkcol);
    let row;
    let col;
    for (col = 0; col < 8; col++) {
      for (row = 0; row < 8; row++) {
	if ((row + col) % 2 === 0) {
	  p.square(...ColRowtoXY(col, row), sqs);
	}
      }
    }
    // add numbers and letters to border
    labelBoard();
  }

  function labelBoard() {
    // label rows and columns with numbers and letters respectively 
    p.textSize(sqs * 0.4);
    p.fill(...letterCol);
    p.textFont(font);
    for (let colNum = 0; colNum < 8; colNum++) {
      let x;
      //  rows and columns switched for black
      if (playerColor === 'white') {
        x = padding + (colNum + 0.5) * sqs;
      }
      else {
        x = padding + (7 - colNum + 0.5) * sqs;
      }
      
      p.textAlign(p.CENTER , p.CENTER)
      // label columns with numbers
      p.text((8 - colNum).toString(), padding/2, x);
      p.text((8 - colNum).toString(), size - padding/2, x);
      
      // convert number to letter and label row
      let rowLet = String.fromCharCode(97 + colNum);
      p.text(rowLet, x, padding/2);
      p.text(rowLet, x, size - padding/2);
    }
  }
  
  p.mousePressed = () => {
    // mouse down selects/grabs piece of own colour
    let col, row;
    [col, row] = mousePos();
    
    if (0 <= col && col < 8 && 0 <= row && row < 8) {
      let pieceUnderMouse = game.getPiece(mousePos());
      if (selectedPiece) {

        if (arraysEqual(mousePos(), selectedPiece.position)) {
	         // user clicked back on starting square, no move is played
          selectedPiece = null;
          drawBoard();
          drawUnselectedPieces();
          leftStartPos = false;
        }
      }
      else if (pieceUnderMouse != null && pieceUnderMouse.color == playerColor) {
        // select piece if none already selected
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

      // if mouse clicked or dragged 
      if (!arraysEqual(mousePos(), startPos)) {
        if (!awaitingPromotion &&
            isLegal(startPos, endPos, game.strRep(), game.previousMoveFinal,
                    playerColor, game.canCastle[playerColor], game.activeColor)) {
          handleMove(startPos, endPos);
        }
        drawPiece(selectedPiece);
        selectedPiece = null;
      }  
      else if (leftStartPos) {
	      drawPiece(selectedPiece);
        selectedPiece = null;
      }
      leftStartPos = false;
      
      if (p.mouseButton === p.RIGHT) {
        selectedPiece = null;
        drawUnselectedPieces();
        document.addEventListener('contextmenu', e => {e.preventDefault();}, {once: true});
      }
    }
  }

  async function handleMove(startPos, endPos) {
    let initialPieceType = game.getPiece(startPos).type;
    let finalPieceType;
    if (game.isEmpty(endPos)) {
      finalPieceType = 'empty';
    } else {
      finalPieceType = game.getPiece(endPos).type;
    }
    move(startPos, endPos);  // play move client side

    // before sending the move, check if a pawn has reached promotion square
    if (initialPieceType==='pawn' && (endPos[1]===0 || endPos[1]===7)) {
      awaitingPromotion = true;  // blocks further moves being done
      const promotionResult = await inputPromotion(playerColor);
      sendMove(startPos, endPos, initialPieceType, finalPieceType, promotionResult);
      awaitingPromotion = false;
      promote(endPos, promotionResult);
    } else {
      sendMove(startPos, endPos, initialPieceType, finalPieceType);  // send move to server
    }
    if (verbose) {console.log(game.toFEN());}
    addtoMoveList(startPos, endPos, initialPieceType, finalPieceType, 
                  inCheck(game.strRep(), opponentColor),
                  isCheckmate(game.strRep(), opponentColor, game.previousMoveFinal, 
                              game.canCastle[opponentColor], game.activeColor));
  }

  function sendMove(initial, final, ...args) {
    if (verbose) {console.log('sending move', [initial, final], args);}
    socket.emit('move', initial, final, ...args);
  }

  function move(initial, final) {
    game.move(initial, final);
    drawBoard();
    drawUnselectedPieces();
    drawPiece(game.getPiece(final));
    moveSound.play();
  }

  function promote(square, promotionOption) {
    if (verbose) {console.log('promote to', promotionOption);}
    game.promote(square, promotionOption);  
    drawBoard();
    drawUnselectedPieces();
  }

  function mousePos() {
    // return [col, row] under mouse position
    return XYtoColRow(p.mouseX, p.mouseY);
  }

  p.windowResized = () => {
    // scale chessboard sketch responsively as window size is changed
    size = document.getElementById('chessboard').clientWidth;
    padding = size/16;  // width of the edge of the board
    boardsize = size - 2 * padding;
    sqs = boardsize / 8;
    pcs = sqs/1.5;
    p.resizeCanvas(size, size);
    drawBoard();
    drawUnselectedPieces();
  };


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

socket.on('match', (color, FEN) => {
  playerColor = color;
  opponentColor = {'white': 'black', 'black': 'white'}[playerColor];
  defaultFEN = FEN;
  if (verbose) {console.log("sketch: match, start game with colour " + playerColor);}
  new p5(sketch, 'chessboard');

  // if the game starts from a position where it is black's turn to move, 
  // add one empty move (i.e. "1. ...") to the movelist
  if (FEN.split(' ')[1]==='b') { addtoMoveList(); };
});

// only tell the server that you are ready for match AFTER you have defined what to do
// when the server matches you
socket.emit('readyForMatch');

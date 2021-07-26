// imports from custom client-side functions
import isLegal from '/client/modules/isLegal.js';
import inCheck from '/client/modules/inCheck.js';
import isCheckmate from '/client/modules/isCheckmate.js';
import {addtoMoveList} from '/client/modules/movelist.js';
import ChessGame from '/client/modules/ChessGame.js';
import inputPromotion from '/client/modules/promotion.js';
import {arraysEqual} from '/client/modules/jslogic.js';
import concludeGame from '/client/modules/concludeGame.js';
import {resignButton, drawButton, initializeDrawButton} from '/client/modules/resignAndDraw.js';

export default function chessSketch(playerColor, FEN) {
  return (p) => {sketch(p, playerColor, FEN);};
}

function sketch (p, playerColor, FEN) {  
  // "instance mode" https://github.com/processing/p5.js/wiki/p5.js-overview#instantiation--namespace
  
  // debugging
  let verbose=true;
  
  // default variables
  let size = document.getElementById('chessboard').clientWidth;
  let padding = size/16;  // width of the edge of the board
  let boardsize = size - 2 * padding;
  let sqs = boardsize / 8;
  let pcs = sqs/1.5;
  let awaitingPromotion = false;

  let opponentColor = {'white':'black', 'black': 'white'}[playerColor]
  let selectedPiece = null;
  let pieceImages;
  let game;
  
  // has mouse left starting position?
  let leftStartPos = false
  
  // move sound
  const moveSound = new Audio('move.mp3');

  // Board colours
  const backcol = [204, 68, 0];
  const darkcol = [128, 64, 0];
  const lightcol = [255, 166, 77];

  // board lettering
  const letterCol = [133, 45, 1];
  const font = 'Times New Roman';

  // const socket = io();
  // io from socket.io not explicitly imported since we just include the script in index.html
  // explicitly importing and setting sketch.js to a module seems to break socket.io?

  socket.on('resign', () => {
    if (verbose) {console.log('Opponent resigned, stopping sketch loop.');};
    p.noLoop();
  });
  socket.on('draw', () => {
    if (verbose) {console.log('The game ended in a draw. Stopping sketch loop.');};
    p.noLoop();
  })

  // define what to do when opponent's move is received
  socket.on('move', (initial, final, iType, fType, promotionOption) => { 
    // play and render move on board
    move(initial, final); 
    if (promotionOption) {
      // promoting pawn is currently on 'final' square
      promote(final, promotionOption);
    }

    if (verbose) {console.log(game.toFEN());}
    // check if this move from the opponent puts the player in checkmate
    let playerCheckmated = isCheckmate(game.strRep(), playerColor, game.enPassantTargetSquare(), 
				       game.canCastle[playerColor], game.activeColor);
    // add to move list
    addtoMoveList(initial, final, iType, fType, inCheck(game.strRep(), playerColor),
		  playerCheckmated);

    if (playerCheckmated) {
      if (verbose) {console.log('stopping loop');};
      p.noLoop();
      concludeGame('loss');
    }
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
    game = new ChessGame(FEN);

    // make resign and draw buttons stop the sketch
    resignButton.addEventListener('click', () => {
      if (verbose) {console.log('resigned: stopping sketch loop');};
      p.noLoop();
    });
    drawButton.addEventListener('click', () => {
      if (drawButton.textContent==='Accept Draw') {
	if (verbose) {console.log('accepted draw: stopping sketch loop');};
	p.noLoop();
      }
    });
  }

  p.draw = () => {
    drawBoard();
    drawUnselectedPieces();
    if (selectedPiece !== null) {
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

  function unselectPiece() {
    selectedPiece = null;
    leftStartPos = false;
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
	  unselectPiece();
        }
	// right click to cancel move
	if (p.mouseButton === p.RIGHT) {
	  document.addEventListener('contextmenu', e => {e.preventDefault();}, {once: true});
	  unselectPiece();
	}
      }
      else if (p.mouseButton === p.LEFT && pieceUnderMouse != null && pieceUnderMouse.color == playerColor) {
        // select piece if none already selected
        selectedPiece = pieceUnderMouse;
      }
    }
  } 

  p.mouseReleased = () => {
    if (selectedPiece) {
      const startPos = selectedPiece.position;
      const endPos = mousePos();
      // if mouse clicked or dragged 
      if (!arraysEqual(mousePos(), startPos)) {
        if (!awaitingPromotion &&
            isLegal(startPos, endPos, game.strRep(), game.enPassantTargetSquare(),
                    playerColor, game.canCastle[playerColor], game.activeColor)) {
          handleMove(startPos, endPos);
        }
	unselectPiece();
      }  
      else if (leftStartPos) {
	unselectPiece();
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

    // if there is a draw offer, making a move rejects the draw offer
    if (drawButton.textContent==='Accept Draw') {
      socket.emit('drawReject');
      initializeDrawButton();
    }

    // check if move left opponent in checkmate
    let opponentCheckmated = isCheckmate(game.strRep(), opponentColor, game.enPassantTargetSquare(), 
					 game.canCastle[opponentColor], game.activeColor);
    addtoMoveList(startPos, endPos, initialPieceType, finalPieceType, 
                  inCheck(game.strRep(), opponentColor), opponentCheckmated);
    if (opponentCheckmated) {
      if (verbose) {console.log('stopping loop');};
      p.noLoop();
      concludeGame('win');
    }
  }

  function sendMove(initial, final, ...args) {
    socket.emit('move', initial, final, ...args);
  }

  function move(initial, final) {
    game.move(initial, final);
    moveSound.play();
  }

  function promote(square, promotionOption) {
    if (verbose) {console.log('promote to', promotionOption);}
    game.promote(square, promotionOption);  
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
  };

  // mobile device behaviour
  //p.touchMoved = () => {
  //  return false;  // prevent default behaviour
  //}

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
};



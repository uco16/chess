// imports
const path = require('path');
const fs = require('fs');
const httpServer = require('http').createServer(handleRequest);
const io = require('socket.io')(httpServer);
const { exec } = require('child_process');
const Engine = require('./engine/Engine.js');

// client file directories
const soundDir	= '/client/sounds/';
const htmlDir	= '/client/html/';

// chess positions
const positions = require('./positions.json');
const defaultPosition = positions['initial'];

// engine matching
const engineTesting = true;

const hostname = '0.0.0.0';
const port = process.env.PORT || 8000;

function handleRequest(req, res) {
  let verbose = false;
  var pathname = req.url;
  if (verbose) {console.log('requested pathname:', pathname);}

  // default to index.html
  if (pathname == '/') {
    pathname = '/index.html';
  }

  // find file extension
  var ext = path.extname(pathname);

  if (ext === '') {
    // if user enters URL '/play', serve './play.html'
    ext = '.html';
    pathname += ext;
  }

  var typeExt = {
    '.html': 'text/html',
    '.js':   'text/javascript',
    '.css':  'text/css',
    '.mp3':  'audio/mpeg',
    '.png':  'image/png',
  };
  // default to plain text
  var contentType = typeExt[ext] || 'text/plain';

  if (contentType.substring(0, 5) === 'audio') {
    // serve audio files from default sound directory
    pathname = soundDir + pathname.substring(1);
  }
  else if (contentType==='text/html') {
    pathname = htmlDir + pathname.substring(1);
  }

  if (verbose) {console.log('served pathname:', pathname);}

  // User file system module
  fs.readFile(__dirname + pathname,
    // Callback function for reading
    function (err, data) {
      // if there is an error
      if (err) {
        res.writeHead(500);
        return res.end('Error loading ' + pathname);
      }
      // Otherwise, send the data, the contents of the file
      if (verbose) {console.log('sending content of type', contentType);}
      res.writeHead(200,{ 'Content-Type': contentType });
      res.end(data);
    }
  );
}

function leaveQueue(socket) {
  queue = queue.filter((client) => {return client != socket});
  //console.log(`User ${socket.id} left queue.`);
}

function joinQueue(socket) {
  if (queue.length > 0) { 
    // someone is waiting in queue
    let opponent = queue.pop();  // get someone from the queue
    match(opponent, socket);  // create a match between them
    
    // don't need to leave queue on disconnect if you are not in queue anymore
    opponent.off('disconnect', () => { leaveQueue(opponent); }); 
  } else { 
    // no one is in queue
    queue.push(socket); // add socket to queue
    socket.on('disconnect', () => { leaveQueue(socket); });
  }
}

function match(socket1, socket2) {
  console.log("Match between " + socket1.id + " and " + socket2.id);

  // set up the communication of between players
  socket1.onAny((eventName, ...args) => {
    console.log(`${socket1.id} sends ${eventName} to ${socket2.id}.`);
    io.to(socket2.id).emit(eventName, ...args);
  });
  socket2.onAny((eventName, ...args) => {
    console.log(`${socket2.id} sends ${eventName} to ${socket1.id}.`);
    io.to(socket1.id).emit(eventName, ...args);
  });
  socket1.on('disconnect', () => {
    console.log(`User ${socket1.id} disconnected. Automatic resign.`);
    io.to(socket2.id).emit('resign');  // auto resign on disconnect
  });
  socket2.on('disconnect', () => {
    console.log(`User ${socket2.id} disconnected. Automatic resign.`);
    io.to(socket1.id).emit('resign');  // auto resign on disconnect
  });

  // send start of match information to players
  io.to(socket1.id).emit('match', {'role': 'player', 
				   'playerColor': 'white',
				   'position': defaultPosition});
  io.to(socket2.id).emit('match', {'role': 'player', 
				   'playerColor': 'black',
				   'position': defaultPosition});
}

let engineMatchCounter = 1;
function engineMatch(socket) {
  console.log("Match between engine and " + socket.id);
  const engine = new Engine();

  let playerColor = ['white', 'black'][(++engineMatchCounter)%2];
  let engineColor = {'white': 'black', 'black': 'white'}[playerColor];
  
  socket.on('move', (initial, final) => {
    console.log(`${socket.id} sends move [${initial}, ${final}] to engine.`);
    engine.move(initial, final);
    engine.startThinking();
  });
  engine.on('move', (initial, final) => {
    console.log(`Engine sends move [${initial}, ${final}] to ${socket.id}.`);
    io.to(socket.id).emit('move', initial, final);
  })

  engine.newGame(engineColor, defaultPosition);

  let matchData = {
    'role': 'player',
    'playerColor': playerColor,
    'position': defaultPosition
  }
  io.to(socket.id).emit('match', playerColor, defaultPosition);

  if (engineColor==='white')
    engine.startThinking();
}

function engineVsEngine(socket) {
  console.log(`${socket.id} started watching an engine match`);
  let white_engine = new Engine();
  let black_engine = new Engine();

  white_engine.on('move', (initial, final) => {
    console.log(`White engine move: [${initial}, ${final}]`);
    if (socket.connected) {
      io.to(socket.id).emit('move', initial, final);
      black_engine.move(initial, final);
      black_engine.startThinking();
    } else {
      white_engine.exit();
      black_engine.exit();
    }
  });
  black_engine.on('move', (initial, final) => {
    console.log(`Black engine move: [${initial}, ${final}]`);
    if (socket.connected) {
      io.to(socket.id).emit('move', initial, final);
      white_engine.move(initial, final);
      white_engine.startThinking();
    } else {
      white_engine.exit();
      black_engine.exit();
    }
  });

  white_engine.newGame('white', defaultPosition);
  black_engine.newGame('black', defaultPosition);

  let matchData = {
    'role': 'spectator',
    'position': defaultPosition
  };
  io.to(socket.id).emit('match', matchData);

  socket.on('readyToWatch', () => {
    if (defaultPosition.split(' ')[1]==='w')
      white_engine.startThinking();
    else
      black_engine.startThinking();
  });
}

// --- main ----
httpServer.listen(port, hostname, () => {
  console.log(`Starting httpServer, listening at http://${hostname}:${port}.`);
});

let queue = [];	    // sockets waiting for opponents

io.on('connection', (socket) => {
  // socket is a reference for the current client
  console.log(`User ${socket.id} connected.`);

  // only join queue when socket is ready for match
  // (i.e. when client-side defined what to do when match is received)
  socket.on('readyForMatch', (gameMode) => { 
    if (gameMode==="computer")
    {
      if (engineTesting)
	engineVsEngine(socket);
      else
	engineMatch(socket);
    }
    else
      joinQueue(socket); 
  });

  socket.on('disconnect', () => {
    console.log(`User ${socket.id} disconnected.`);
  });
});



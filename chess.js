// imports
const path = require('path');
const fs = require('fs');
const httpServer = require('http').createServer(handleRequest);
const io = require('socket.io')(httpServer);

// client sounds directory
const soundDir = '/client/sounds/';

// chess positions
const positions = require('./positions.json');
const defaultPosition = positions['promotion'];

const hostname = '0.0.0.0';
const port = 8000;

// --- main ----
httpServer.listen(port, hostname, () => {
  console.log(`Starting httpServer, listening at http://${hostname}:${port}.`);
});
// -------------


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

// --- socket.io ---
let queue = [];	    // sockets waiting for opponents

function leaveQueue(socket) {
  queue = queue.filter((client) => {return client != socket});
  //console.log(`User ${socket.id} left queue.`);
}

function joinQueue(socket) {
  if (queue.length > 0) { 
    // someone is waiting in queue
    let opponent = queue.pop();  // get someone from the queue
    match(opponent, socket);  // create a match between them
  } else { 
    // no one is in queue
    queue.push(socket); // add socket to queue
    // console.log(`User ${socket.id} joined queue.`);
  }
}

function match(socket1, socket2) {
  console.log("Match between " + socket1.id + " and " + socket2.id);

  io.to(socket1.id).emit('match', 'white', defaultPosition);
  io.to(socket2.id).emit('match', 'black', defaultPosition);

  // set up the communication of moves between the two players
  socket1.on('move', (...args) => {
    console.log(`Received move from ${socket1.id} and sending to ${socket2.id}.`);
    io.to(socket2.id).emit('move', ...args);
  });
  socket2.on('move', (...args) => {
    console.log(`Received move from ${socket2.id} and sending to ${socket1.id}.`);
    io.to(socket1.id).emit('move', ...args);
  });
}

io.on('connection', (socket) => {
  // socket is a reference for the current client
  console.log(`User ${socket.id} connected.`);

  // only join queue when socket is ready for match
  // (i.e. when client-side defined what to do when match is received)
  socket.on('readyForMatch', () => { joinQueue(socket); });

  socket.on('disconnect', () => {
    leaveQueue(socket);
    console.log(`User ${socket.id} disconnected.`);
  });
});



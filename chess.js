const path = require('path');
const fs = require('fs');
const httpServer = require('http').createServer(handleRequest);
const io = require('socket.io')(httpServer);

const hostname = '192.168.2.109';
const port = 8000;

function handleRequest(req, res) {
  var pathname = req.url;
  // default to index.html
  if (pathname == '/') {
    pathname = '/index.html';
  }
  
  // find file extension
  var ext = path.extname(pathname);
  var typeExt = {
    '.html': 'text/html',
    '.js':   'text/javascript',
    '.css':  'text/css'
  };
  // default to plain text
  var contentType = typeExt[ext] || 'text/plain';

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
      res.writeHead(200,{ 'Content-Type': contentType });
      res.end(data);
    }
  );
}

httpServer.listen(port, hostname, () => {
  console.log(`Starting httpServer, listening at http://${hostname}:${port}.`);
});

// --- socket.io ---
let queue = [];	    // sockets waiting for opponents

function leaveQueue(socket) {
  queue = queue.filter((client) => {return client != socket});
  console.log(`User ${socket.id} left queue.`);
}

function joinQueue(socket) {
  if (!!queue.length) { // someone is waiting in queue, match them
    // POSSIBLE BUG: does this code execute sequentially?
    // or is there a chance that multiple new users try to connect
    // to the same user in the queue at the same time?
    let opponent = queue.pop();
    match(opponent, socket);
  } else { // no one is in queue, add socket to queue
    console.log(`User ${socket.id} joined queue.`);
    queue.push(socket);
  }
}

function match(socket1, socket2) {
  console.log("Match between " + socket1.id + " and " + socket2.id);
  let room = socket1.id + '#' + socket2.id;
  socket1.opponent = socket2;
  socket2.opponent = socket1;
  io.to(socket1.id).emit('match', 'white');
  io.to(socket2.id).emit('match', 'black');
}

io.on('connection', (socket) => {
  // socket is a reference for the current client
  console.log(`User ${socket.id} connected.`);

  joinQueue(socket);

  socket.on('move', (initial, final) => {
    console.log(`server: received move from ${socket.id} and sending to ${socket.opponent.id}`);
    socket.to(socket.opponent.id).emit('move', initial, final);
  });

  socket.on('disconnect', () => {
    leaveQueue(socket);
    console.log(`User ${socket.id} disconnected.`);
  });

  socket.onAny((event, ...args) => {
    console.log(event, args);
  });

});



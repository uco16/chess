const path = require('path');
const fs = require('fs');
const server = require('http').createServer(handleRequest);
const io = require('socket.io')(server);

const hostname = '127.0.0.1';
const port = 8080;

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

server.listen(port, hostname, () => {
  console.log('Server running at http://'+hostname+':'+port)
});

// --- socket.io ---
var queue = [];	    // sockets waiting for opponents

//function findOpponent(socket) {
//  if (queue) { // someone is waiting in queue, match them
//    // POSSIBLE BUG: does this code execute sequentially?
//    // or is there a chance that multiple new users try to connect
//    // to the same user in the queue at the same time?
//    var opponent = queue.pop();
//    var room = socket.id + '#' + opponent.id;
//    socket.join(room);
//    opponent.join(room);
//  } else { // no one is in queue, add socket to queue
//    queue.push(socket);
//  }
//}

io.on('connection', (socket) => {
  // socket is a reference for the current client
  console.log('User ' + socket.id + ' connected');

  socket.on('move', (initial, final) => {
    socket.broadcast.emit('move', initial, final);
  });

  socket.on('disconnect', () => {
    console.log('user ' + socket.id + ' disconnected');
  });

  socket.onAny((event, ...args) => {
    console.log(event, args);
  });

});



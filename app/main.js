const net = require("net");

const server = net.createServer((socket) => {
  socket.on("close", () => {
    socket.end();
    server.close();
  });

  // Extract the Path from the HTTP request
  // If "/" respond with 200 OK, else respond with 404 Not Found

    // Example of incoming HTTP request (404 Not Found)
    // GET /index.html HTTP/1.1
    // Host: localhost:4221
    // User-Agent: curl/7.64.1
    
    // Another example (200 OK)
    // GET / HTTP/1.1
    // Host: localhost:4221
    // User-Agent: curl/7.64.1

  // console.log(socket.address());

  socket.on("data", (data) => {
    const input = data.toString();
    const firstLine = input.split("\n")[0];
    const path = firstLine.split(" ")[1];

    if (path === "/") {
      socket.write("HTTP/1.1 200 OK\r\n\r\n");
    }
    else if (path.substring(0, 5) === "/echo") {
      const matchEchoRegex = /(\/echo\/)(.*)/
      const echoPath = path.match(matchEchoRegex)[2];
      socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${echoPath.length}\r\n\r\n${echoPath}\r\n`);
    } else {
      socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
    }
  })
});


server.listen(4221, "localhost");

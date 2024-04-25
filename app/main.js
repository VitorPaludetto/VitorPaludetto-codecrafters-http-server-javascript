const net = require("net");
const { Readable } = require("stream");

const server = net.createServer((socket) => {
  socket.on("close", () => {
    socket.end();
    server.close();
  });

  // Extract the Path from the HTTP request
  // If "/" respond with 200 OK, else respond with 404 Not Found

  console.log(socket.address());

  socket.on("data", (data) => {
    console.log(data);
    // Example of incoming HTTP request (404 Not Found)
    // GET /index.html HTTP/1.1
    // Host: localhost:4221
    // User-Agent: curl/7.64.1
    //
    // Another example (200 OK)
    // GET / HTTP/1.1
    // Host: localhost:4221
    // User-Agent: curl/7.64.1
    const rr = Readable.from(data);

    rr.on("data", (chunk) => {
      const data = chunk.toString();
      console.log("Data", data);
      const path = data.match(/\/.*(?= HTTP)/);
      console.log("Path", path);
      if (path[0] === '/') {
        socket.write("HTTP/1.1 200 OK\r\n\r\n");
      } else {
        socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
      }
    });
    rr.on("error", (error) => {
      console.log("Error: ", error);
    })
    rr.on("end", () => {
      console.log("Ended");
    })
})

});


server.listen(4221, "localhost");

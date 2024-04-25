const net = require("net");
const fs = require("fs");

// Get the arguments passed when executing the program
// Check if the flag --directory was passed and then
// define the directory that was passed as an argument of the flag
const args = process.argv;
let directory = undefined
args.forEach((arg, index) => {
  if (arg === "--directory" && args[index + 1].length > 0) {
    directory = args[index + 1];
  }
});

const server = net.createServer({keepAlive: true}, (socket) => {
  socket.on("close", () => {
    socket.end();
  });

  // Extract the Path from the HTTP request
  // If "/" respond with 200 OK, 
  // If starts with "/echo", respond with the rest of the path as the body
  // else respond with 404 Not Found

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
    else if (path.startsWith("/echo")) {
      const matchEchoRegex = /(\/echo\/)(.*)/
      const echoPath = path.match(matchEchoRegex)[2];
      socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${echoPath.length}\r\n\r\n${echoPath}\r\n`);
    } 
    else if (path.startsWith("/user-agent")) {
      const userAgentRegex = /(User-Agent: )(.*)/
      const userAgent = input.match(userAgentRegex)[2]
      socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${userAgent.length}\r\n\r\n${userAgent}\r\n`)
    }
    else if (firstLine.startsWith("GET /files")) {
      const matchFileNameRegex = /(\/files\/)(.*)/
      const fileName = path.match(matchFileNameRegex)[2];
      // Check if the file exists in directory, read it and write its
      // content to the body of the response
      try {
        const fileContent = fs.readFileSync(`${directory}/${fileName}`, "utf-8");
        socket.write(`HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${fileContent.length}\r\n\r\n${fileContent}\r\n`)
      } catch (err) {
        console.log(err);
        socket.write("HTTP/1.1 404 Not Found\r\nContent-Type: application/octet-stream\r\nContent-Length: 0\r\n\r\n");
      }
    }
    else if (firstLine.startsWith("POST /files")) {
      const matchFileNameRegex = /(\/files\/)(.*)/
      const fileName = path.match(matchFileNameRegex)[2];
      const fileContent = data.toString("utf-8").split("\r\n\r\n")[1];
      try {
        fs.writeFileSync(`${directory}/${fileName}`, fileContent);
        socket.write("HTTP/1.1 201 Created\r\n\r\n");
      } catch (err) {
        console.log(err);
        socket.write("HTTP/1.1 404 Not Found\r\nContent-Type: application/octet-stream\r\nContent-Length: 0\r\n\r\n");
      }
    }
    else {
      socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
    }
  })
});


server.listen(4221, "localhost");

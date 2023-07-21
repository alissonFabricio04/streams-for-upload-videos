import {
  createReadStream,
  createWriteStream,
  existsSync,
  mkdirSync,
} from "node:fs";
import path from "node:path";
import { Transform } from "node:stream";
import { createServer } from "node:http";

createServer((req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "*",
    });
    return res.end();
  }

  if (req.url === "/" && req.method === "GET") {
    try {
      res.writeHead(200, { "Content-Type": "text/html" });
      createReadStream("./src/client.html").pipe(res);
      return;
    } catch (e) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      return res.end("Internal server error");
    }
  }

  console.log()

  if (req.url.includes("/podcast") && req.method === "POST") {
    let hasUpload =
      req.url.includes(".mp3") ||
      req.url.includes(".mp4") ||
      req.url.includes(".wav");

    if (hasUpload) {
      const now = new Date();
      const filePath = `./uploads/${now.toISOString().split("T")[0]}/`;
      const dirname = path.resolve(filePath);
      let fileName = req.url.split("/podcast")[1];

      if (!existsSync(filePath)) {
        mkdirSync(dirname, { recursive: true });
      }

      req
        .pipe(
          new Transform({
            transform(chunk, enconding, callback) {
              callback(null, chunk);
            },
          })
        )
        .pipe(createWriteStream(`${filePath}/${fileName}`));

      res.writeHead(201);
      return res.end();
    }

    res.writeHead(415);
    return res.end();
  }

  res.writeHead(404);
  return res.end();
})
  .listen(3000)
  .on("listening", () => console.log("Server is runnig at PORT 3000"));
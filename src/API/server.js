import http from "node:http";
import { v4 as uuidv4 } from "uuid";

import errHandle from "./errHandle.js";
const todos = [];

const requestListener = (req, res) => {
  const pathname = new URL(req.url, `http://${req.headers.host}`).pathname;
  const normalizedPath = pathname === "/" ? pathname : pathname.replace(/\/$/, "");
  const headers = {
    "Access-Control-Allow-Headers":
      "Content-Type,Authorization,Content-Length,X-Requested-With",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,PUT,DELETE,OPTIONS",
    "Content-Type": "application/json",
  };

  let body = "";

  req.on("data", (chunk) => {
    body += chunk;
  });

  if (normalizedPath === "/" && req.method === "GET") {
    res.writeHead(200, headers);
    res.write(
      JSON.stringify({
        status: "success",
        message: "API is running. Use /todos to get todo data.",
      }),
    );
    res.end();
  } else if (normalizedPath === "/todos" && req.method === "GET") {
    res.writeHead(200, headers);
    res.write(
      JSON.stringify({
        status: "success",
        data: todos,
      }),
    );
    res.end();
  } else if (normalizedPath === "/todos" && req.method === "POST") {
    req.on("end", () => {
      try {
        const title = JSON.parse(body).title;
        if (title !== undefined) {
          const todo = {
            title: title,
            id: uuidv4(),
            completed: false,
          };
          todos.push(todo);
          res.writeHead(200, headers);
          res.write(
            JSON.stringify({
              status: "success",
              data: todos,
            }),
          );
          res.end();
        } else {
          errHandle(res);
        }
      } catch (err) {
        console.error(`發生錯誤為:${err.message}`);
        errHandle(res);
      }
    });
  } else if (normalizedPath === "/todos" && req.method === "DELETE") {
    todos.length = 0;
    res.writeHead(200, headers);
    res.write(
      JSON.stringify({
        status: "success",
        data: todos,
        delete: "all",
      }),
    );
    res.end();
  } else if (normalizedPath.startsWith("/todos/") && req.method === "DELETE") {
    const id = normalizedPath.split("/").pop();
    const index = todos.findIndex((element) => element.id === id);
    if (index !== -1) {
      todos.splice(index, 1);
      res.writeHead(200, headers);
      res.write(
        JSON.stringify({
          status: "success",
          data: todos,
          delete: id,
        }),
      );
      res.end();
    } else {
      errHandle(res);
    }
  } else if (normalizedPath.startsWith("/todos/") && req.method === "PATCH") {
    req.on("end", () => {
      try {
        const requestBody = JSON.parse(body);
        const id = normalizedPath.split("/").pop();
        const index = todos.findIndex((element) => element.id === id);

        if (index !== -1) {
          if (requestBody.title !== undefined) {
            todos[index].title = requestBody.title;
          }
          if (requestBody.completed !== undefined) {
            todos[index].completed = requestBody.completed;
          }
          res.writeHead(200, headers);
          res.write(
            JSON.stringify({
              status: "success",
              data: todos,
              update: id,
            }),
          );
        } else {
          errHandle(res);
        }

        res.end();
      } catch (err) {
        console.error(`發生錯誤為:${err.message}`);
        errHandle(res);
      }
    });
  } else if (req.method === "OPTIONS") {
    res.writeHead(200, headers);
    res.end();
  } else {
    res.writeHead(404, headers);
    res.write(
      JSON.stringify({
        status: "false",
        message: "無此網站路由!",
      }),
    );
    res.end();
  }
};

const server = http.createServer(requestListener);
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

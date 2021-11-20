import * as express from "express";
import "module-alias/register";
import * as cors from "cors";
import * as cookieParser from "cookie-parser";
import UserController from "@/modules/users/users.controller";
import UserService from "@/modules/users/users.service";
import { config } from "dotenv";
import * as csrf from "csurf";
import LobbyController from "./modules/lobbies/lobbies.controller";
import LobbyService from "./modules/lobbies/lobbies.service";

// let origin;

// if (process.env.NODE_PRODUCTION == "production") {
//   origin = "http://localhost:7999";
// } else {
//   origin = "http://localhost:3000";
// }

var corsOptions = {
  // origin: *,
  credentials: true,
  optionsSuccessStatus: 200, // For legacy browser support
};

const app = express();
config();
// var server = require("http").Server(app);
// const io = require("socket.io")(server);

const controllers = [
  new LobbyController("/lobby", new LobbyService()),
  new UserController("/user", new UserService()),
];

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));

// app.use(csrf({ cookie: true }));
// app.get("/api/", (req, res) => {
//   // Pass the Csrf Token
//   res.cookie("XSRF-TOKEN", (req as any).csrfToken());
//   res.end();
// });

controllers.forEach((controller) => {
  if (process.env.NODE_PRODUCTION == "development") {
    app.use(`/api${controller.path}`, controller.router);
  } else if (process.env.NODE_PRODUCTION == "production") {
    app.use(controller.path, controller.router);
  }
});

app.listen(3002, "0.0.0.0");
console.log("Started");

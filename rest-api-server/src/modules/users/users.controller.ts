import * as express from "express";
import UserService from "./users.service";
import { authenticateToken } from "@/middleware/users";
import * as jwt from "jsonwebtoken";

export default class UserController {
  public router = express.Router();
  constructor(public path: string, private userService: UserService) {
    this.initialiseRoutes();
  }

  private initialiseRoutes() {
    console.log(`Init: ${this.path}`);
    this.router.post("/register", async (req, res) => {
      let userRegistration = await this.userService.userRegistration(req.body);

      if (userRegistration.error == "Internal server error")
        return res.status(500).json(userRegistration);

      return res.status(200).send(userRegistration);
    });

    this.router.post("/login", async (req, res) => {
      let userLogin = await this.userService.userLogin(req.body);

      if (userLogin.error == "Internal server error")
        return res.status(500).json(userLogin);

      return res.status(200).json(userLogin);
    });

    this.router.get("/data", authenticateToken, async (req: any, res) => {
      let userData = await this.userService.userData(req.user.id);

      if (userData.error == "Internal server error")
        return res.status(500).json(userData);
      res.status(200).json(userData);
    });

    // generate new 7d token
    this.router.post("/generateToken", async (req, res) => {
      let newToken = await this.userService.generateNewToken(
        req.body.username,
        req.body.password
      );

      if (newToken.error == "Internal server error")
        return res.status(500).json(newToken);
      res.status(200).json(newToken);
    });

    this.router.get("/checkUser", async (req, res) => {
      let userID = await this.userService.checkUser(
        (req as any).query.username,
        (req as any).query.password
      );
      if (userID.error == "Internal server error")
        return res.status(500).json(userID);
      res.status(200).json(userID);
    });

    this.router.post(
      "/updateEARValues",
      authenticateToken,
      async (req, res) => {
        res.send(
          await this.userService.updateEARValues(
            req.body.earValue,
            (req as any).user.id
          )
        );
      }
    );

    this.router.get("/getEARValues", authenticateToken, async (req, res) => {
      res.send(await this.userService.getEARValues((req as any).user.id));
    });
  }
}

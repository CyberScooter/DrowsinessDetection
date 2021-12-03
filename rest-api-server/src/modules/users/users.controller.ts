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
    this.router.get("/generateToken", authenticateToken, async (req, res) => {
      let newToken = this.userService.generateToken(
        { id: (req as any).user.id },
        {
          expiresIn: "7d",
        }
      );

      if (newToken.error == "Internal server error")
        return res.status(500).json(newToken);
      res.status(200).json(newToken);
    });
  }
}

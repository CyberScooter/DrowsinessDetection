import * as express from "express";
import { authenticateToken } from "@/middleware/users";
import * as jwt from "jsonwebtoken";
import LobbyService from "./lobbies.service";

export default class LobbyController {
  public router = express.Router();
  constructor(public path: string, private lobbyService: LobbyService) {
    this.initialiseRoutes();
  }

  private initialiseRoutes() {
    console.log(`Init: ${this.path}`);

    this.router.get("/list", authenticateToken, async (req, res) => {
      res.send(await this.lobbyService.getLobbiesData((req as any).user.id));
    });

    this.router.post("/create", authenticateToken, async (req, res) => {
      res.send(
        await this.lobbyService.createLobby(
          req.body.lobbyName,
          (req as any).user.id
        )
      );
    });

    this.router.post("/delete", authenticateToken, async (req, res) => {
      res.send(
        await this.lobbyService.deleteLobby(
          req.body.lobbyID,
          (req as any).user.id
        )
      );
    });

    this.router.post("/leave", async (req, res) => {});

    this.router.post("/join", authenticateToken, async (req, res) => {
      res.send(
        await this.lobbyService.joinLobby(
          req.body.lobbyID,
          (req as any).user.id
        )
      );
    });
  }
}

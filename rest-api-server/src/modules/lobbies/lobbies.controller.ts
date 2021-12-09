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

    this.router.get("/members", authenticateToken, async (req, res) => {
      res.send(
        await this.lobbyService.getMembersList(Number(req.query.lobbyID))
      );
    });

    this.router.post("/create", authenticateToken, async (req, res) => {
      res.send(
        await this.lobbyService.createLobby(
          req.body.lobbyName,
          (req as any).user.id
        )
      );
    });

    this.router.post("/remove", authenticateToken, async (req, res) => {
      res.send(
        await this.lobbyService.removeUser(
          req.body.lobbyID,
          req.body.userID,
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

    this.router.post("/leave", authenticateToken, async (req, res) => {
      res.send(
        await this.lobbyService.leaveLobby(
          req.body.lobbyID,
          (req as any).user.id
        )
      );
    });

    this.router.post("/join", authenticateToken, async (req, res) => {
      res.send(
        await this.lobbyService.joinLobby(
          req.body.joinCode,
          (req as any).user.id
        )
      );
    });

    this.router.post(
      "/updateEARValues",
      authenticateToken,
      async (req, res) => {
        res.send(
          await this.lobbyService.updateEARValues(
            req.body.earValue,
            (req as any).user.id
          )
        );
      }
    );

    this.router.get("/getEARValues", authenticateToken, async (req, res) => {
      res.send(await this.lobbyService.getEARValues((req as any).user.id));
    });
  }
}

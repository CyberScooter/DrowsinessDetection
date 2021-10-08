import * as express from "express";
import { authenticateToken } from "@/middleware/users";
import * as jwt from "jsonwebtoken";
import LobbyService from "./lobby.service";

export default class LobbyController {
  public router = express.Router();
  constructor(public path: string, private lobbyService: LobbyService) {
    this.initialiseRoutes();
  }

  private initialiseRoutes() {
    console.log(`Init: ${this.path}`);

    this.router.get("/list", async (req, res) => {
        let lobbies = await this.lobbyService.getLobbiesData();

    })

    this.router.post("/create", async (req, res) => {

    })

    this.router.post("/delete", async (req, res) => {
        
    })

    this.router.post("/leave", async (req, res) => {

    })

    this.router.post("/join", async (req, res) => {
        
    })
}

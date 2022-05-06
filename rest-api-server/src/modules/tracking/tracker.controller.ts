import * as express from "express";
import { authenticateToken } from "@/middleware/users";
import * as jwt from "jsonwebtoken";
import TrackerService from "./tracker.service";

export default class TrackerController {
  public router = express.Router();
  constructor(public path: string, private trackerService: TrackerService) {
    this.initialiseRoutes();
  }

  private initialiseRoutes() {
    console.log(`Init: ${this.path}`);

    this.router.post("/setOccupied", authenticateToken, async (req, res) => {
      res.send(
        await this.trackerService.setLobbyDrowsinessSpotOccupied(
          (req as any).user.id,
          req.body.lobbyID
        )
      );
    });

    this.router.post("/updateLocation", authenticateToken, async (req, res) => {
      res.send(
        await this.trackerService.setTrackerLocation(
          (req as any).user.id,
          req.body.lobbyID,
          req.body.longitude,
          req.body.latitude
        )
      );
    });

    this.router.get("/checkVacant", async (req, res) => {
      res.send(
        await this.trackerService.checkVacant(Number(req.query.lobbyID))
      );
    });

    this.router.post("/setVacant", authenticateToken, async (req, res) => {
      res.send(
        await this.trackerService.setLobbyDrowsinessSpotVacant(
          (req as any).user.id,
          req.body.lobbyID
        )
      );
    });

    this.router.post("/checkDrowsy", authenticateToken, async (req, res) => {
      res.send(
        await this.trackerService.checkRealTimeDrowsy(Number(req.body.lobbyID))
      );
    });
  }
}

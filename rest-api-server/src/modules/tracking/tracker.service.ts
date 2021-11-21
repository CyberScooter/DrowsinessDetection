import * as jwt from "jsonwebtoken";
import { genSaltSync, hashSync, compare } from "bcrypt";
import { sql } from "slonik";
import getPool from "@/db";
import { v5 as uuidv5 } from "uuid";
import * as shortid from "shortid";

export default class TrackerService {
  private pool = getPool();

  public async setTrackerLocation(
    userID: number,
    lobbyID: number,
    longitude: number,
    latitude: number
  ) {
    // verify correct user wants to update
    let verify = await this.pool.maybeOne(
      sql`
            select 
                tracking.user_tracking,
                lobbies.tracking_id
            from 
                lobbies 
                inner join tracking on lobbies.tracking_id=tracking.id 
            where 
                lobbies.id=${lobbyID} and tracking.user_tracking=${userID}
        `
    );

    if (verify) {
      let updateUserLocation = await this.pool.maybeOne(
        sql`
                update tracking set longitude=${longitude}, latitude=${latitude}, updated_at=now(), alert_drowsy=true
            `
      );

      if (updateUserLocation) return { message: "Success" };
    }
  }

  public async setLobbyDrowsinessSpotVacant(userID: number, lobbyID: number) {
    let checkOccupied = await this.pool.maybeOne(
      sql`
              select 
                tracking.user_tracking,
                lobbies.tracking_id
              from 
                  lobbies 
                  inner join tracking on lobbies.tracking_id=tracking.id 
              where 
                  lobbies.id=${lobbyID}
          `
    );

    // verify correct user wants to reset
    if (checkOccupied.user_tracking == userID) {
      let updateUserTracking = await this.pool.maybeOne(
        sql`
                  update tracking set user_tracking=0 where id=${checkOccupied.tracking_id}
              `
      );

      if (updateUserTracking) return { message: "Success" };
    } else {
      return { error: "Unauthorized to reset" };
    }
  }

  public async setLobbyDrowsinessSpotOccupied(userID: number, lobbyID: number) {
    let checkEmpty = await this.pool.one(
      sql`
            select 
                tracking.user_tracking,
                lobbies.tracking_id
            from 
                lobbies 
                inner join tracking on lobbies.tracking_id=tracking.id 
            where 
                lobbies.id=${lobbyID}
        `
    );

    // verify user can occupy, not taken by someone else
    if (checkEmpty.user_tracking == 0) {
      let updateUserTracking = await this.pool.one(
        sql`
                update tracking set user_tracking=${userID} where id=${checkEmpty.tracking_id}
            `
      );

      if (updateUserTracking) return { message: "Success" };
    } else {
      return { error: "Lobby drowsiness detection is busy" };
    }
  }

  public async checkRealTimeDrowsy(lobbyID) {
    try {
      let checkDrowsy = await this.pool.one(
        sql`
              select 
                  tracking.alert_drowsy
                  lobbies.tracking_id
              from 
                  lobbies 
                  inner join tracking on lobbies.tracking_id=tracking.id 
              where 
                  lobbies.id=${lobbyID}
          `
      );

      if (checkDrowsy.alert_drowsy) {
        let result = await this.pool.one(
          sql`
                select 
                    tracking.longitude
                    tracking.latitude
                    tracking.updated_at
                from 
                    lobbies 
                    inner join tracking on lobbies.tracking_id=tracking.id 
                where 
                    lobbies.id=${lobbyID}
                `
        );

        await this.pool.one(
          sql`
                  update tracking set alert_drowsy=false where id=${checkDrowsy.tracking_id}
                `
        );

        return result;
      }

      return { message: "No alert" };
    } catch (_) {
      return { error: "Internal server error" };
    }
  }
}

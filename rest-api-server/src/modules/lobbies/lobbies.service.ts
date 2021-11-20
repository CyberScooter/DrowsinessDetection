import * as jwt from "jsonwebtoken";
import { genSaltSync, hashSync, compare } from "bcrypt";
import { sql } from "slonik";
import getPool from "@/db";
import { v5 as uuidv5 } from "uuid";
import * as shortid from "shortid";

export default class LobbyService {
  private pool = getPool();

  public async createLobby(name: string, userID: number) {
    let insertedLobby = await this.pool.any(
      sql`
        with inserted_tracking_init as (
            insert into tracking(created_at, updated_at) values (now(), now()) returning *), 
        lob as (
          insert into lobbies (tracking_id, name, user_id, unique_join_code, created_at, updated_at) 
          select id, ${name}, ${userID}, ${shortid.generate()}, now(), now()
          from inserted_tracking_init returning id
        ),
        users_lobbies as (
          insert into users_lobbies(user_id, lobby_id, created_at, updated_at)
          select ${userID}, id, now(), now()
          from lob
        )

        select * from inserted_tracking_init
      `
    );

    return insertedLobby;
  }

  public async joinLobby(lobbyID: number, userID: number) {
    let exists = await this.pool.maybeOne(
      sql`
        select id, created_at from lobbies where id=${lobbyID}
      `
    );

    if (!exists) return { error: "Lobby does not exist" };

    let insertUserToLobby = await this.pool.one(
      sql`
        insert into users_lobbies(user_id, lobby_id, created_at, updated_at) values (${userID}, ${lobbyID}, now(), now()) returning updated_at
      `
    );

    return {
      message: "Successfully added to the lobby",
      updated_at: insertUserToLobby.updated_at,
    };
  }

  public async leaveLobby(lobbyID: number, userID: number) {
    let removeFromLobby = await this.pool.one(
      sql`
        delete from user_lobbies where user_id=${userID} and lobby_id=${lobbyID}
      `
    );

    if (removeFromLobby)
      return { message: "Successfully removed from the lobby" };
  }

  public async deleteLobby(lobbyID: number, userID: number) {
    let checkBelongs = await this.pool.maybeOne(
      sql`
        select id, tracking_id from lobbies where id=${lobbyID} and user_id=${userID}
      `
    );

    if (!checkBelongs) return { error: "Lobby does not belong to you" };

    let deletedLobbyData = await this.pool.query(
      sql`
        delete from tracking where id=${checkBelongs.tracking_id} 
      `
    );

    if (deletedLobbyData) return { message: "Deleted lobby" };

    return { error: "Error deleting lobby" };
  }

  // returns name of lobbies the user is in
  // returns count of number of members in the lobby the user is in
  // returns true or false on whether lobby is free to use drowsiness detection, one vacant spot per lobby
  // returns whether user can track, if someone else is already using the drowsiness detection
  public async getLobbiesData(userID: number) {
    // return lobbies;
  }

  // checks if drowsiness detection in a given lobby is already being used by someone
  public async checkDrowsinessDetectionVacant(lobbyID: number) {
    let getUserIDTracking = await this.pool.one(sql`
      select tracking.user_tracking as id from tracking inner join lobbies on lobbies.tracking_id = tracking.id where lobbies.id=${lobbyID}
    `);

    if (getUserIDTracking.id != 0)
      return { error: "Drowsiness detection already in use for this lobby" };

    return { message: "Vacant" };
  }
}

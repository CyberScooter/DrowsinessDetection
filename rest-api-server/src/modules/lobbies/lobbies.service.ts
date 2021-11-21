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
          insert into lobbies (tracking_id, name, unique_join_code, created_at, updated_at) 
          select id, ${name}, ${shortid.generate()}, now(), now()
          from inserted_tracking_init returning id
        ),
        users_lobbies as (
          insert into lobby_members(user_id, lobby_id, owner, created_at, updated_at)
          select ${userID}, id, true, now(), now()
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
        insert into lobby_members(user_id, lobby_id, owner, created_at, updated_at) values (${userID}, ${lobbyID}, false, now(), now()) returning updated_at
      `
    );

    return {
      message: "Successfully added to the lobby",
      updated_at: insertUserToLobby.updated_at,
    };
  }

  public async leaveLobby(lobbyID: number, userID: number) {
    try {
      let res = await this.pool.query(
        sql`
          delete from lobby_members where user_id=${userID} and lobby_id=${lobbyID}
        `
      );

      if (res.rowCount == 0) {
        throw new Error();
      }

      return { message: "Sucessfully removed from lobby" };
    } catch (_) {
      return { error: "Could not remove from lobby" };
    }
  }

  public async deleteLobby(lobbyID: number, userID: number) {
    let checkBelongs = await this.pool.maybeOne(
      sql`
        select 
          tr.id as tracking_id
        from 
          lobby_members as lm
          inner join lobbies as lb on lm.lobby_id=lb.id
          inner join tracking as tr on lb.tracking_id=tr.id
        where 
          lb.id=${lobbyID} and lm.user_id=${userID} and lm.owner=true
      `
    );

    if (!checkBelongs) return { error: "Lobby does not belong to you" };

    console.log(checkBelongs);

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
  // returns whether lobby is free to use drowsiness detection, one vacant spot per lobby
  public async getLobbiesData(userID: number) {
    // return lobbies;

    let lobbyData = await this.pool.many(
      sql`
      select 
        lobby_id,
        member_count,
        lobby_name,
        lobby_owner,
        user_tracking
      from (
        select 
          lobbies.id as lobby_id,
          lobbies.name as lobby_name,
          lobby_members.owner as lobby_owner,
          tracking.user_tracking as user_tracking
        from 
          lobby_members
          inner join lobbies on lobby_members.lobby_id=lobbies.id
          inner join tracking on lobbies.tracking_id=tracking.id
        where lobby_members.user_id=${userID}
      ) lobby_tracking inner join lateral(
        -- for each lobby get member count
        select 
          count(id) as member_count
        from 
          lobby_members
        where lobby_id=lobby_tracking.lobby_id
      ) lobby_member_count ON true
    `
    );

    return lobbyData;
  }

  public async getMembersList(lobbyID: number) {
    let members = await this.pool.many(
      sql`
        select
          cast(users.id as varchar(10)),
          users.username,
          tracking.user_tracking,
          lobby_members.created_at
        from
          users
          inner join lobby_members on users.id = lobby_members.user_id
          inner join lobbies on lobby_members.lobby_id=lobbies.id
          inner join tracking on lobbies.tracking_id = tracking.id
        where
          lobby_members.lobby_id=${lobbyID}
      `
    );

    return members;
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

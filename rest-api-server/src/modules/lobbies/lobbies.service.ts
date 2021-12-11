import * as jwt from "jsonwebtoken";
import { genSaltSync, hashSync, compare } from "bcrypt";
import { sql } from "slonik";
import getPool from "@/db";
import { v5 as uuidv5 } from "uuid";
import * as shortid from "shortid";

export default class LobbyService {
  private pool = getPool();

  constructor() {
    shortid.characters(
      "0123456789abcdefghjkmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@#!"
    );
  }

  public async createLobby(name: string, userID: number) {
    let checkExists = await this.pool.maybeOne(sql`
      select 
        lobbies.id 
      from 
        lobby_members 
        inner join lobbies on lobby_members.lobby_id=lobbies.id
      where 
        lobbies.name=${name} and lobby_members.user_id=${userID} and lobby_members.owner=true 
    `);

    if (checkExists)
      return { error: "You already have a lobby created under this name" };

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

  public async joinLobby(joinCode: string, userID: number) {
    let checkLobbyExists = await this.pool.maybeOne(sql`
      select id from lobbies where unique_join_code=${joinCode}
    `);

    if (!checkLobbyExists) return { error: "Lobby join code does not exist" };

    let exists = await this.pool.maybeOne(
      sql`
        select 
          lobbies.id, lobbies.created_at 
        from 
          lobby_members 
          inner join lobbies on lobby_members.lobby_id=lobbies.id
        where 
          lobbies.unique_join_code=${joinCode} and lobby_members.user_id=${userID} and lobby_members.owner = false
      `
    );

    if (exists) return { error: "Aready in the lobby of given join code" };

    let insertUserToLobby = await this.pool.one(
      sql`
        insert into lobby_members(user_id, lobby_id, owner, created_at, updated_at) values (${userID}, ${checkLobbyExists.id}, false, now(), now()) returning updated_at
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

    let foundLobbies = await this.pool.query(
      sql`
        select 
          id 
        from 
          lobby_members
        where
          lobby_members.user_id= ${userID}
      `
    );

    if (foundLobbies.rows.length == 0) return [];

    let lobbyData = await this.pool.many(
      sql`
      select 
        lobby_id,
        member_count,
        lobby_name,
        created_at,
        join_code,
        lobby_owner,
        user_tracking
      from (
        select 
          lobbies.id as lobby_id,
          lobbies.name as lobby_name,
          lobby_members.created_at as created_at,
          lobbies.unique_join_code as join_code,
          lobby_members.owner as lobby_owner,
          tracking.user_tracking as user_tracking
        from 
          lobby_members
          inner join lobbies on lobby_members.lobby_id=lobbies.id
          inner join tracking on lobbies.tracking_id=tracking.id
        where lobby_members.user_id=${userID}
        order by created_at desc
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
          lobby_members.created_at,
          lobby_members.owner
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

  public async removeUser(
    lobbyID: number,
    userToRemove: number,
    ownerOfLobbyUser: number
  ) {
    let checkOwner = await this.pool.maybeOne(
      sql`
        select 
          id 
        from 
          lobby_members 
        where 
          lobby_id=${lobbyID} and user_id=${ownerOfLobbyUser} and owner=true
      `
    );

    if (!checkOwner)
      return {
        error: "Cannot remove user, you are not the owner of the lobby",
      };

    let removeUser = await this.pool.query(
      sql`
        delete 
        from 
          lobby_members 
        where 
          user_id=${userToRemove} and lobby_id=${lobbyID}
      `
    );

    if (removeUser) return { message: "Successfully removed user" };
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

  public async updateEARValues(earValue, userID) {
    let earValuesID = await this.pool.maybeOne(sql`
      select ear_values_id as id from users where id=${userID} 
    `);

    if (!earValuesID.id) return { error: "Cannot find" };

    await this.pool
      .query(sql`update ear_values set ear_drowsy_or_closed_eyes=${earValue} where id=${earValuesID.id}
    `);

    return { message: "Success" };
  }

  public async getEARValues(userID) {
    let values = this.pool.maybeOne(sql`
      select 
        ear_drowsy_or_closed_eyes as drowsyOrClosedEAR 
      from 
        ear_values inner join users on users.ear_values_id=ear_values.id 
      where 
        users.id=${userID}
    `);

    if (!values) return { error: "Not found" };

    return values;
  }
}

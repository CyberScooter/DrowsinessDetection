import { ReviewDTO, UserDTO } from "./entities/user.entity";
import * as jwt from "jsonwebtoken";
import { genSaltSync, hashSync, compare } from "bcrypt";
import { sql } from "slonik";
import getPool from "@/db";
import { v5 as uuidv5 } from "uuid";

export default class UserService {
  private pool = getPool();

  public async userRegistration(user: UserDTO) {
    try {
      let userFound = await this.pool.maybeOne(
        sql`
            select id from users where username=${user.username} OR email=${user.email}
        `
      );

      if (userFound)
        return {
          error: "User already registered under this email or username",
        };

      let insertedEARRow: any = await this.pool.one(
        sql`
          insert into ear_values(created_at, updated_at) values (now(), now()) returning id
        `
      );

      const salt = genSaltSync(10);
      const hash = hashSync(user.password, salt);

      let inserted = await this.pool.one(
        sql`
            insert into users(ear_values_id, username, email, hash, created_at, updated_at) values (${insertedEARRow.id}, ${user.username}, ${user.email}, ${hash}, now(), now()) returning *
            `
      );
      delete inserted.hash;
      delete inserted.ear_values_id;

      return {
        user: inserted,
        token: this.generateToken(
          { id: inserted.id },
          {
            expiresIn: "7d",
          }
        ),
      };
    } catch (e) {
      return { error: "Internal server error" };
    }
  }
  public generateToken(payload, options): any {
    return jwt.sign(payload, process.env.JWT_TOKEN_SECRET, options);
  }

  public async generateNewToken(username, password) {
    let userFound: any = await this.pool.maybeOne(
      sql` 
          select * from users where username=${username}
        `
    );
    if (userFound === null) return { error: "User does not exist" };

    const match = await compare(password, userFound.hash);
    delete userFound.hash;

    if (match) {
      return {
        token: this.generateToken({ id: userFound.id }, { expiresIn: "7d" }),
      };
    } else {
      return { error: "Unauthorized" };
    }
  }

  public async userLogin(user: UserDTO) {
    try {
      let userFound: any = await this.pool.maybeOne(
        sql` 
            select * from users where username=${user.username}
          `
      );
      if (userFound === null) return { error: "User does not exist" };

      const match = await compare(user.password, userFound.hash);
      delete userFound.hash;

      if (match) {
        return {
          user: userFound,
          token: this.generateToken({ id: userFound.id }, { expiresIn: "7d" }),
        };
      }

      return { error: "Password does not match" };
    } catch (_) {
      return { error: "Internal server error" };
    }
  }

  public async checkUser(username: string, password: string) {
    try {
      let userFound: any = await this.pool.maybeOne(
        sql` 
            select id, hash from users where username=${username}
          `
      );
      if (userFound === null) return { error: "User does not exist" };

      const match = await compare(password, userFound.hash);
      delete userFound.hash;

      if (match) {
        return {
          id: userFound.id,
        };
      } else {
        return {
          error: "Cannot find user",
        };
      }
    } catch (_) {
      return { error: "Internal server error" };
    }
  }

  public async userData(userId: number) {
    const user = (await this.pool.one(
      sql`select * from users where id = ${userId}`
    )) as any;
    delete user.hash;
    return { user, error: null };
  }
}

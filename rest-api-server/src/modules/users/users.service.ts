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
      // console.log(user)
      let userFound = await this.pool.maybeOne(
        sql`
                    select id from users where username=${user.username} OR email=${user.email}
                `
      );
      // console.log(userFound);

      if (userFound)
        return {
          error: "User already registered under this email or username",
        };

      const MY_NAMESPACE = "c9717b02-748e-418f-9dc7-aded5137a87e";

      let accessToken = uuidv5(user.username, MY_NAMESPACE);

      const salt = genSaltSync(10);
      const hash = hashSync(user.password, salt);

      let inserted = await this.pool.one(
        sql`
            insert into users(username, password, email, access_token) values (${user.username},${hash},${user.email}, ${accessToken}) returning *
            `
      );
      delete inserted.password;
      delete inserted.access_token;

      return {
        user: inserted,
        token: this.generateToken(
          { id: inserted.id },
          {
            expiresIn: "7d",
          }
        ),
      };
    } catch (_) {
      return { error: "Internal server error" };
    }
  }
  public generateToken(payload, options): any {
    return jwt.sign(payload, process.env.JWT_TOKEN_SECRET, options);
  }

  public async userLogin(user: UserDTO) {
    try {
      let userFound: any = await this.pool.maybeOne(
        sql` 
                    select * from users where username=${user.username}
                `
      );
      if (userFound === null) return { error: "User does not exist" };

      const match = await compare(user.password, userFound.password);
      delete userFound.password;
      delete userFound.access_token;

      if (match)
        return {
          user: userFound,
          token: this.generateToken({ id: userFound.id }, { expiresIn: "7d" }),
        };

      return { error: "Password does not match" };
    } catch (_) {
      return { error: "Internal server error" };
    }
  }
  // public generateToken(userId: number) {
  //   try {
  //     return {
  //       token: jwt.sign({ id: userId }, process.env.JWT_TOKEN_SECRET, {
  //         expiresIn: "7d",
  //       }),
  //     };
  //   } catch (_) {
  //     return { error: "Internal server error" };
  //   }
  // }

  // TODO maybe split to more methods
  public async userData(userId: number) {
    const user = (await this.pool.one(
      sql`select * from users where id = ${userId}`
    )) as any;
    return { user, error: null };
  }

  public async addReview(review: ReviewDTO, token: string) {
    try {
      var decodedToken: any = jwt.verify(token, process.env.JWT_TOKEN_SECRET);

      let insertedReview = await this.pool.one(
        sql`
                    insert into reviews
                        (rating, title, content, is_publisher_review, book_id, user_id, created_at, updated_at) 
                    VALUES 
                        (${review.rating}, ${review.title}, ${review.content}, ${review.is_publisher_review}, ${review.book_id}, ${decodedToken.id}, now(), now())
                    returning id
                `
      );

      let reviewId = insertedReview.id;

      await this.pool.one(
        sql`
                    insert into publisher_reviews
                        (publisher_review_id, book_publisher_id)
                    VALUES
                        (${reviewId}, ${review.book_publisher_id})

                `
      );

      return { error: "false" };
    } catch (_) {
      return { error: "Internal server error" };
    }
  }

  public async getAccessToken(userID: number) {
    let userFound = await this.pool.one(sql`
      select access_token from users where id=${userID}
    `);

    if (userFound) {
      return { accessToken: userFound.access_token };
    } else {
      return { error: "No access token found" };
    }
  }
}

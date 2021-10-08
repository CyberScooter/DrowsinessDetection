import * as jwt from "jsonwebtoken";
import { genSaltSync, hashSync, compare } from "bcrypt";
import { sql } from "slonik";
import getPool from "@/db";
import { v5 as uuidv5 } from "uuid";

export default class LobbyService {
  private pool = getPool();
}

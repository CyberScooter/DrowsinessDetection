import { createPool, DatabasePoolType } from "slonik";

let _pool: DatabasePoolType;

export default () => {
  if (!_pool) _pool = createPool(process.env.DATABASE_URL as string);
  return _pool;
};

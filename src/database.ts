import { Client } from "pg";

export const client: Client = new Client({
  user: "T-GAMER",
  password: "bancodedados",
  host: "localhost",
  database: "movies",
  port: 5432,
});

export const startDatabase = async (): Promise<void> => {
  await client.connect();
  console.log("Database connected!");
};

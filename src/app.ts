import express, { Application } from "express";
import { startDatabase } from "./database";
import {
  createMovie,
  deleteMovie,
  listAllMovies,
  updateMovie,
} from "./functions";
import { movieExists } from "./middleware";

const app: Application = express();
app.use(express.json());

app.post("/movies", createMovie);

app.get("/movies", listAllMovies);

app.patch("/movies/:id", movieExists, updateMovie);

app.delete("/movies/:id", deleteMovie);

app.listen(3000, async () => {
  await startDatabase();
  console.log("Server is running!");
});

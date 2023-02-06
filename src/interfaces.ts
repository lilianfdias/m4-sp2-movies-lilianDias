import { QueryResult } from "pg";

export interface iMovieRequest {
  name: string;
  description?: string;
  duration: number;
  price: number;
}

export interface iMovie extends iMovieRequest {
  id: number;
}

export type movieCreate = Omit<iMovie, "id">;

export type movieRequestResult = QueryResult<iMovieRequest>;

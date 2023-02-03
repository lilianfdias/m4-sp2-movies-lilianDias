import { Request, Response, NextFunction } from "express";
import { QueryConfig } from "pg";
import { client } from "./database";
import { movieRequestResult } from "./interfaces";

export const movieExists = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<Response | void> => {
  const id: number = parseInt(request.params.id as string);
  const queryString: string = `
        SELECT
            *
        FROM
            movies
        WHERE
            id = $1;
    `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };

  const queryResult: movieRequestResult = await client.query(queryConfig);

  if (!queryResult.rowCount) {
    return response.status(404).json({
      message: "Movie does not found!",
    });
  }
  return next();
};

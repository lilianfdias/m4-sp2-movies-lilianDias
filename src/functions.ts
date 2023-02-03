import { Request, Response } from "express";
import { QueryConfig } from "pg";
import format from "pg-format";
import { client } from "./database";
import { iMovieRequest, movieCreate, movieRequestResult } from "./interfaces";

export const createMovie = async (
  request: Request,
  response: Response
): Promise<Response | undefined> => {
  try {
    const movieDataRequest: iMovieRequest = request.body;

    const movieData: movieCreate = {
      ...movieDataRequest,
      description: "null",
    };

    const queryString: string = format(
      `

    INSERT INTO
        movies(%I )
    VALUES
        (%L)
    RETURNING *;
`,
      Object.keys(movieData),
      Object.values(movieData)
    );
    const queryResult: movieRequestResult = await client.query(queryString);
    const newMovie: iMovieRequest = queryResult.rows[0];
    return response.status(201).json(newMovie).end();
  } catch (error) {
    if (error instanceof Error) {
      return response.status(409).json({
        message: "Movie already exists.",
      });
    }
  }
};

export const listAllMovies = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const sort = request.query.sort as string;
  let order = request.query.order as string;
  let perPage: any =
    request.query.perPage === undefined ? 5 : request.query.perPage;

  let page: any =
    request.query.page === undefined
      ? 1
      : parseInt(request.query.page as string);

  if (isNaN(page) || page < 0) {
    page = 1;
    console.log(page, perPage);
  }

  if (isNaN(perPage) || perPage < 0 || perPage > 5) {
    perPage = 5;
    console.log(page, perPage);
  }

  if (page == 1) {
    page = 0;
  } else {
    page = (page - 1) * perPage + 1;
  }
  if (!["price", "duration"].includes(sort)) {
    return response.status(422).json({
      message: "order invalid",
    });
  }

  if (!["asc", "desc"].includes(order)) {
    order = "asc";
  }

  let query: string = `
        SELECT
            *
        FROM
            movies
        ORDER BY ${sort} ${order}
        LIMIT $1 OFFSET $2
    `;
  if (!("sort" in (request.query as object))) {
    query = `
        SELECT
            *
        FROM
            movies
        LIMIT $1 OFFSET $2
      `;
  } else if (!("order" in (request.query as object))) {
    query = `
    SELECT
        *
    FROM
        movies
    ORDER BY ${sort} ASC
    LIMIT $1 OFFSET $2
  `;
  }

  const queryConfig: QueryConfig = {
    text: query,
    values: [perPage, page],
  };

  const queryResult: movieRequestResult = await client.query(queryConfig);
  if (page > 1) {
    page = (page - 1) / perPage + 1;
  }

  const previousPage: any = {
    page: page - 1 < 1 ? 1 : page - 1,
    perPage: perPage,
    sort: sort,
    order: order,
  };

  const nextPage: any = {
    page: page + 1,
    perPage: perPage,
    sort: sort,
    order: order,
  };
  const prev = new URLSearchParams(previousPage);
  const next = new URLSearchParams(nextPage);

  return response.status(200).json({
    data: queryResult.rows,
    previousPage:
      page - 1 < 1
        ? null
        : "http://" + (request.hostname as string) + ":3000/movies?" + prev,
    nextPage:
      queryResult.rowCount < perPage
        ? null
        : "http://" + (request.hostname as string) + ":3000/movies?" + next,
    count: queryResult.rowCount,
  });
};

export const deleteMovie = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const id: number = parseInt(request.params.id as string);
  console.log(id, request.params.id);

  const queryString: string = `
    
    DELETE FROM
        movies
    WHERE
        id = $1
    RETURNING *;
`;
  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };

  const queryResult: movieRequestResult = await client.query(queryConfig);

  if (!queryResult.rowCount) {
    return response.status(404).json({
      message: "Movie not found!",
    });
  }

  return response.status(204).end();
};

export const updateMovie = async (
  request: Request,
  response: Response
): Promise<Response | undefined> => {
  if (request.body.id) {
    return response.status(400).json({
      message: "Erro updating id",
    });
  }
  try {
    const id: number = parseInt(request.params.id as string);
    const movieData = Object.values(request.body);
    const movieKeys = Object.keys(request.body);

    const queryString: string = format(
      `
      UPDATE
          movies
      SET (%I) = ROW(%L)
      WHERE
        id = $1
      RETURNING * ;
    `,
      movieKeys,
      movieData
    );

    const queryConfig: QueryConfig = {
      text: queryString,
      values: [id],
    };

    const queryResult: movieRequestResult = await client.query(queryConfig);

    return response.status(200).json(queryResult.rows[0]);
  } catch (error) {
    if (error instanceof Error) {
      return response.status(409).json({
        message: "Movie already exists.",
      });
    }
  }
};

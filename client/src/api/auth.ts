import {
  BaseQueryFn,
  createApi,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { ReduxState } from "store";

interface AuthAPIUser {
  id: string;
  username: string;
  image_url: string | null;
  createdDate: string;
  stats: {
    rolls: number;
    doubles: number;
    games: number;
    wins: number;
  };
}

interface RefreshTokenResponse {
  access_token: string;
}

const dynamicBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const baseUrl = (api.getState() as ReduxState).settings.authServiceOrigin;
  const rawBaseQuery = fetchBaseQuery({ baseUrl });
  return rawBaseQuery(args, api, extraOptions);
};

// Define a service using a base URL and expected endpoints
export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: dynamicBaseQuery,
  endpoints: (builder) => ({
    getRefreshToken: builder.query<RefreshTokenResponse, void>({
      query: () => ({
        url: "refresh_token",
        mode: "cors",
        credentials: "include",
      }),
    }),
    getSelfUserData: builder.query<AuthAPIUser, void>({
      query: () => ({ url: "me", mode: "cors", credentials: "include" }),
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetRefreshTokenQuery, useGetSelfUserDataQuery } = authApi;

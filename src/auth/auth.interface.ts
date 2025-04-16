export interface UserPayload {
  userId?: string;
  sub?: string;
  providerAccountId?: string | null; // The Cognito user ID
  email: string; // User's email address
  name?: string | null; // User's name
  role: any; // User's role
  accessToken?: string; // Access token used for making API requests
  refreshToken?: string;
  image?: string;
  provider?: string;
  username?: string; // Cognito Username
  client_id?: string; // Audience claim (should match the client ID)
  groups?: any; // List of group names the user is part of
}

export interface UserCreateInput {
  email: string;
  name: string;
  password: {
    create: {
      hash: string;
    };
  };
}

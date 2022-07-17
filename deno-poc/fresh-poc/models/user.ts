type LoginProvider = "google" | "github";

export type LoginUser = {
  provider: LoginProvider;
  id: string;
  name: string;
  avatarUrl: string;
  email: string;
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
};

export type ValidatedToken = {
  isValid: boolean;
  expire?: number;
};

export type NewUser = {
  username: string;
  password: string;
  email: string;
};

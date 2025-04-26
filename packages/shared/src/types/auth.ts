export interface SignupRequestDTO {
  email: string;
  inviteCode?: string;
}

export interface SignupCallbackDTO {
  token: string;
  inviteCode?: string;
}

export interface AuthResponseDTO {
  token: string;
  user: {
    id: string;
    email: string;
    handle: string;
  };
}

export interface JWTPayload {
  sub: string; // userId
  email: string;
  handle: string;
  iat?: number;
  exp?: number;
} 
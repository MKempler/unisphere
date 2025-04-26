export interface SignupRequestDTO {
  email: string;
  inviteCode?: string;
  captchaToken?: string;
}

export interface SignupCallbackDTO {
  token: string;
  inviteCode?: string;
}

export interface AuthResponseDTO {
  token: string;
  user: {
    id: string;
    handle: string;
    email: string;
  };
}

export interface JWTPayload {
  sub: string; // userId
  email: string;
  handle: string;
  iat?: number;
  exp?: number;
} 
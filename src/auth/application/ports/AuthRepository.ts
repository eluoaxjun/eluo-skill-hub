export const AUTH_ERROR_USER_ALREADY_EXISTS = "USER_ALREADY_EXISTS";

export interface AuthResult {
  success: boolean;
  error?: string;
  code?: string;
  statusCode?: number;
}

export interface AuthRepository {
  signUp(email: string, password: string): Promise<AuthResult>;
  signIn(email: string, password: string): Promise<AuthResult>;
  signOut(): Promise<AuthResult>;
  verifyOtp(email: string, token: string): Promise<AuthResult>;
  resendOtp(email: string): Promise<AuthResult>;
}

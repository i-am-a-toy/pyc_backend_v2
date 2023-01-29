export const AuthServiceKey = 'AuthServiceKey';

export interface IAuthService {
  isValidated(accessToken: string): boolean;
  login(name: string, password: string): Promise<string[]>;
  logout(accessToken: string): Promise<void>;
  refresh(accessToken: string, refreshToken: string): Promise<string[]>;
  changePassword(id: number, prevPassword: string, newPassword: string): Promise<void>;
}

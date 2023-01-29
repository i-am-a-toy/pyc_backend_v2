export interface JWTModuleOptions {
  readonly secret?: string;
  readonly issuer?: string;
  readonly expiredAt?: string;
}

export class AccessTokenClaim {
  readonly id: string;
  readonly userId: number;
  readonly name: string;
  readonly role: string;
  readonly exp: number;
  readonly iss: string;
  readonly iat: number;
}

export class TokenPayload {
  readonly id: string;
  readonly userId: number;
  readonly name: string;
  readonly role: string;

  constructor(id: string, userId: number, name: string, role: string) {
    this.id = id;
    this.userId = userId;
    this.name = name;
    this.role = role;
  }

  toPlain(): { id: string; userId: number; name: string; role: string } {
    return {
      id: this.id,
      userId: this.userId,
      name: this.name,
      role: this.role,
    };
  }
}

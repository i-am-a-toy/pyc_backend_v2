export class LastModifierDTO {
  readonly id: number;
  readonly name: string;
  readonly role: string;

  constructor(id: number, name: string, role: string) {
    this.id = id;
    this.name = name;
    this.role = role;
  }
}

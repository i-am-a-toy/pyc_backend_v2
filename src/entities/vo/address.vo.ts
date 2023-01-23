import { Column } from 'typeorm';

export class AddressVO {
  @Column({ type: 'varchar', nullable: true })
  zipCode: string | null;

  @Column({ type: 'varchar', nullable: true })
  address: string;

  constructor(zipCode: string, address: string) {
    this.zipCode = zipCode;
    this.address = address;
  }
}

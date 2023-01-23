import { MigrationInterface, QueryRunner } from 'typeorm';

export class createUsersTable1674463499644 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // SEQUENCE
    await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS users_id_seq;`);
    await queryRunner.query(`COMMENT ON SEQUENCE users_id_seq IS 'SEQUENCE users 테이블의 ID 시퀀스';`);

    // TABLE
    await queryRunner.query(`
    CREATE TABLE IF NOT EXISTS users (
      id                  BIGINT                  NOT NULL        DEFAULT nextval('users_id_seq') PRIMARY KEY,
      cell_id             BIGINT                  NULL,
      name                VARCHAR(20)             NOT NULL        UNIQUE,
      password            VARCHAR                 NULL,
      role                VARCHAR(30)             NOT NULL,
      rank                VARCHAR(30)             NOT NULL,
      gender              VARCHAR(30)             NOT NULL,
      age                 INTEGER                 NULL,
      birth               TIMESTAMPTZ             NULL,
      contact             VARCHAR                 NULL,
      zip_code            VARCHAR(10)             NULL,
      address             VARCHAR                 NULL,
      is_long_absence     BOOLEAN                 NOT NULL,
      created_at          TIMESTAMPTZ             NOT NULL        DEFAULT now(),
      last_modified_at    TIMESTAMPTZ             NOT NULL        DEFAULT now(),
      deleted_at          TIMESTAMPTZ             NULL            DEFAULT NULL
    );`);
    await queryRunner.query(`COMMENT ON TABLE users IS 'TABLE 유저의 정보를 관리하는 테이블';`);

    // COLUMN COMMENT
    await queryRunner.query(`COMMENT ON COLUMN users.id IS 'COLUMN 테이블의 PK';`);
    await queryRunner.query(`COMMENT ON COLUMN users.cell_id IS 'COLUMN 유저가 속한 Cell ID';`);
    await queryRunner.query(`COMMENT ON COLUMN users.name IS 'COLUMN 이름';`);
    await queryRunner.query(`COMMENT ON COLUMN users.password IS 'COLUMN 비밀번호';`);
    await queryRunner.query(`COMMENT ON COLUMN users.role IS 'COLUMN 사용자 권한';`);
    await queryRunner.query(`COMMENT ON COLUMN users.rank IS 'COLUMN 세례 여부 [INCOMING, INFANT_BAPTISM, ADMISSION, NONE]';`);
    await queryRunner.query(`COMMENT ON COLUMN users.gender IS 'COLUMN 성별 [MALE, FEMALE, NONE]';`);
    await queryRunner.query(`COMMENT ON COLUMN users.age IS 'COLUMN 나이';`);
    await queryRunner.query(`COMMENT ON COLUMN users.birth IS 'COLUMN 생일';`);
    await queryRunner.query(`COMMENT ON COLUMN users.contact IS 'COLUMN 연락처';`);
    await queryRunner.query(`COMMENT ON COLUMN users.zip_code IS 'COLUMN 우편 번호';`);
    await queryRunner.query(`COMMENT ON COLUMN users.address IS 'COLUMN 상세 주소';`);
    await queryRunner.query(`COMMENT ON COLUMN users.is_long_absence IS 'COLUMN 장기 결석 여부';`);
    await queryRunner.query(`COMMENT ON COLUMN users.created_at IS 'COLUMN 생성일';`);
    await queryRunner.query(`COMMENT ON COLUMN users.last_modified_at IS 'COLUMN 수정일';`);
    await queryRunner.query(`COMMENT ON COLUMN users.deleted_at IS 'COLUMN 삭제일';`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS users;`);
    await queryRunner.query(`DROP SEQUENCE IF EXISTS users_id_seq;`);
  }
}

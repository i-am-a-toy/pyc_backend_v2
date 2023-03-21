import { MigrationInterface, QueryRunner } from 'typeorm';

export class createGroupTable1679385421354 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS groups_id_seq;`);
    await queryRunner.query(`COMMENT ON SEQUENCE groups_id_seq IS 'SEQUENCE groups PK 시퀀스';`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS groups (
        id                      BIGINT          NOT NULL        DEFAULT     nextval('groups_id_seq')        PRIMARY KEY,
        leader_id               BIGINT          NOT NULL        REFERENCES  users(id),
        "name"                  VARCHAR         NOT NULL,
        created_by              BIGINT          NOT NULL,
        created_at              TIMESTAMPTZ     NOT NULL        DEFAULT now(),
        last_modified_by        BIGINT          NOT NULL,
        last_modified_at        TIMESTAMPTZ     NOT NULL        DEFAULT now()
    );`);
    await queryRunner.query(`COMMENT ON TABLE groups IS 'TABLE 그룹에 대한 데이터를 관리하는 테이블';`);

    await queryRunner.query(`COMMENT ON COLUMN groups.id  IS 'COLUMN 테이블 PK';`);
    await queryRunner.query(`COMMENT ON COLUMN groups.leader_id  IS 'COLUMN 그룹 리더 ID';`);
    await queryRunner.query(`COMMENT ON COLUMN groups."name" IS 'COLUMN 그룹 명';`);
    await queryRunner.query(`COMMENT ON COLUMN groups.created_by  IS 'COLUMN 생성자';`);
    await queryRunner.query(`COMMENT ON COLUMN groups.created_at  IS 'COLUMN 생성일';`);
    await queryRunner.query(`COMMENT ON COLUMN groups.last_modified_by  IS 'COLUMN 수정자';`);
    await queryRunner.query(`COMMENT ON COLUMN groups.last_modified_at  IS 'COLUMN 수정일';`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS groups CASCADE;`);
    await queryRunner.query(`DROP SEQUENCE IF EXISTS groups_id_seq;`);
  }
}

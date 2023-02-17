import { MigrationInterface, QueryRunner } from 'typeorm';

export class createNoticesTable1676434065897 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // SEQUENCE
    await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS notices_id_seq;`);
    await queryRunner.query(`COMMENT ON SEQUENCE notices_id_seq IS 'SEQUENCE notices 테이블 PK 시퀀스';`);

    // TABLE
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS notices (
      id                  BIGINT      NOT NULL    DEFAULT nextval('notices_id_seq') PRIMARY KEY,
      title               VARCHAR     NOT NULL,
      content             TEXT        NOT NULL,
  
      -- creator
      creator_id          BIGINT      NOT NULL,
      creator_name        VARCHAR(10)   NOT NULL,
      creator_role        VARCHAR(30)   NOT NULL,
  
      -- lastModifier
      last_modifier_id    BIGINT      NOT NULL,
      last_modifier_name  VARCHAR(10) NOT NULL,
      last_modifier_role  VARCHAR(30) NOT NULL,
  
      -- data timestamp
      created_at          TIMESTAMPTZ NOT NULL    DEFAULT now(),
      last_modified_at    TIMESTAMPTZ NOT NULL    DEFAULT now()
    );`);
    await queryRunner.query(`COMMENT ON TABLE notices IS 'TABLE 공지사항에 대한 데이터를 관리하는 테이블';`);

    await queryRunner.query(`COMMENT ON COLUMN notices.id IS 'COLUMN 테이블 PK';`);
    await queryRunner.query(`COMMENT ON COLUMN notices.title IS 'COLUMN 공지사항 제목';`);
    await queryRunner.query(`COMMENT ON COLUMN notices.content IS 'COLUMN 공지사항 본문';`);
    await queryRunner.query(`COMMENT ON COLUMN notices.creator_id IS 'COLUMN 작성자 ID';`);
    await queryRunner.query(`COMMENT ON COLUMN notices.creator_name IS 'COLUMN 작성자 이름';`);
    await queryRunner.query(`COMMENT ON COLUMN notices.creator_role IS 'COLUMN 작성자 권한';`);
    await queryRunner.query(`COMMENT ON COLUMN notices.last_modifier_id IS 'COLUMN 수정자 ID';`);
    await queryRunner.query(`COMMENT ON COLUMN notices.last_modifier_name IS 'COLUMN 수정자 이름';`);
    await queryRunner.query(`COMMENT ON COLUMN notices.last_modifier_role IS 'COLUMN 수정자 권한';`);
    await queryRunner.query(`COMMENT ON COLUMN notices.created_at IS 'COLUMN 생성일';`);
    await queryRunner.query(`COMMENT ON COLUMN notices.last_modified_at IS 'COLUMN 수정일';`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS notices CASCADE;`);
    await queryRunner.query(`DROP SEQUENCE IF EXISTS notices_id_seq;`);
  }
}

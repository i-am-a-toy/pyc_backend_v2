import { MigrationInterface, QueryRunner } from 'typeorm';

export class createCalendarTable1676638696166 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // SEQUENCE
    await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS calendars_id_seq;`);
    await queryRunner.query(`COMMENT ON SEQUENCE calendars_id_seq IS 'COMMENT SEQUENCE calendars 테이블 PK 시퀀스';`);

    // TABLE
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS calendars (
        id          BIGINT          NOT NULL    DEFAULT nextval('calendars_id_seq') PRIMARY KEY,

        -- calendar
        "start"     TIMESTAMPTZ     NOT NULL,
        "end"       TIMESTAMPTZ     NOT NULL,
        is_all_day  BOOLEAN         NOT NULL    DEFAULT true,
        title       VARCHAR         NOT NULL,
        content     VARCHAR         NOT NULL,

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
    await queryRunner.query(`COMMENT ON TABLE calendars IS 'TABLE 공지사항에 대한 데이터를 관리하는 테이블';`);

    await queryRunner.query(`COMMENT ON COLUMN calendars.id IS 'COLUMN 테이블 PK';`);
    await queryRunner.query(`COMMENT ON COLUMN calendars."start" IS 'COLUMN 일정 시작일';`);
    await queryRunner.query(`COMMENT ON COLUMN calendars."end" IS 'COLUMN 일정 종료일';`);
    await queryRunner.query(`COMMENT ON COLUMN calendars.is_all_day IS 'COLUMN 하루종일 여부';`);
    await queryRunner.query(`COMMENT ON COLUMN calendars.title IS 'COLUMN 공지사항 제목';`);
    await queryRunner.query(`COMMENT ON COLUMN calendars.content IS 'COLUMN 공지사항 본문';`);
    await queryRunner.query(`COMMENT ON COLUMN calendars.creator_id IS 'COLUMN 작성자 ID';`);
    await queryRunner.query(`COMMENT ON COLUMN calendars.creator_name IS 'COLUMN 작성자 이름';`);
    await queryRunner.query(`COMMENT ON COLUMN calendars.creator_role IS 'COLUMN 작성자 권한';`);
    await queryRunner.query(`COMMENT ON COLUMN calendars.last_modifier_id IS 'COLUMN 수정자 ID';`);
    await queryRunner.query(`COMMENT ON COLUMN calendars.last_modifier_name IS 'COLUMN 수정자 이름';`);
    await queryRunner.query(`COMMENT ON COLUMN calendars.last_modifier_role IS 'COLUMN 수정자 권한';`);
    await queryRunner.query(`COMMENT ON COLUMN calendars.created_at IS 'COLUMN 생성일';`);
    await queryRunner.query(`COMMENT ON COLUMN calendars.last_modified_at IS 'COLUMN 수정일';`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS calendars CASCADE;`);
    await queryRunner.query(`DROP SEQUENCE IF EXISTS calendars_id_seq;`);
  }
}

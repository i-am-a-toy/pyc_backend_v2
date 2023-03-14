import { MigrationInterface, QueryRunner } from 'typeorm';

export class createNoticeCommentsTable1676442844964 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // SEQUENCE
    await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS notice_comments_id_seq;`);
    await queryRunner.query(`COMMENT ON SEQUENCE notice_comments_id_seq IS 'SEQUENCE notice_comments 테이블 PK 시퀀스';`);

    // TABLE
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS notice_comments (
        id                  BIGINT      NOT NULL    DEFAULT nextval('notice_comments_id_seq') PRIMARY KEY,
        notice_id           BIGINT      NOT NULL    REFERENCES notices(id) ON DELETE CASCADE,
        content             VARCHAR     NOT NULL,
    
        -- creator
        creator_id          BIGINT      NOT NULL,
        creator_name        VARCHAR(10) NOT NULL,
        creator_role        VARCHAR(30) NOT NULL,
    
        -- lastModifier
        last_modifier_id    BIGINT      NOT NULL,
        last_modifier_name  VARCHAR(10) NOT NULL,
        last_modifier_role  VARCHAR(30) NOT NULL,
    
        -- data timestamp
        created_at          TIMESTAMPTZ NOT NULL    DEFAULT now(),
        last_modified_at    TIMESTAMPTZ NOT NULL    DEFAULT now()
    );`);
    await queryRunner.query(`COMMENT ON TABLE notice_comments IS 'TABLE 공지사항에 댓글에 대한 데이터를 관리하는 테이블';`);

    await queryRunner.query(`COMMENT ON COLUMN notice_comments.id IS 'COLUMN 테이블 PK';`);
    await queryRunner.query(`COMMENT ON COLUMN notice_comments.content IS 'COLUMN 댓글 본문';`);
    await queryRunner.query(`COMMENT ON COLUMN notice_comments.creator_id IS 'COLUMN 작성자 ID';`);
    await queryRunner.query(`COMMENT ON COLUMN notice_comments.creator_name IS 'COLUMN 작성자 이름';`);
    await queryRunner.query(`COMMENT ON COLUMN notice_comments.creator_role IS 'COLUMN 작성자 권한';`);
    await queryRunner.query(`COMMENT ON COLUMN notice_comments.last_modifier_id IS 'COLUMN 수정자 ID';`);
    await queryRunner.query(`COMMENT ON COLUMN notice_comments.last_modifier_name IS 'COLUMN 수정자 이름';`);
    await queryRunner.query(`COMMENT ON COLUMN notice_comments.last_modifier_role IS 'COLUMN 수정자 권한';`);
    await queryRunner.query(`COMMENT ON COLUMN notice_comments.created_at IS 'COLUMN 생성일';`);
    await queryRunner.query(`COMMENT ON COLUMN notice_comments.last_modified_at IS 'COLUMN 수정일';`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS notice_comments CASCADE;`);
    await queryRunner.query(`DROP SEQUENCE IF EXISTS notice_comments_id_seq;`);
  }
}

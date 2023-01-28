import { MigrationInterface, QueryRunner } from 'typeorm';

export class createRefreshTokensTable1674649783410 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // SEQUENCE
    await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS refresh_tokens_id_seq;`);
    await queryRunner.query(`COMMENT ON SEQUENCE refresh_tokens_id_seq IS 'SEQUENCE refresh_tokens 테이블 ID PK';`);

    // TABLE
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS refresh_tokens(
        id                  BIGINT        NOT NULL    DEFAULT nextval('refresh_tokens_id_seq') PRIMARY KEY,
        user_id             BIGINT        NOT NULL     REFERENCES users("id"),
        access_token_id     VARCHAR       NOT NULL,
        token               VARCHAR       NOT NULL,
        expired_at          TIMESTAMPTZ   NOT NULL,
        created_by          BIGINT        NOT NULL,
        created_at          TIMESTAMPTZ   NOT NULL    DEFAULT now(),
        last_modified_by    BIGINT        NOT NULL,
        last_modified_at    TIMESTAMPTZ   NOT NULL    DEFAULT now()
    );`);
    await queryRunner.query(`COMMENT ON TABLE refresh_tokens IS 'TABLE refresh Token을 저장하고 관리하는 테이블';`);

    // COLUMN COMMENT
    await queryRunner.query(`COMMENT ON COLUMN refresh_tokens.id IS 'COLUMN 테이블의 PK';`);
    await queryRunner.query(`COMMENT ON COLUMN refresh_tokens.user_id IS 'COLUMN RefreshToken을 소유한 User ID';`);
    await queryRunner.query(`COMMENT ON COLUMN refresh_tokens.access_token_id IS 'COLUMN AccessToken의 ID';`);
    await queryRunner.query(`COMMENT ON COLUMN refresh_tokens.token IS 'COLUMN Refresh Token';`);
    await queryRunner.query(`COMMENT ON COLUMN refresh_tokens.expired_at IS 'COLUMN 토큰 만료 시간';`);
    await queryRunner.query(`COMMENT ON COLUMN refresh_tokens.created_by IS 'COLUMN 생성자';`);
    await queryRunner.query(`COMMENT ON COLUMN refresh_tokens.created_at IS 'COLUMN 생성일';`);
    await queryRunner.query(`COMMENT ON COLUMN refresh_tokens.last_modified_by IS 'COLUMN 수정자';`);
    await queryRunner.query(`COMMENT ON COLUMN refresh_tokens.last_modified_at IS 'COLUMN 수정일';`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS refresh_tokens;`);
    await queryRunner.query(`DROP SEQUENCE IF EXISTS refresh_tokens_id_seq;`);
  }
}

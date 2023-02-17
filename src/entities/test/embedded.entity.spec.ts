import { Column, DataSource, Entity, PrimaryGeneratedColumn } from 'typeorm';

class TestVO {
  @Column({ type: 'integer', name: 'test_id' })
  id: number;

  constructor(id: number) {
    this.id = id;
  }
}

@Entity({ name: 'foobar' })
class FooBar {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id: number;

  @Column(() => TestVO, { prefix: false })
  test: TestVO;

  constructor(vo: TestVO) {
    this.test = vo;
  }
}

describe('Embedded Entity Prefix Test', () => {
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = await new DataSource({
      type: 'sqlite',
      database: ':memory:',
      synchronize: false,
      entities: [FooBar],
    }).initialize();

    await dataSource.manager.query(`
        CREATE TABLE IF NOT EXISTS foobar (
            id          INTEGER     PRIMARY KEY     AUTOINCREMENT,
            test_id     BIGINT      NOT NULL
        );`);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('Should be defined', () => {
    //given
    //when
    //then
    expect(dataSource).toBeDefined();
  });

  it('SaveTest', async () => {
    //given
    //when
    //then
    await expect(dataSource.manager.save(FooBar, new FooBar(new TestVO(1)))).resolves.not.toThrowError();
  });
});

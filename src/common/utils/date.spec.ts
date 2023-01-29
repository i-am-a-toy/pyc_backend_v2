import { addWeek } from './date';

describe('addWeek Test', () => {
  it('2주 더하기', () => {
    //given
    const target = new Date('2023-01-01');
    const weeks = 2;

    //when
    const updated = addWeek(target, weeks);

    //then
    expect(updated.getDate()).toBe(15);
  });

  it('2주 더하기 - 월이 넘어가는 경우', () => {
    //given
    const target = new Date('2023-01-26');
    const weeks = 2;

    //when
    const updated = addWeek(target, weeks);

    //then
    expect(updated.getMonth() + 1).toBe(2);
    expect(updated.getDate()).toBe(9);
  });

  it('0주 더하기', () => {
    //given
    const target = new Date('2023-01-26');
    const weeks = 0;

    //when
    const updated = addWeek(target, weeks);

    //then
    expect(updated.getMonth() + 1).toBe(1);
    expect(updated.getDate()).toBe(26);
  });
});

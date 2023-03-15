import {
  addWeek,
  getMonthFirstDay,
  getMonthLastDay,
  getMonthString,
  getPrevMonthLastDay,
  getYearFirstDay,
  getYearLastDay,
  getYearString,
} from './date';

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

describe('Custom Date Function', () => {
  it('getYearString Test', () => {
    //given
    const date = new Date('2022-11-03');

    //when
    const result = getYearString(date);

    //then
    expect(result).toBe('2022');
  });

  it('getMonthString Test', () => {
    //given
    const date = new Date('2022-11-03');

    //when
    const result = getMonthString(date.getMonth());

    //then
    expect(result).toBe('11');
  });

  it('getMonthFirstDay Test', () => {
    //given
    const date = new Date('2022-11-03');

    //when
    const result = getMonthFirstDay(date);

    //then
    expect(result).toEqual(new Date('2022-11-01'));
  });

  it('getMonthLastDay Test', () => {
    //given
    const date = new Date('2022-11-03');

    //when
    const result = getMonthLastDay(date);

    //then
    expect(result).toEqual(new Date('2022-11-30'));
  });

  it('getYearFirstDay Test', () => {
    //give
    const date = new Date('2022-11-03');

    //when
    const result = getYearFirstDay(date);

    //then
    expect(result).toEqual(new Date('2022-01-01'));
  });

  it('getYearLastDay Test', () => {
    //give
    const date = new Date('2022-11-03');

    //when
    const result = getYearLastDay(date);

    //then
    expect(result).toEqual(new Date('2022-12-31'));
  });

  it('get Prev Month Last Day', () => {
    //given
    const date = new Date('2022-12-01');
    const copyDate = new Date(date);

    //when
    copyDate.setHours(-1);

    //then
    expect(`${copyDate.getFullYear()}-${getMonthString(copyDate.getMonth())}-${copyDate.getDate()}`).toBe('2022-11-30');
  });

  it('getPrevMonthLastDay', () => {
    //given
    const date = new Date('2022-12-01');

    //when
    const prevLastMonthLastDay = getPrevMonthLastDay(date);

    //then
    expect(prevLastMonthLastDay).toStrictEqual(new Date('2022-11-30'));
  });
});

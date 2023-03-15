export const addWeek = (date: Date, weeks: number): Date => {
  date.setDate(date.getDate() + 7 * weeks);
  return date;
};

/**
 * getJsMonth
 *
 * @description JS에서 Date.getMonth()를 하게 되면 해당 (월 - 1)을 해주게 된다.
 * FE에서 받는 Month를 getMonth()와 동일하게 parsing
 * @param month{@link month}
 * @returns month - 1
 */
export const getJsMonth = (month: number): number => {
  return month === 1 ? 0 : month - 1;
};

/**
 * getMonthString
 *
 * @description JsMonth를 parsing하여 month를 String으로 반환하는 method
 * @param month {@link month} JsMonth로 (월 - 1)이 들어오게 된다.
 * @returns 1월 "01" , 2~9월 "0${month + 1}", 10월부터 11월 "${month +1}"
 */
export const getMonthString = (month: number): string => {
  if (month === 0) {
    return '01';
  } else if (10 > month) {
    return `0${month + 1}`;
  } else {
    return `${month + 1}`;
  }
};

export const getYearString = (date: Date): string => {
  return date.getFullYear().toString();
};

export const getMonthFirstDay = (date: Date): Date => {
  const year = getYearString(date);
  const month = getMonthString(date.getMonth());
  return new Date(`${year}-${month}-01`);
};

export const getMonthLastDay = (date: Date): Date => {
  const year = getYearString(date);
  const month = getMonthString(date.getMonth());
  return new Date(`${year}-${month}-${new Date(+year, +month, 0).getDate()}`);
};

/**
 * getPrevMonthLastDay
 *
 * @description 월의 첫번째 일 00시의 Date를 받아 이전 달 마지말 날을 구하는 method
 * @param date {@link date} 월의 처음 날 00시 ex: 2022-12-01T00:00:00.000Z
 * @returns 이전 달 마지막 날
 */
export const getPrevMonthLastDay = (date: Date): Date => {
  const copyDate = new Date(date);
  copyDate.setHours(-1);
  return new Date(`${copyDate.getFullYear()}-${getMonthString(copyDate.getMonth())}-${copyDate.getDate()}`);
};

export const getYearFirstDay = (date: Date): Date => {
  return new Date(`${date.getFullYear().toString()}-01-01`);
};

export const getYearLastDay = (date: Date): Date => {
  return new Date(`${date.getFullYear().toString()}-12-31`);
};

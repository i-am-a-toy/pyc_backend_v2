export const addWeek = (date: Date, weeks: number): Date => {
  date.setDate(date.getDate() + 7 * weeks);
  return date;
};

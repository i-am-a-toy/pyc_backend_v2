export abstract class BaseListResponse<T> {
  constructor(readonly rows: T[], readonly count: number) {}
}

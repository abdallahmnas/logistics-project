import { FindOptions, WhereOptions, Order } from 'sequelize';

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export class QueryBuilder {
  private queryParams: any;

  constructor(queryParams: any) {
    this.queryParams = queryParams;
  }

  public getLimit(): number {
    const limit = parseInt(this.queryParams.limit, 10);
    return limit > 0 ? limit : 10;
  }

  public getOffset(): number {
    const page = parseInt(this.queryParams.page, 10);
    const validPage = page > 0 ? page : 1;
    return (validPage - 1) * this.getLimit();
  }

  public getOrder(): Order {
    const sortBy = this.queryParams.sortBy || 'createdAt';
    const sortOrder = this.queryParams.sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    return [[sortBy, sortOrder]];
  }

  public getFilters(allowedFilters: string[] = []): WhereOptions {
    const where: any = {};
    for (const key of allowedFilters) {
      if (this.queryParams[key] !== undefined) {
        where[key] = this.queryParams[key];
      }
    }
    return where;
  }

  /**
   * Generates standard Sequelize FindOptions based on the query parameters.
   */
  public getFindOptions(allowedFilters: string[] = []): FindOptions {
    return {
      where: this.getFilters(allowedFilters),
      limit: this.getLimit(),
      offset: this.getOffset(),
      order: this.getOrder(),
    };
  }

  /**
   * Helper to format a paginated response.
   */
  public static formatPaginatedResult<T>(
    rows: T[],
    count: number,
    page: number,
    limit: number
  ): PaginatedResult<T> {
    const validPage = page > 0 ? page : 1;
    return {
      data: rows,
      meta: {
        total: count,
        page: validPage,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }
}

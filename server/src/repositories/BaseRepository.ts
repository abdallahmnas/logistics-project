import { Model, ModelStatic, FindOptions, CreateOptions, UpdateOptions, DestroyOptions, Transaction } from 'sequelize';
import { QueryBuilder, PaginatedResult } from '../utils/QueryBuilder';

export class BaseRepository<T extends Model> {
  protected model: ModelStatic<T>;

  constructor(model: ModelStatic<T>) {
    this.model = model;
  }

  public async findById(id: string, options?: FindOptions): Promise<T | null> {
    return this.model.findByPk(id, options);
  }

  public async findOne(options: FindOptions): Promise<T | null> {
    return this.model.findOne(options);
  }

  public async findAll(options?: FindOptions): Promise<T[]> {
    return this.model.findAll(options);
  }

  public async findPaginated(queryParams: any, allowedFilters: string[] = []): Promise<PaginatedResult<T>> {
    const qb = new QueryBuilder(queryParams);
    const options = qb.getFindOptions(allowedFilters);

    const { rows, count } = await this.model.findAndCountAll(options);

    const page = parseInt(queryParams.page, 10) || 1;
    return QueryBuilder.formatPaginatedResult(rows, count, page, qb.getLimit());
  }

  public async create(data: any, options?: CreateOptions): Promise<T> {
    return this.model.create(data, options);
  }

  public async update(data: any, options: UpdateOptions): Promise<number> {
    const [affectedCount] = await this.model.update(data, options);
    return affectedCount;
  }

  public async delete(options: DestroyOptions): Promise<number> {
    return this.model.destroy(options);
  }
}

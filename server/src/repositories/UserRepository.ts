import { BaseRepository } from './BaseRepository';
import { User } from '../models/User';
import { FindOptions } from 'sequelize';

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super(User);
  }

  public async findByEmail(email: string, options?: FindOptions): Promise<User | null> {
    return this.findOne({
      where: { email },
      ...options,
    });
  }

  public async findByPhone(phone: string, options?: FindOptions): Promise<User | null> {
    return this.findOne({
      where: { phone },
      ...options,
    });
  }
}

import { BaseRepository } from './BaseRepository';
import { Wallet } from '../models/Wallet';
import { FindOptions } from 'sequelize';

export class WalletRepository extends BaseRepository<Wallet> {
  constructor() {
    super(Wallet);
  }

  public async findByUserId(userId: string, options?: FindOptions): Promise<Wallet | null> {
    return this.findOne({
      where: { userId },
      ...options,
    });
  }
}

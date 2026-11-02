#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/162ad92a220e85d67c8e29aa8930a32a999111fa88627693839a65139d73086f/contract';
import startContract from '../../snapshots/162ad92a220e85d67c8e29aa8930a32a999111fa88627693839a65139d73086f/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/2c57aac1530b89891cc27497d7e5b73180318416725f55786cc50506102456f8/contract';
import endContract from '../../snapshots/2c57aac1530b89891cc27497d7e5b73180318416725f55786cc50506102456f8/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropConstraint({ schema: 'public', table: 'User', constraint: 'User_username_key' }),
      this.addColumn({
        schema: 'public',
        table: 'User',
        column: col('ownerId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'User',
        column: col('passwordHash', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'User',
        column: col('subdomain', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addUnique({
        schema: 'public',
        table: 'User',
        constraint: 'User_ownerId_username_key',
        columns: ['ownerId', 'username'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'User',
        constraint: 'User_subdomain_key',
        columns: ['subdomain'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'User',
        index: 'User_ownerId_idx_e2d0c1ef',
        columns: ['ownerId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'User',
        foreignKey: {
          name: 'User_ownerId_fkey',
          columns: ['ownerId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);

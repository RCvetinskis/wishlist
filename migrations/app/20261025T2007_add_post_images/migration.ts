#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/162ad92a220e85d67c8e29aa8930a32a999111fa88627693839a65139d73086f/contract';
import endContract from '../../snapshots/162ad92a220e85d67c8e29aa8930a32a999111fa88627693839a65139d73086f/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/1f5b513cf02a769e7fc2043e3873201b9a231d23012d02975c3ef9e9b4f2c72d/contract';
import startContract from '../../snapshots/1f5b513cf02a769e7fc2043e3873201b9a231d23012d02975c3ef9e9b4f2c72d/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, primaryKey, sql } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'PostImage',
        columns: [
          col('contentType', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('data', 'bytea', { notNull: true, codecRef: { codecId: 'pg/bytea@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('postId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addUnique({
        schema: 'public',
        table: 'PostImage',
        constraint: 'PostImage_postId_key',
        columns: ['postId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'PostImage',
        foreignKey: {
          name: 'PostImage_postId_fkey',
          columns: ['postId'],
          references: { schema: 'public', table: 'Post', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);

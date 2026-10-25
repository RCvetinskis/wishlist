#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/1f5b513cf02a769e7fc2043e3873201b9a231d23012d02975c3ef9e9b4f2c72d/contract';
import endContract from '../../snapshots/1f5b513cf02a769e7fc2043e3873201b9a231d23012d02975c3ef9e9b4f2c72d/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/3191aad787fd992ed042636279c30abeecca75e4708c83fbec66a16d6521b5d9/contract';
import startContract from '../../snapshots/3191aad787fd992ed042636279c30abeecca75e4708c83fbec66a16d6521b5d9/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'Post',
        column: col('imageUrl', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'Post',
        column: col('itemUrl', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);

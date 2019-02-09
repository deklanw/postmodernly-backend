import { ColumnOptions, Column } from 'typeorm';

export const RelationColumn = (options?: ColumnOptions) => {
  return Column({
    //   nullable: true,
    ...options
  });
};

// src/utils/sql.ts

// Converts a basic SELECT SQL query to a JSON structure
export const parseSqlToJson = (sql: string) => {
  const selectRegex = /SELECT (.+) FROM (\w+)(?: WHERE (.+))?/i;
  const match = sql.match(selectRegex);

  if (!match) throw new Error('Invalid SELECT SQL syntax');

  const [, columns, table, where] = match;
  return {
    type: 'select',
    table,
    columns: columns.split(',').map((col) => col.trim()),
    where: where || null,
  };
};

// Converts a basic INSERT SQL query to a JSON structure
export const parseInsertSqlToJson = (sql: string) => {
  const insertRegex = /INSERT INTO (\w+)\s*\((.+)\)\s*VALUES\s*\((.+)\)/i;
  const match = sql.match(insertRegex);

  if (!match) throw new Error('Invalid INSERT SQL syntax');

  const [, table, columns, values] = match;

  const columnList = columns.split(',').map((c) => c.trim());
  const valueList = values
    .split(',')
    .map((v) => v.trim().replace(/^'|'$/g, ''));

  const data: Record<string, string> = {};
  columnList.forEach((col, idx) => (data[col] = valueList[idx]));

  return {
    type: 'insert',
    table,
    data,
  };
};

// Converts a JSON structure to a basic INSERT SQL query
export const jsonToInsertSql = (input: {
  table: string;
  data: Record<string, string | number>;
}): string => {
  const { table, data } = input;
  const columns = Object.keys(data).join(', ');
  const values = Object.values(data)
    .map((v) => (typeof v === 'string' ? `'${v}'` : v))
    .join(', ');

  return `INSERT INTO ${table} (${columns}) VALUES (${values});`;
};

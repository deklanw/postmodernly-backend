export const uniqueElementCount = (arr: any[]) => new Set(arr).size;

// gives time in Postgres-friendly format. UTC time
export const dateTimeStamp = () => new Date().toUTCString();

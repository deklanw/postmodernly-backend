export const uniqueElementCount = (arr: any[]) => new Set(arr).size;

// gives time in Postgres-friendly format. UTC time
export const dateTimeStamp = () => new Date().toUTCString();

export const lastElement = <T>(arr: T[]) => arr[arr.length - 1];

export const MAX_POST_LENGTH = 350;

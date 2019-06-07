type RequestsPerPeriod = {
  period: number; // seconds
  requests: number;
};

type Limit = {
  limitForAnon: RequestsPerPeriod;
  limitForUser: RequestsPerPeriod;
};

export const LIMITS: Limit = {
  limitForAnon: { period: 5 * 60, requests: 5 },
  limitForUser: { period: 5 * 60, requests: 10 }
};

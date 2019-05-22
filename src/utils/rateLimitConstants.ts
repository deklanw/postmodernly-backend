type RequestsPerPeriod = {
  period: number; // seconds
  requests: number;
};

type Limit = {
  limitForAnon: RequestsPerPeriod;
  limitForUser: RequestsPerPeriod;
};

export const LIMITS: Limit = {
  limitForAnon: { period: 5 * 60, requests: 20 },
  limitForUser: { period: 2 * 60, requests: 20 }
};

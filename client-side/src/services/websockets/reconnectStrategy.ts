export type ReconnectConfig = {
  baseDelayMs: number;  // first wait (default 1000)
  maxDelayMs:  number;  // max wait (default 30000)
  maxAttempts: number;  // stop retrying after N (default Infinity)
};
const DEF: ReconnectConfig = { baseDelayMs:1000, maxDelayMs:30_000, maxAttempts:Infinity };
 
// getRetryDelay(0)→1s  (1)→2s  (2)→4s  (3)→8s  (4)→16s  (5+)→30s
export function getRetryDelay(attempt:number, cfg:Partial<ReconnectConfig>={}):number {
  const c = {...DEF,...cfg};
  return Math.min(c.baseDelayMs * Math.pow(2, attempt), c.maxDelayMs);
}
 
export function shouldRetry(attempt:number, cfg:Partial<ReconnectConfig>={}):boolean {
  return attempt < ({...DEF,...cfg}).maxAttempts;
}

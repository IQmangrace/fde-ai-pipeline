export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelayMs: number = 1000
): Promise<T> {
  let attempt = 1;

  while (attempt <= maxAttempts) {
    try {
      console.log(`🔄 Attempt ${attempt} of ${maxAttempts}...`);
      // Try to run the function
      return await fn();
    } catch (error) {
      console.error(`❌ Attempt ${attempt} failed:`, error instanceof Error ? error.message : error);

      // If we reached the max attempts, throw the error so the outer try/catch can handle it
      if (attempt === maxAttempts) {
        throw new Error(`Failed after ${maxAttempts} attempts.`);
      }

      // Calculate the wait time (1s, 2s, 4s...)
      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      console.log(`⏳ Waiting ${delay}ms before retrying...`);
      
      // Wait before the next loop iteration
      await new Promise((resolve) => setTimeout(resolve, delay));
      attempt++;
    }
  }
  
  throw new Error("Unexpected error in retry loop");
}
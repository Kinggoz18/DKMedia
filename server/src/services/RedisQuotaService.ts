import Redis from 'ioredis';
import { FastifyBaseLogger } from 'fastify';

export interface QuotaStats {
  currentCount: number;
  dailyLimit: number;
  remaining: number;
  percentageUsed: number;
  isPaused: boolean;
}

class RedisQuotaService {
  private redis: Redis;
  private dailyLimit: number = 100;
  private logger?: FastifyBaseLogger;
  private readonly DAILY_COUNT_KEY = 'email:daily:count';
  private readonly PAUSE_STATE_KEY = 'email:worker:paused';
  private readonly DAY_KEY_PREFIX = 'email:daily:';

  constructor(logger?: FastifyBaseLogger) {
    this.logger = logger;
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    this.redis = new Redis(redisUrl, {
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        this.logger?.warn(`Redis connection retry attempt ${times}, delay: ${delay}ms`);
        return delay;
      },
      maxRetriesPerRequest: 3,
    });

    this.redis.on('error', (error: Error) => {
      this.logger?.error('Redis connection error');
    });

    this.redis.on('connect', () => {
      this.logger?.info('Redis connected successfully');
    });

    // Initialize daily reset check
    this.initializeDailyReset();
  }

  /**
   * Get the current day key (UTC date string)
   */
  private getDayKey(): string {
    const now = new Date();
    const utcDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    return `${this.DAY_KEY_PREFIX}${utcDate.toISOString().split('T')[0]}`;
  }

  /**
   * Get the next UTC day start timestamp (00:00:00 UTC)
   */
  private getNextDayStart(): Date {
    const now = new Date();
    const tomorrow = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 1,
      0, 0, 0, 0
    ));
    return tomorrow;
  }

  /**
   * Initialize daily reset mechanism
   * Sets up a check to reset counters at UTC midnight
   */
  private async initializeDailyReset(): Promise<void> {
    const checkReset = async () => {
      try {
        const currentDayKey = this.getDayKey();
        const storedDayKey = await this.redis.get('email:current:day');
        
        if (storedDayKey !== currentDayKey) {
          // Day has changed, reset counter
          await this.resetDailyCount();
          await this.redis.set('email:current:day', currentDayKey);
          this.logger?.info(`Daily email count reset for new day: ${currentDayKey}`);
        }
      } catch (error: any) {
        this.logger?.error('Error checking daily reset', error);
      }
    };

    // Check immediately
    await checkReset();

    // Check every minute for day change
    setInterval(checkReset, 60 * 1000);
  }

  /**
   * Reset daily count (called at UTC midnight)
   */
  private async resetDailyCount(): Promise<void> {
    try {
      const dayKey = this.getDayKey();
      await this.redis.del(this.DAILY_COUNT_KEY);
      await this.redis.del(this.PAUSE_STATE_KEY);
      this.logger?.info(`Daily email count reset for ${dayKey}`);
    } catch (error: any) {
      this.logger?.error('Error resetting daily count', error);
    }
  }

  /**
   * Increment daily send count
   * @param count - Number of emails sent (default: 1)
   */
  async incrementCount(count: number = 1): Promise<number> {
    try {
      const newCount = await this.redis.incrby(this.DAILY_COUNT_KEY, count);
      
      // If we hit or exceed the limit, pause the worker
      if (newCount >= this.dailyLimit) {
        await this.pauseWorker();
      }
      
      return newCount;
    } catch (error: any) {
      this.logger?.error('Error incrementing email count', error);
      throw error;
    }
  }

  /**
   * Get current daily count
   */
  async getCurrentCount(): Promise<number> {
    try {
      const count = await this.redis.get(this.DAILY_COUNT_KEY);
      return count ? parseInt(count, 10) : 0;
    } catch (error: any) {
      this.logger?.error('Error getting current count', error);
      return 0;
    }
  }

  /**
   * Check if we can send emails
   * @param requestedCount - Number of emails requested
   */
  async canSend(requestedCount: number = 1): Promise<boolean> {
    try {
      const currentCount = await this.getCurrentCount();
      return (currentCount + requestedCount) <= this.dailyLimit;
    } catch (error: any) {
      this.logger?.error('Error checking send capability', error);
      return false;
    }
  }

  /**
   * Get quota statistics
   */
  async getStats(): Promise<QuotaStats> {
    try {
      const currentCount = await this.getCurrentCount();
      const isPaused = await this.isPaused();
      const remaining = Math.max(0, this.dailyLimit - currentCount);
      const percentageUsed = this.dailyLimit > 0 ? (currentCount / this.dailyLimit) * 100 : 0;

      return {
        currentCount,
        dailyLimit: this.dailyLimit,
        remaining,
        percentageUsed: Math.round(percentageUsed * 100) / 100,
        isPaused,
      };
    } catch (error: any) {
      this.logger?.error('Error getting quota stats', error);
      throw error;
    }
  }

  /**
   * Pause the worker (when limit is reached)
   */
  async pauseWorker(): Promise<void> {
    try {
      await this.redis.set(this.PAUSE_STATE_KEY, 'true');
      this.logger?.warn('Email worker paused due to daily limit reached');
    } catch (error: any) {
      this.logger?.error('Error pausing worker', error);
    }
  }

  /**
   * Resume the worker (when new day starts)
   */
  async resumeWorker(): Promise<void> {
    try {
      await this.redis.del(this.PAUSE_STATE_KEY);
      this.logger?.info('Email worker resumed');
    } catch (error: any) {
      this.logger?.error('Error resuming worker', error);
    }
  }

  /**
   * Check if worker is paused
   */
  async isPaused(): Promise<boolean> {
    try {
      const paused = await this.redis.get(this.PAUSE_STATE_KEY);
      return paused === 'true';
    } catch (error: any) {
      this.logger?.error('Error checking pause state', error);
      return false;
    }
  }

  /**
   * Get the next UTC day start time for rescheduling
   */
  getNextDayStartTime(): Date {
    return this.getNextDayStart();
  }

  /**
   * Close Redis connection
   */
  async close(): Promise<void> {
    await this.redis.quit();
  }
}

// Export singleton factory
export default (logger?: FastifyBaseLogger) => new RedisQuotaService(logger);

import { RedisOptions } from 'ioredis'

export interface Message {
  job: string
  data: unknown
  retryCount: number
  lastAttemptedAt: number | null
  lastError: string | null
  uniqueId?: string
  priority?: boolean
}

export interface PuntOptions {
  uniqueId?: string
  priority?: boolean
}

export interface PuntResult {
  messageId: string
  status: 'enqueued' | 'duplicate'
  warning?: string
}

export interface WorkerOpts {
  timeout?: number
  verbose?: boolean
  topic?: string
  worker?: string
  group?: string
  ts?: number
  maxRetries?: number
}

export interface PuntConfig {
  redisUrl?: string
  redisOptions?: RedisOptions
}

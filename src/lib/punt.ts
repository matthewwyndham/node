import { Redis } from 'ioredis'
import { Message, PuntConfig, PuntOptions, PuntResult } from '../types'
import connect from '../redis'

let redis: Redis

const UNIQUE_ID_KEY = '__punt__:__unique_ids__'
const DEFAULT_STREAM_KEY = '__punt__:__default__'
const PRIORITY_STREAM_KEY = '__punt__:__priority__'

const punt = async (
  job: string,
  data: unknown = {},
  options?: PuntOptions
): Promise<PuntResult> => {
  const { uniqueId, priority } = options || {}

  // Check if a job with this unique ID already exists
  if (uniqueId) {
    const existingMessageId = await redis.hget(UNIQUE_ID_KEY, uniqueId)
    if (existingMessageId) {
      return {
        messageId: existingMessageId,
        status: 'duplicate',
        warning: `Job with uniqueId '${uniqueId}' is already enqueued`,
      }
    }
  }

  const message: Message = {
    data,
    job,
    retryCount: 0,
    lastAttemptedAt: null,
    lastError: null,
    uniqueId,
    priority,
  }

  const stream = priority ? PRIORITY_STREAM_KEY : DEFAULT_STREAM_KEY
  const messageId = await redis.xadd(
    stream,
    '*',
    'job',
    job,
    'message',
    JSON.stringify(message)
  )

  // Store the unique ID mapping if provided
  if (uniqueId) {
    await redis.hset(UNIQUE_ID_KEY, uniqueId, messageId)
  }

  return {
    messageId,
    status: 'enqueued',
  }
}

/**
 * Initialize Punt with a Redis connection.
 *
 * Usage:
 *   import Punt from '@punt/node'
 *   const punt = Punt()
 *
 * @param puntConfig an optional config object to override the default Redis connection settings.
 * @returns the punt function used to enqueue jobs.
 */
const Punt = (puntConfig?: PuntConfig) => {
  redis = connect(puntConfig)

  return punt
}

export default Punt

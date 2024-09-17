import micromatch from 'micromatch';

import {
  type ActionCheckParams,
  type ActionParams,
  CACHE_OPERATIONS,
  type CacheOptions,
  type DeletePatterns,
  UNCACHE_OPERATIONS,
  type UncacheOptions,
} from './types.js';

export const unlinkPatterns = ({patterns, redis}: DeletePatterns) =>
  patterns.map(
    pattern =>
      new Promise<boolean>(resolve => {
        const stream = redis.scanStream({
          match: pattern,
        });
        stream.on('data', (keys: string[]) => {
          if (keys.length) {
            const pipeline = redis.pipeline();
            pipeline.unlink(keys);
            pipeline.exec();
          }
        });
        stream.on('end', () => resolve(true));
      })
  );

export const customCacheAction = async ({
  redis,
  ttl,
  options: {args: xArgs, model, query},
}: ActionParams) => {
  const args = {
    ...xArgs,
  };
  args.cache = undefined;

  const {key} = xArgs.cache as unknown as CacheOptions;
  const redisKey = `prisma:${model}:${key}`;
  // @ts-ignore
  const [[_, cached]] =
    (await redis
      .multi()
      .get(redisKey)
      .expire(redisKey, ttl as number)
      .exec()) ?? [];

  if (cached) return JSON.parse(cached as string);

  const result = await query(args);
  const value = JSON.stringify(result);

  if (ttl && ttl !== Number.POSITIVE_INFINITY)
    await redis.multi().set(redisKey, value, 'EX', ttl).exec();
  else await redis.multi().set(redisKey, value).exec();

  return result;
};

export const customUncacheAction = async ({
  redis,
  options: {args: xArgs, model, query},
}: ActionParams) => {
  const args = {
    ...xArgs,
  };

  args.uncache = undefined;

  const {uncacheKey, models, hasPattern} =
    xArgs.uncache as unknown as UncacheOptions;
  const redisKey = [];
  if (models) {
    for (const ind in models) {
      redisKey.push(`prisma:${models[ind]}:${uncacheKey}`);
    }
  } else {
    redisKey.push(`prisma:${model}:${uncacheKey}`);
  }
  if (hasPattern) {
    const patternKeys = micromatch(redisKey, ['*\\**', '*\\?*']);
    const plainKeys = micromatch(redisKey, ['*', '!*\\**', '!*\\?*']);

    const unlinkPromises = [
      ...unlinkPatterns({
        redis,
        patterns: patternKeys,
      }),
      ...(plainKeys.length ? [redis.unlink(plainKeys)] : []),
    ];

    await Promise.all(unlinkPromises);
  }

  return query(args);
};

export const isCustomCacheEnabled = ({
  options: {args: xArgs, operation},
}: ActionCheckParams) =>
  !!xArgs.cache &&
  typeof xArgs.cache === 'object' &&
  CACHE_OPERATIONS.includes(operation as (typeof CACHE_OPERATIONS)[number]);

export const isCustomUncacheEnabled = ({
  options: {args: xArgs, operation},
}: ActionCheckParams) =>
  !!xArgs.uncache &&
  typeof xArgs.uncache === 'object' &&
  UNCACHE_OPERATIONS.includes(operation as (typeof UNCACHE_OPERATIONS)[number]);

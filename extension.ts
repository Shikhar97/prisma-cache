import {Prisma} from '@prisma/client/extension';
import {createCache} from 'async-cache-dedupe';
import {ExtendedModel, PrismaExtensionRedisConfig} from './types';
import {
  customCacheAction,
  customUncacheAction,
  isCustomCacheEnabled,
  isCustomUncacheEnabled,
} from './utils';

export const PrismaCacheExtension = (
  ttl: number,
  config: PrismaExtensionRedisConfig
) => {
  const {redis} = config;

  const cache = 'cache' in config ? createCache(config.cache) : undefined;

  return Prisma.defineExtension({
    name: 'prisma-cache-extension',
    client: {
      redis,
      cache,
    },
    model: {
      $allModels: {} as ExtendedModel,
    },
    query: {
      $allModels: {
        async $allOperations(options) {
          const {args, query} = options;

          if (isCustomUncacheEnabled({options})) {
            return customUncacheAction({redis, options});
          }

          if (isCustomCacheEnabled({options})) {
            return customCacheAction({redis, ttl, options});
          }
          return query(args);
        },
      },
    },
  });
};

<img src=https://prismalens.vercel.app/header/logo-dark.svg width="500px"/>

# Prisma Cache Extension

[![Build](https://github.com/Shikhar97/prisma-cache/actions/workflows/build.yml/badge.svg)](https://github.com/Shikhar97/prisma-cache/actions/workflows/build.yml)
![Dynamic JSON Badge](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2FShikhar97%2Fprisma-cache%2Fmain%2Fpackage-lock.json&query=%24.version&label=Version)

The `prisma-cache-extension` is a robust package designed to optimize database performance by improving access times,
streamlining cache management, and offering flexible tools for efficient maintenance.

### Databases supported:

- Redis

### **Installation**

##### **Using npm:**

```bash
npm install prisma-cache-extension
```

##### **Using yarn:**

```bash
yarn add prisma-cache-extension
```

### Initializtion of setup

```javascript
import {PrismaClient} from '@prisma/client';
import {Redis} from 'ioredis';
import {
    PrismaCacheExtension,
} from 'prisma-cache-extension';

// Create a Redis client
const redis = new Redis({
    host: env.REDIS_HOST_NAME, // Specify Redis host name
    port: env.REDIS_PORT, // Specify Redis port
});
```

### Cache Client Config

This configuration is required for enabling caching.

```javascript
const cache: CacheConfig = {
    storage: {
        type: 'redis',
        options: {
            client: redis,
            invalidation: {
                referencesTTL: 15
            }, // Invalidation settings
            // Logger for cache events
            log: console,
        },
    },
};
```

### Create Prisma Extended Client

```javascript
// Create a Prisma client instance
const prisma = new PrismaClient();
return prisma.$extends(
    PrismaExtensionRedis(30, {
        cache, redis
    }));
```

### Use case 1: Caching Configuration

```javascript
// Example: Query a user and cache the result when caching is enabled
prisma.user.findUnique({
    where,
    cache: {
        key: JSON.stringify(where)
    }
});


// Disable caching for this operation, if not mentioned
extendedPrisma.user.findFirst({
    where: {userId: id},

});
```

### Use case 2: Invalidation of Cached Data

```javascript
// Example: Update a user and invalidate related cache keys
extendedPrisma.user.update({
    where: {id},
    data: {username},
    uncache: {
        uncacheKey: "*",
        models: ["user", "userprofile"],
        hasPattern: true, // Use wildcard pattern for key matching
    },
});
```

### Dependencies

- `ioredis`
- `micromatch`
- `async-cache-dedupe`

### Key Features

### Why Choose `prisma-cache-extension`?

**Effortless Query Caching:** Seamlessly cache your Prisma query results in Redis with minimal setup required.

**Targeted Cache Invalidation:** Easily invalidate specific Prisma queries to maintain accurate and up-to-date data.

**Granular Control:** Adjust caching and invalidation settings for each query, giving you precise control over caching
behavior.

**Dynamic Invalidation Strategies:** Apply effective cache invalidation strategies to keep your cached data current.

**Versatile Maintenance:** Leverage general-purpose functions to efficiently manage Redis or Dragonfly databases.

---

**Benefits of `prisma-cache-extension`:**

- **Unified Dependencies:** Replace multiple packages with a single `prisma-cache-extension` dependency, simplifying
  your setup.
- **Streamlined Maintenance:** Enjoy centralized updates and improvements, making maintenance more straightforward.
- **Optimized Codebase:** Reduce redundancy and enhance performance by consolidating your codebase.
- **Community Engagement:** Connect with the `prisma-cache-extension` community for support and collaborative
  development.

Upgrade to `prisma-cache-extension` today for a more efficient and integrated Redis caching solution. If this proves
helpful, consider giving it a star! [⭐ Star Me!](https://github.com/Shikhar97/prisma-cache.git)
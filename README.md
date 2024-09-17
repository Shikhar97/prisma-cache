# prisma-cache

The `prisma-cache` extension for prisma is a comprehensive package that provides a unified solution for optimizing
database access times, enhancing cache management, and offering versatile functions for efficient Redis/Dragonfly
database maintenance.

🚀 If `prisma-cache` proves helpful, consider giving it a
star! [⭐ Star Me!](https://github.com/Shikhar97/prisma-cache.git)

### **Installation**

##### **Using npm:**

```bash
npm install prisma-cache
```

##### **Using yarn:**

```bash
yarn add prisma-cache
```

### Initializtion of setup

```javascript
import {PrismaClient} from '@prisma/client';
import {Redis} from 'ioredis';
import {
    PrismaCacheExtension,
} from 'prisma-cache';

// Create a Redis client
const redis = new Redis({
    host: env.REDIS_HOST_NAME, // Specify Redis host name
    port: env.REDIS_PORT, // Specify Redis port
});
```

\

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

### Use case 1: Default Caching Configuration

```javascript
// Example: Query a user and cache the result when caching is enabled
prisma.user.findUnique({
    where,
    cache: {
        key: JSON.stringify(where)
    }
});


// Example: Exclude automatic caching for a specific operation
extendedPrisma.user.findFirst({
    where: {userId: id},
    // Disable caching for this operation, if not mentioned
});
```

### Use case 2: Selective Caching with Custom Configuration

```javascript
// Example: Query a user and cache the result - with custom configuration
extendedPrisma.user.findUnique({
    where: {id},
    cache: {ttl: 5, key: getCacheKey([{prisma: 'User'}, {userId: id}])},
});
```

### Use case 3: Invalidation of Cached Data

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

### Why Choose `prisma-cache`?

**Effortless Query Caching:** Seamlessly cache your Prisma query results in Redis with minimal setup required.

**Targeted Cache Invalidation:** Easily invalidate specific Prisma queries to maintain accurate and up-to-date data.

**Granular Control:** Adjust caching and invalidation settings for each query, giving you precise control over caching behavior.

**Dynamic Invalidation Strategies:** Apply effective cache invalidation strategies to keep your cached data current.

**Versatile Maintenance:** Leverage general-purpose functions to efficiently manage Redis or Dragonfly databases.

---

**Benefits of `prisma-cache`:**

- **Unified Dependencies:** Replace multiple packages with a single `prisma-cache` dependency, simplifying your setup.
- **Streamlined Maintenance:** Enjoy centralized updates and improvements, making maintenance more straightforward.
- **Optimized Codebase:** Reduce redundancy and enhance performance by consolidating your codebase.
- **Community Engagement:** Connect with the `prisma-cache` community for support and collaborative development.

Upgrade to `prisma-cache` today for a more efficient and integrated Redis caching solution.

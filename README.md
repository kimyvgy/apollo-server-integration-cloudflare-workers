# apollo-server-integration-cloudflare-workers

[![NPM version](https://img.shields.io/npm/v/apollo-server-integration-cloudflare-workers.svg)](https://www.npmjs.com/package/apollo-server-integration-cloudflare-workers)

This is Apollo Server v4 integration for Cloudflare Workers. It provides:
- `kv-cache.ts` - `KVCache`: Cache on Cloudflare KV storage
- `start-server.ts` - `startServerAndCreateCloudflareHandler`: Handle incoming request and return an instance of `Response`
- `with-cors` - `withCors`: Add configure for CORS middleware

## Demo

- Source: https://github.com/kimyvgy/worker-apollo-server-template
- Live demo: https://worker-apollo-server.webee-asia.workers.dev/

## Install

```bash
npm install apollo-server-integration-cloudflare-workers
```

## Getting Started

1. Initialize an Apollo Server instance:

```javascript
import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';

const server = new ApolloServer<ContextValue>({
  typeDefs,
  resolvers,
  introspection: true,
  plugins: [
    ApolloServerPluginLandingPageLocalDefault({ footer: false }),
    // ApolloServerPluginLandingPageProductionDefault({
    //   graphRef: 'my-graph-id@my-graph-variant',
    //   footer: false,
    // })
  ],
});
```

2. Call `startServerAndCreateCloudflareHandler(server, options)`:

```javascript
import type { GraphQLRequestHandler, CorsOptions } from 'apollo-server-integration-cloudflare-workers';
import { startServerAndCreateCloudflareHandler, KVCache } from 'apollo-server-integration-cloudflare-workers';

const handleGraphQLRequest: GraphQLRequestHandler = startServerAndCreateCloudflareHandler(server, {
  context: async ({ request }) => {
    const cache = options.kvCache ? new KVCache() : server.cache;

    const dataSources: ApolloDataSources = {
      pokemonAPI: new PokemonAPI({ cache }),
    };

    return { dataSources };
  },

  // Enable CORS headers on GraphQL requests
  // Set to `true` for defaults or pass an object to configure each header
  // cors: {
  //   allowCredentials: 'true',
  //   allowHeaders: 'Content-type',
  //   allowOrigin: '*',
  //   allowMethods: 'GET, POST, PUT',
  // },
  cors: true,
});

addEventListener((e) => handleGraphQLRequest(e.request));
```

## Support / Donate

<h3 align="center">Support the developer</h3>

<p align="center">
  <a href="https://kimyvgy.webee.asia" target="_blank" title="Donate with: Paypal, Momo, Buymeacoffee">
    <img src="https://user-images.githubusercontent.com/13513658/208368616-f20301e6-61d5-449b-aa87-5dda17b273b7.png">
  </a>
</p>

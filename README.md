# apollo-server-integration-cloudflare-workers

This is Apollo Server v4 integration for Cloudflare Workers. It provides:
- `kv-cache.ts` - `KVCache`: Cache on Cloudflare KV storage
- `start-server.ts` - `startServerAndCreateCloudflareHandler`: Handle incoming request and return an instance of `Response`
- `with-cors` - `withCors`: Add configure for CORS middleware

## Demo

- Source: https://github.com/kimyvgy/worker-apollo-server-template
- Live demo: https://worker-apollo-server.webee-asia.workers.dev/

## Getting Started

1. Initialize an Apollo Server instance:

```javascript
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
const response: Response = startServerAndCreateCloudflareHandler(server, {
  request,
  cors: options.cors,
  context: async () => {
    const cache = options.kvCache ? new KVCache() : server.cache;

    const dataSources: ApolloDataSources = {
      pokemonAPI: new PokemonAPI({ cache }),
    };

    return { dataSources };
  }
});
```

3. Send the `response` to the browser.

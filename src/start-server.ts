import type { Request, Headers } from '@cloudflare/workers-types';
import type { WithRequired } from '@apollo/utils.withrequired';
import { CorsOptions, withCors } from './with-cors';

import {
  ApolloServer,
  BaseContext,
  ContextFunction,
  HeaderMap,
  HTTPGraphQLRequest,
} from '@apollo/server';

export type GraphQLRequestHandler = (request: Request) => Promise<Response>;

export interface CloudflareContextFunctionArgument {
  request: Request;
}

export interface CloudflareHandlerOptions<TContext extends BaseContext> {
  context?: ContextFunction<[CloudflareContextFunctionArgument], TContext>;
  cors?: CorsOptions;
}

export function startServerAndCreateCloudflareHandler(
  server: ApolloServer<BaseContext>,
  options: CloudflareHandlerOptions<BaseContext>,
): GraphQLRequestHandler;
export function startServerAndCreateCloudflareHandler<TContext extends BaseContext>(
  server: ApolloServer<TContext>,
  options: WithRequired<CloudflareHandlerOptions<TContext>, 'context'>,
): GraphQLRequestHandler;
export function startServerAndCreateCloudflareHandler<TContext extends BaseContext>(
  server: ApolloServer<TContext>,
  { context, cors }: CloudflareHandlerOptions<TContext>,
): GraphQLRequestHandler {
  server.startInBackgroundHandlingStartupErrorsByLoggingAndFailingAllRequests();

  const defaultContext: ContextFunction<
    [CloudflareContextFunctionArgument],
    any
  > = async () => ({});

  const contextFunction: ContextFunction<
    [CloudflareContextFunctionArgument],
    TContext
  > = context ?? defaultContext;

  return async (request: Request) => {
    let response: Response;

    try {
      if (request.method === 'OPTIONS') {
        response = new Response('', { status: 204 });
      }

      const httpGraphQLRequest = await normalizeIncomingRequest(request);

      const { body, headers, status } = await server.executeHTTPGraphQLRequest({
        httpGraphQLRequest: httpGraphQLRequest,
        context: () => contextFunction({ request }),
      });

      if (body.kind === 'chunked') {
        throw Error('Incremental delivery not implemented');
      }

      response = new Response(body.string, {
        status: status || 200,
        headers: {
          ...Object.fromEntries(headers),
          'content-length': Buffer.byteLength(body.string).toString(),
        },
      });
    } catch (e) {
      response = new Response((e as Error).message, { status: 400 });
    }

    return withCors(response, cors);
  }
}

async function normalizeIncomingRequest(request: Request): Promise<HTTPGraphQLRequest> {
  const headers = normalizeHeaders(request.headers);
  const url = new URL(request.url);
  const method = request.method.toUpperCase();

  return {
    method,
    headers,
    body: method === 'GET' ? request.body : await request.json(),
    search: url.search ?? '',
  }
}

function normalizeHeaders(headers: Headers): HeaderMap {
  const headerMap = new HeaderMap();

  headers.forEach((value, key) => {
    headerMap.set(key, Array.isArray(value) ? value.join(', ') : value);
  });

  return headerMap;
}

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

export interface CloudflareContextFunctionArgument {
  request: Request;
}

export interface CloudflareHandlerOptions<TContext extends BaseContext> {
  context?: ContextFunction<[CloudflareContextFunctionArgument], TContext>;
  request: Request;
  cors?: CorsOptions;
}

export async function startServerAndCreateCloudflareHandler(
  server: ApolloServer<BaseContext>,
  options: CloudflareHandlerOptions<BaseContext>,
): Promise<Response>;
export async function startServerAndCreateCloudflareHandler<TContext extends BaseContext>(
  server: ApolloServer<TContext>,
  options: WithRequired<CloudflareHandlerOptions<TContext>, 'context'>,
): Promise<Response>;
export async function startServerAndCreateCloudflareHandler<TContext extends BaseContext>(
  server: ApolloServer<TContext>,
  { request, context, cors }: CloudflareHandlerOptions<TContext>,
): Promise<Response> {
  server.startInBackgroundHandlingStartupErrorsByLoggingAndFailingAllRequests();

  const defaultContext: ContextFunction<
    [CloudflareContextFunctionArgument],
    any
  > = async () => ({});

  const contextFunction: ContextFunction<
    [CloudflareContextFunctionArgument],
    TContext
  > = context ?? defaultContext;

  try {
    if (request.method === 'OPTIONS') {
      return withCors(new Response('', { status: 204 }), cors);
    }

    const httpGraphQLRequest = await normalizeIncomingRequest(request);

    const { body, headers, status } = await server.executeHTTPGraphQLRequest({
      httpGraphQLRequest: httpGraphQLRequest,
      context: () => contextFunction({ request }),
    });

    if (body.kind === 'chunked') {
      throw Error('Incremental delivery not implemented');
    }

    const response = new Response(body.string, {
      status: status || 200,
      headers: {
        ...Object.fromEntries(headers),
        'content-length': Buffer.byteLength(body.string).toString(),
      },
    });

    return withCors(response, cors);
  } catch (e) {
    return withCors(new Response((e as Error).message, { status: 400 }), cors);
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

export interface CorsOptions {
  allowCredentials?: string | undefined;
  allowHeaders?: string | undefined;
  allowOrigin?: string | undefined;
  allowMethods?: string | undefined;
}

export function withCors(response: Response, options?: CorsOptions): Response {
  if (!options) return response;

  response.headers.set(
    'Access-Control-Allow-Credentials',
    options?.allowCredentials || 'true',
  );

  response.headers.set(
    'Access-Control-Allow-Headers',
    options?.allowHeaders || 'application/json, Content-type',
  );

  response.headers.set(
    'Access-Control-Allow-Methods',
    options?.allowMethods || 'GET, POST',
  );

  response.headers.set(
    'Access-Control-Allow-Origin',
    options?.allowOrigin || '*',
  );

  response.headers.set('X-Content-Type-Options', 'nosniff');

  return response;
}

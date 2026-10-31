import { expect, type APIRequestContext } from '@playwright/test';

// A reusable, typed GraphQL client; it checks HTTP AND GraphQL-level failures.
export interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string; path?: string[] }>;
}
export class SaleorClient {
  constructor(
    private readonly request: APIRequestContext,
    private readonly endpoint: string = process.env.SALEOR_API_URL ?? 'http://localhost:8000/graphql/',
  ) {}
  async execute<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
    const response = await this.request.post(this.endpoint, {
      data: { query, variables },
      headers: { 'content-type': 'application/json' },
    });
    expect(response.status(), 'GraphQL HTTP request should succeed').toBe(200);
    const payload = (await response.json()) as GraphQLResponse<T>;
    expect(payload.errors, JSON.stringify(payload.errors)).toBeUndefined();
    expect(payload.data, 'GraphQL data must exist').toBeDefined();
    return payload.data as T;
  }
  async raw(query: string, variables: Record<string, unknown> = {}): Promise<GraphQLResponse<unknown>> {
    const response = await this.request.post(this.endpoint, { data: {query, variables} });
    expect(response.status()).toBe(200);
    return response.json() as Promise<GraphQLResponse<unknown>>;
  }
}

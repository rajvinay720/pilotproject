import { test, expect } from '@playwright/test';
import { SaleorClient } from '../../support/graphql-client';
import { PRODUCTS, SHOP } from '../../support/queries';

type ShopData = { shop: { name: string } };
type Product = { id: string; name: string; slug: string };
type CatalogData = { products: {
  edges: Array<{ cursor: string; node: Product }>;
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
} };

test('@smoke @api public shop metadata contract', async ({ request }) => {
  const client = new SaleorClient(request);
  const result = await client.execute<ShopData>(SHOP);
  expect(result.shop.name.trim().length).toBeGreaterThan(0);
});

test('@regression @api catalog pagination preserves unique product IDs', async ({ request }) => {
  const channel = process.env.SALEOR_CHANNEL || 'default-channel';
  const client = new SaleorClient(request);
  const allIds = new Set<string>();
  let cursor: string | null = null;
  for (let pageNumber = 0; pageNumber < 3; pageNumber++) {
    const data: CatalogData = await client.execute<CatalogData>(PRODUCTS, {
      channel, first: 2, after: cursor,
    });
    for (const edge of data.products.edges) {
      expect(edge.node.id).toBeTruthy();
      expect(edge.node.name).toBeTruthy();
      expect(allIds.has(edge.node.id), 'duplicate product across pages').toBe(false);
      allIds.add(edge.node.id);
    }
    if (!data.products.pageInfo.hasNextPage) break;
    cursor = data.products.pageInfo.endCursor;
    expect(cursor, 'next page requires cursor').not.toBeNull();
  }
  expect(allIds.size, 'Seed your Saleor channel with products').toBeGreaterThan(0);
});

test('@negative @api invalid GraphQL selection returns a structured error', async ({ request }) => {
  const client = new SaleorClient(request);
  const result = await client.raw('query { shop { fieldThatDoesNotExist } }');
  expect(result.errors?.length).toBeGreaterThan(0);
  expect(result.errors?.[0].message).toContain('fieldThatDoesNotExist');
});

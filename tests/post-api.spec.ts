import { expect, test } from '@playwright/test';

test('gets post 1 and validates its response', async ({ request }) => {
  const response = await request.get('https://jsonplaceholder.typicode.com/posts/1');

  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('application/json');

  const post = await response.json();
  expect(post.id).toBe(1);
  expect(post.userId).toBeDefined();
  expect(post.title).toEqual(expect.any(String));
  expect(post.title.length).toBeGreaterThan(0);
  expect(post.body).toEqual(expect.any(String));
  expect(post.body.length).toBeGreaterThan(0);

  console.log('API GET /posts/1: 200 response validated');
});

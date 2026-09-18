import { expect, test } from '@playwright/test';

const postsUrl = 'https://jsonplaceholder.typicode.com/posts';

test('gets post 1 and validates its response', async ({ request }) => {
  const response = await request.get(`${postsUrl}/1`);

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

test('gets posts filtered by user ID', async ({ request }) => {
  const response = await request.get(`${postsUrl}?userId=1`);

  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('application/json');

  const posts: Array<{ userId: number }> = await response.json();
  expect(posts.length).toBeGreaterThan(0);
  expect(posts.every((post) => post.userId === 1)).toBe(true);

  console.log('API GET /posts?userId=1: filtered list validated');
});

test('creates a post and validates the response', async ({ request }) => {
  const newPost = {
    userId: 1,
    title: 'Playwright interview preparation',
    body: 'Practice UI and API automation together.',
  };

  const response = await request.post(postsUrl, { data: newPost });

  expect(response.status()).toBe(201);
  expect(response.headers()['content-type']).toContain('application/json');
  expect(await response.json()).toEqual(expect.objectContaining(newPost));

  console.log('API POST /posts: 201 response validated');
});

test('returns 404 for a post that does not exist', async ({ request }) => {
  const response = await request.get(`${postsUrl}/999999`);

  expect(response.status()).toBe(404);
  expect(response.headers()['content-type']).toContain('application/json');
  expect(await response.json()).toEqual({});

  console.log('API GET /posts/999999: 404 response validated');
});

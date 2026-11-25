import { APIRequestContext, APIResponse, expect, test } from '@playwright/test';

const USERS_API_URL = 'https://reqres.in/api/users';

type User = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string;
};

type Support = {
  url: string;
  text: string;
  sponsored_by?: string;
};

type UsersListResponse = {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  data: User[];
  support: Support;
  _meta?: Record<string, unknown>;
};

async function getUsersByPage(
  request: APIRequestContext,
  pageNumber: number,
): Promise<APIResponse> {
  return request.get(USERS_API_URL, {
    params: {
      page: pageNumber,
    },
    headers: {
      accept: 'application/json',
    },
  });
}

function validateUser(user: User): void {
  expect(typeof user.id).toBe('number');
  expect(Number.isInteger(user.id)).toBe(true);
  expect(user.id).toBeGreaterThan(0);

  expect(typeof user.email).toBe('string');
  expect(user.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);

  expect(typeof user.first_name).toBe('string');
  expect(user.first_name.trim().length).toBeGreaterThan(0);

  expect(typeof user.last_name).toBe('string');
  expect(user.last_name.trim().length).toBeGreaterThan(0);

  expect(typeof user.avatar).toBe('string');
  expect(user.avatar).toMatch(/^https?:\/\/.+/);
}

test.describe('Reqres Users API', () => {
  test('GET /api/users?page=2 - should return paginated users with valid schema', async ({
    request,
  }) => {
    const pageNumber = 2;
    const response = await getUsersByPage(request, pageNumber);

    expect(response.status()).toBe(200);
    expect(response.ok()).toBe(true);
    expect(response.statusText()).toBe('OK');

    const contentType = response.headers()['content-type'] ?? '';
    expect(contentType.toLowerCase()).toContain('application/json');

    const body = (await response.json()) as UsersListResponse;

    expect(body).toEqual(
      expect.objectContaining({
        page: expect.any(Number),
        per_page: expect.any(Number),
        total: expect.any(Number),
        total_pages: expect.any(Number),
        data: expect.any(Array),
        support: expect.any(Object),
      }),
    );

    expect(body.page).toBe(pageNumber);
    expect(body.per_page).toBeGreaterThan(0);
    expect(body.total).toBeGreaterThanOrEqual(0);
    expect(body.total_pages).toBeGreaterThan(0);
    expect(body.page).toBeLessThanOrEqual(body.total_pages);
    expect(body.data.length).toBeLessThanOrEqual(body.per_page);

    if (body.total > 0) {
      expect(body.data.length).toBeGreaterThan(0);
    }

    const expectedFirstId = (body.page - 1) * body.per_page + 1;
    body.data.forEach((user, index) => {
      validateUser(user);
      expect(user.id).toBe(expectedFirstId + index);
      expect(user.avatar).toContain(`${user.id}-image`);
    });

    const ids = body.data.map((user) => user.id);
    expect(new Set(ids).size).toBe(ids.length);

    const emails = body.data.map((user) => user.email.toLowerCase());
    expect(new Set(emails).size).toBe(emails.length);

    expect(typeof body.support.url).toBe('string');
    expect(body.support.url).toMatch(/^https?:\/\/.+/);
    expect(typeof body.support.text).toBe('string');
    expect(body.support.text.trim().length).toBeGreaterThan(0);

    if (body.support.sponsored_by !== undefined) {
      expect(typeof body.support.sponsored_by).toBe('string');
      expect(body.support.sponsored_by.trim().length).toBeGreaterThan(0);
    }

    if (body._meta !== undefined) {
      expect(typeof body._meta).toBe('object');
      expect(body._meta).not.toBeNull();
    }
  });
});
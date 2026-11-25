
import { test, expect } from '@playwright/test';

test('Create User API', async ({ request }) => {

    // 1. Base URI
    const baseURI = 'https://reqres.in';

    // 2. Request Headers
    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    };

    // 3. Request Body
    const requestBody = {
        name: 'morpheus',
        job: 'leader'
    };

    // 4. Send POST Request
    const response = await request.post(`${baseURI}/api/users`, {
        headers: headers,
        data: requestBody
    });

    // 5. Validate Status Code
    expect(response.status()).toBe(201);

    // 6. Get Response Body
    const responseBody = await response.json();

    // 7. Validate Response
    expect(responseBody.name).toBe('morpheus');
    expect(responseBody.job).toBe('leader');
    expect(responseBody.id).toBeTruthy();
    expect(responseBody.createdAt).toBeTruthy();

    // 8. Validate Response Header
    expect(response.headers()['content-type'])
        .toContain('application/json');

});

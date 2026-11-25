import {expect,test} from '@playwright/test';

test('Get User API', async ({ request }) => {
 const baseURI ='https://reqres.in';

 await request.get(`${baseURI}/api/users/2`, {
    headers: {
        'Accept': 'application/json'
    }
 }).then(async (response) => {
    // 1. Validate Status Code
    expect(response.status()).toBe(200);

    // 2. Get Response Body
    const responseBody = await response.json();

    console.log(responseBody);
 });
});

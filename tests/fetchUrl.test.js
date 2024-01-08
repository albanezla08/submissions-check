const utils = require('../src/utils');
const coursesSampleData = require('./coursesSampleData.json');
const coursesUrl = 'https://canvas.uchicago.edu/api/v1/courses?include[]=term&per_page=100';
const assignemntsSampleData = require('./assignmentsSampleData.json');
const assignmentsUrl = /^(https:\/\/canvas.uchicago.edu\/api\/v1\/courses\/\d{5}\/assignments\?include\[\]=submission&per_page=100)$/;

async function fetchMockSuccess(url) {
    let data;
    let ok = true;
    if (url === coursesUrl) {
        data = coursesSampleData;
    } else if (assignmentsUrl.test(url)) {
        data = assignemntsSampleData;
    } else {
        ok = false;
    }
    return Promise.resolve({
        ok: ok,
        status: 404,
        json: () => Promise.resolve(data)
    });
}

async function fetchMockError(url, ok, status) {
    return Promise.resolve({
        ok,
        status
    });
}

describe('mock fetch functionality', () => {
    beforeEach(() => {
        fetchMock = jest.spyOn(global, "fetch")
        .mockImplementation(fetchMockSuccess);
    });
    
    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('toHaveBeenCalled accurate', () => {
        fetch();
        expect(fetchMock).toHaveBeenCalled();
    });
    test('is called by fetchUrl', async () => {
        await utils.fetchUrl('https://www.google.com');
        expect(fetchMock).toHaveBeenCalled();
    });

    describe('valid courses URL', () => {
        test('json array returned', async () => {
            const response = await utils.fetchUrl(coursesUrl);
            expect(response).toHaveProperty('json');
            expect(Array.isArray(response.json)).toBe(true);
        });
        test('id in json data', async () => {
            const response = await utils.fetchUrl(coursesUrl);
            const json = response.json;
            for (const data of json) {
                expect(data).toHaveProperty('id');
            }
        });
        test('if access is unrestricted then term in json data', async () => {
            const response = await utils.fetchUrl(coursesUrl);
            const json = response.json;
            for (const data of json) {
                if (data.access_restricted_by_date === true) {
                    expect(data).not.toHaveProperty('term');
                } else {
                    expect(data).toHaveProperty('term');
                }
            }
        });
    });

    describe('assignment URLs', () => {
        test('course 51386 returns json array', async () => {
            const url = 'https://canvas.uchicago.edu/api/v1/courses/51386/assignments?include[]=submission&per_page=100';
            const response = await utils.fetchUrl(url);
            expect(response).toHaveProperty('json');
            expect(Array.isArray(response.json)).toBe(true);
        });
        test('course 40389 has submission', async () => {
            const url = 'https://canvas.uchicago.edu/api/v1/courses/40389/assignments?include[]=submission&per_page=100';
            const response = await utils.fetchUrl(url);
            const json = response.json;
            expect(json[0]).toHaveProperty('submission');
        });
        test('course 5138 is not found', async () => {
            const url = 'https://canvas.uchicago.edu/api/v1/courses/5138/assignments?include[]=submission&per_page=100';
            const response = await utils.fetchUrl(url);
            const error = response.error;
            expect(error).toBe('404');
        });
        test('course without id is not found', async () => {
            const url = 'https://canvas.uchicago.edu/api/v1/courses//assignments?include[]=submission&per_page=100';
            const response = await utils.fetchUrl(url);
            const error = response.error;
            expect(error).toBe('404');
        });
        test('URL with extra characters at start is not found', async () => {
            const url = 'extrahttps://canvas.uchicago.edu/api/v1/courses/40389/assignments?include[]=submission&per_page=100';
            const response = await utils.fetchUrl(url);
            const error = response.error;
            expect(error).toBe('404');
        });
        test('URL with extra characters at end is not found', async () => {
            const url = 'https://canvas.uchicago.edu/api/v1/courses/40389/assignments?include[]=submission&per_page=100extra';
            const response = await utils.fetchUrl(url);
            const error = response.error;
            expect(error).toBe('404');
        });
    });

    describe('errors', () => {
        test('error does not return json', async () => {
            fetchMock.mockImplementation(url => fetchMockError(url, false, 401));
            const response = await utils.fetchUrl(coursesUrl);
            expect(response).not.toHaveProperty('json');
        });
        test('error with ok == false returns expected status code', async () => {
            fetchMock.mockImplementation(url => fetchMockError(url, false, 400));
            const response = await utils.fetchUrl(coursesUrl);
            expect(response).toHaveProperty('error');
            expect(response.error).toBe('400');
        });
    })
});
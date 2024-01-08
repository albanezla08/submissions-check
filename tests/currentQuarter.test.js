const functions = require('../src/functional');

describe('getCurrentQuarter', () => {
    afterEach(() => {
        jest.useRealTimers();
    });

    test('fake timers setSystemTime works as expected', () => {
        jest.useFakeTimers().setSystemTime(new Date('2020-02-23'));
        const currentDate = new Date();
        expect(currentDate.getFullYear()).toEqual(2020);
        expect(currentDate.getMonth()).toEqual(1);
        expect(currentDate.getUTCDate()).toEqual(23);
    });
    test('Jan 1 is winter quarter', () => {
        jest.useFakeTimers().setSystemTime(new Date('01 Jan 2023 00:00:00 CST'));
        const quarter = functions.getCurrentQuarter();
        expect(quarter).toBe('2023.01');
    });
    test('March 20 is winter quarter', () => {
        jest.useFakeTimers().setSystemTime(new Date('20 Mar 2023 00:00:00 CST'));
        const quarter = functions.getCurrentQuarter();
        expect(quarter).toBe('2023.01');
    });
    test('March 21 is spring quarter', () => {
        jest.useFakeTimers().setSystemTime(new Date('21 Mar 2023 00:00:00 CST'));
        const quarter = functions.getCurrentQuarter();
        expect(quarter).toBe('2023.02');
    });
    test('June 10 is spring quarter', () => {
        jest.useFakeTimers().setSystemTime(new Date('10 Jun 2023 00:00:00 CST'));
        const quarter = functions.getCurrentQuarter();
        expect(quarter).toBe('2023.02');
    });
    test('June 11 is summer quarter', () => {
        jest.useFakeTimers().setSystemTime(new Date('11 Jun 2023 00:00:00 CST'));
        const quarter = functions.getCurrentQuarter();
        expect(quarter).toBe('2023.03');
    });
    test('September 20 is summer quarter', () => {
        jest.useFakeTimers().setSystemTime(new Date('20 Sep 2023 00:00:00 CST'));
        const quarter = functions.getCurrentQuarter();
        expect(quarter).toBe('2023.03');
    });
    test('September 21 is autumn quarter', () => {
        jest.useFakeTimers().setSystemTime(new Date('21 Sep 2023 00:00:00 CST'));
        const quarter = functions.getCurrentQuarter();
        expect(quarter).toBe('2023.04');
    });
    test('December 31 is autumn quarter', () => {
        jest.useFakeTimers().setSystemTime(new Date('31 Dec 2023 00:00:00 CST'));
        const quarter = functions.getCurrentQuarter();
        expect(quarter).toBe('2023.04');
    });
});
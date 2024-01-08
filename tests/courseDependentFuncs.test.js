const utils = require('../src/utils');
const coursesSampleData = require('./coursesSampleData.json');
const assignmentsUrl = /^(https:\/\/canvas.uchicago.edu\/api\/v1\/courses\/\d{5}\/assignments\?include\[\]=submission&per_page=100)$/;
const winterQuarterName = '2023.01';
const springQuarterName = '2023.02';
const summerQuarterName = '2023.03';
const autumnQuarterName = '2023.04';

function expectCourseInQuarters(course, winterResult,
    springResult, summerResult, autumnResult) {
        const checkQuarter =
            quarterName => utils.checkCourseIsInQuarter(course, quarterName);
        expect(checkQuarter(winterQuarterName)).toBe(winterResult);
        expect(checkQuarter(springQuarterName)).toBe(springResult);
        expect(checkQuarter(summerQuarterName)).toBe(summerResult);
        expect(checkQuarter(autumnQuarterName)).toBe(autumnResult);
}

describe('checkCourseInQuarter', () => {
    test('access restricted course always false', () => {
        const course = coursesSampleData[2];
        expect(course.access_restricted_by_date).toBe(true);
        expectCourseInQuarters(course, false, false, false, false);
    });
    test('access unrestricted course is in only one quarter', () => {
        const course = coursesSampleData[3];
        expect(course).not.toHaveProperty('access_restricted_by_date');
        expect(course.term.name).toBe('2023.04');
        expectCourseInQuarters(course, false, false, false, true);
    });
    test('an invalid quarter name is false', () => {
        const course = coursesSampleData[3];
        expect(course).not.toHaveProperty('access_restricted_by_date');
        expect(course.term.name).toBe('2023.04');
        expect(utils.checkCourseIsInQuarter(course, '2023.05')).toBe(false);
    });
});

describe('calcAssignmentsUrl', () => {
    test('valid course ID returns valid URL', () => {
        const course = coursesSampleData[3];
        const url = utils.calcAssignmentsUrl(course);
        expect(assignmentsUrl.test(url)).toBe(true);
    });
    test('invalid course ID returns invalid URL', () => {
        const course = { id: 1234 };
        const url = utils.calcAssignmentsUrl(course);
        expect(assignmentsUrl.test(url)).toBe(false);
    });
    test('undefined course ID returns null', () => {
        const course = { name: 'Fake Class' };
        const url = utils.calcAssignmentsUrl(course);
        expect(assignmentsUrl.test(url)).toBe(false);
        expect(url).toBe(null);
    });
});
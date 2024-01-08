const utils = require('../src/utils');
const assignmentsSampleData = require('./assignmentsSampleData.json');

describe('checkCanBeSubmitted', () => {
    afterEach(() => {
        jest.useRealTimers();
    });

    test("assignment that doesn't lock can be submitted", () => {
        const assignment = assignmentsSampleData[3];
        expect(assignment.lock_at).toBe(null);
        const result = utils.checkCanBeSubmitted(assignment);
        expect(result).toBe(true);
    });
    test('assignment that locks after now can be submitted', () => {
        const assignment = assignmentsSampleData[0];
        expect(assignment.lock_at).toBe("2023-10-06T04:59:59Z");
        jest.useFakeTimers().setSystemTime(new Date('2023-10-04'));
        const result = utils.checkCanBeSubmitted(assignment);
        expect(result).toBe(true);
    });
    test("assignment that locks before now can't be submitted", () => {
        const assignment = assignmentsSampleData[0];
        expect(assignment.lock_at).toBe("2023-10-06T04:59:59Z");
        jest.useFakeTimers().setSystemTime(new Date('2023-10-08'));
        const result = utils.checkCanBeSubmitted(assignment);
        expect(result).toBe(false);
    });
    test("assignment with submssion type none can't be submitted", () => {
        const assignment = assignmentsSampleData[4];
        expect(assignment.lock_at).toBe(null);
        expect(assignment.submission_types).toEqual(['none']);
        const result = utils.checkCanBeSubmitted(assignment);
        expect(result).toBe(false);
    })
});

describe('isAlreadySubmitted', () => {
    test('assignment with submitted_at null returns false', () => {
        const assignment = assignmentsSampleData[2];
        expect(assignment.submission.submitted_at).toBe(null);
        const result = utils.checkIsAlreadySubmitted(assignment);
        expect(result).toBe(false);
    });
    test('assignment with submitted_at not null returns false', () => {
        const assignment = assignmentsSampleData[0];
        expect(assignment.submission.submitted_at).toBe('2023-10-06T04:58:18Z');
        const result = utils.checkIsAlreadySubmitted(assignment);
        expect(result).toBe(true);
    });
});

describe('categorizeBySubmitted', () => {
    test('empty arrary returns two empty arrays', () => {
        const result = utils.categorizeBySubmitted([]);
        expect(result).toStrictEqual({
            submitted: [],
            unsubmitted: []
        });
    });
    test('assignments that are all locked return two empty arrays', () => {
        const assignments = assignmentsSampleData.slice(0, 3);
        for (const assignment of assignments) {
            expect(assignment.lock_at).not.toBe(null);
        }
        const result = utils.categorizeBySubmitted(assignments);
        expect(result).toStrictEqual({
            submitted: [],
            unsubmitted: []
        });
    });
    describe('assignments that are not locked', () => {
        beforeAll(() =>
            jest.useFakeTimers().setSystemTime(new Date('2023-10-04')));

        afterAll(() =>
            jest.useRealTimers());
        
        test('with submission return in submitted array', () => {
            const assignments = structuredClone(assignmentsSampleData.slice(0, 2));
            for (const assignment of assignments) {
                expect(utils.checkIsAlreadySubmitted(assignment)).toBe(true);
            }
            const result = utils.categorizeBySubmitted(assignments);
            expect(result).toStrictEqual({
                submitted: assignments,
                unsubmitted: []
            });
        });
        test('without submission return in unsubmitted array', () => {
            const assignments = structuredClone(assignmentsSampleData.slice(0, 3));
            for (const assignment of assignments) {
                assignment.submission.submitted_at = null;
                expect(utils.checkIsAlreadySubmitted(assignment)).toBe(false);
            }
            const result = utils.categorizeBySubmitted(assignments);
            expect(result).toStrictEqual({
                submitted: [],
                unsubmitted: assignments
            });
        });
        test('one submitted and one unsubmitted assignment', () => {
            const assignments = assignmentsSampleData.slice(0, 2);
            const assignmentOne = assignments[0];
            const assignmentTwo = structuredClone(assignments[1]);
            assignmentTwo.submission.submitted_at = null;
            expect(utils.checkIsAlreadySubmitted(assignmentOne)).toBe(true);
            expect(utils.checkIsAlreadySubmitted(assignmentTwo)).toBe(false);
            const result = utils.categorizeBySubmitted([assignmentOne, assignmentTwo]);
            expect(result).toStrictEqual({
                submitted:[assignmentOne],
                unsubmitted:[assignmentTwo]
            });
        });
    });
});
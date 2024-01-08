const functions = {
    baseUrl: "https://canvas.uchicago.edu/api/v1/",
    fetchUrl: async function (url) {
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                }
            });
            if (!response.ok) {
                return { error: response.status.toString() };
            }
            const json = await response.json();
            return { json: json };
        } catch (err) {
            return { error: err.message };
        }
    },
    getCurrentQuarter: function () {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const endOfDateStr = currentYear.toString() + ' 00:00:00 CST';
        const winterEnd = new Date('20 Mar ' + endOfDateStr);
        const springEnd = new Date('10 Jun ' + endOfDateStr);
        const summerEnd = new Date('20 Sep ' + endOfDateStr);
        const autumnEnd = new Date('31 Dec ' + endOfDateStr);
        if (currentDate <= winterEnd) {
            return (currentYear.toString() + '.01');
        } else if (currentDate <= springEnd) {
            return (currentYear.toString() + '.02');
        } else if (currentDate <= summerEnd) {
            return (currentYear.toString() + '.03');
        } else if (currentDate <= autumnEnd) {
            return (currentYear.toString() + '.04');
        } else {
            throw new Error('Conditional branch in currentQuarter should not be possible');
        }
    },
    checkCourseIsInQuarter: function (course, quarterName) {
        return course.hasOwnProperty('term') && course.term.name === quarterName;
    },
    calcAssignmentsUrl: function (course) {
        const courseId = course.id;
        if (courseId === undefined) {
            return null;
        }
        return functions.baseUrl + 'courses/' + courseId.toString() +
            '/assignments?include[]=submission&per_page=100';
    },
    checkCanBeSubmitted: function (assignment) {
        const submissionTypes = assignment.submission_types;
        if (submissionTypes.includes('none')) {
            return false;
        }
        const lockAt = assignment.lock_at;
        if (lockAt === null) {
            return true;
        }
        const lockAtDate = new Date(lockAt);
        const currentDate = new Date();
        return currentDate < lockAtDate;
    },
    checkIsAlreadySubmitted: function (assignment) {
        const submitted_at = assignment.submission.submitted_at;
        return submitted_at !== null;
    },
    categorizeBySubmitted: function (assignments) {
        const submittedAssignments = [];
        const unsubmittedAssignments = [];
        for (const assignment of assignments) {
            if (!functions.checkCanBeSubmitted(assignment)) {
                continue;
            }
            if (functions.checkIsAlreadySubmitted(assignment)) {
                submittedAssignments.push(assignment);
            } else {
                unsubmittedAssignments.push(assignment);
            }
        }
        return { submitted: submittedAssignments, unsubmitted: unsubmittedAssignments};
    }
};

if (typeof module === 'object') {
    module.exports = functions;
}
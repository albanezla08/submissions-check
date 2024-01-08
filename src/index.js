function showCredentialsError() {
    const container = document.getElementById("tab-content");
    const message = document.createElement("b");
    message.innerText = "Credentials error! Log in to Canvas and try again";
    container.appendChild(message);
}

function checkAndRespondForError(fetchResponse) {
    if (fetchResponse.error) {
        if (fetchResponse.error === "401") {
            showCredentialsError();
        }
        throw new Error("Unable to fetch data");
    }
}

async function updateAssignments() {
    const coursesUrl = utils.baseUrl + "courses.json?include[]=term&per_page=100";
    const coursesResponse = await utils.fetchUrl(coursesUrl);
    checkAndRespondForError(coursesResponse);
    const coursesData = coursesResponse.json;
    const currentQuarterName = utils.getCurrentQuarter();
    let currentAssignments = [];
    for (const course of coursesData) {
        if (utils.checkCourseIsInQuarter(course, currentQuarterName)) {
            const url = utils.calcAssignmentsUrl(course);
            const assignmentsResponse = await utils.fetchUrl(url);
            checkAndRespondForError(assignmentsResponse);
            const assignmentsData = assignmentsResponse.json;
            currentAssignments = currentAssignments.concat(assignmentsData);
        }
    }
    const { submitted, unsubmitted } = utils.categorizeBySubmitted(currentAssignments);
    const submittedContainer = document.getElementById('content-submitted');
    const unsubmittedContainer = document.getElementById('content-missing');
    const template = document.getElementById('assignment-temp');
    if (submitted.length === 0) {
        const doneMessage = document.createElement('h2');
        doneMessage.textContent = 'No submittable assignments here'
        submittedContainer.appendChild(doneMessage);
    }
    for (const assignment of submitted) {
        const clone = template.content.cloneNode(true);
        const nameLink = clone.querySelector('.assignment-name');
        nameLink.textContent = assignment.name;
        nameLink.href = assignment.html_url;
        const statusIcon = clone.querySelector('.assignment-status-icon');
        statusIcon.src = 'checkmark.png';
        submittedContainer.appendChild(clone);
    }
    if (unsubmitted.length === 0) {
        const doneMessage = document.createElement('h2');
        doneMessage.textContent = 'No missing assignments!'
        unsubmittedContainer.appendChild(doneMessage);
    }
    for (const assignment of unsubmitted) {
        const clone = template.content.cloneNode(true);
        const nameLink = clone.querySelector('.assignment-name');
        nameLink.textContent = assignment.name;
        nameLink.href = assignment.html_url;
        const statusIcon = clone.querySelector('.assignment-status-icon');
        statusIcon.src = 'exclamation-point.png';
        unsubmittedContainer.appendChild(clone);
    }
    for (const loadingText of document.querySelectorAll('.loading-text')) {
        loadingText.style = 'display: none';
    }
}

function toggleTabContent(selected, deselected) {
    selected.content.style = 'display: block';
    deselected.content.style = '';
    selected.button.classList.add('active');
    deselected.button.classList.remove('active');
}

document.addEventListener("DOMContentLoaded", () => {
    const submittedTab = document.getElementById('button-submitted');
    const missingTab = document.getElementById('button-missing');
    const submittedContent = document.getElementById('content-submitted');
    const missingContent = document.getElementById('content-missing');
    const submittedElements = {
        content: submittedContent,
        button: submittedTab
    };
    const missingElements = {
        content: missingContent,
        button: missingTab
    };
    submittedTab.addEventListener('click', () => toggleTabContent(submittedElements, missingElements));
    missingTab.addEventListener('click', () => toggleTabContent(missingElements, submittedElements));
    updateAssignments();
})
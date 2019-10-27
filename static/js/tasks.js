/**
 * JavaScript file for the Tasks page
 */

/* jshint esversion: 8 */

/**
 * This is the model class which provides access to the server REST API
 * @type {{}}
 */
class Model {
    async read(userId) {
        let options = {
            method: "GET",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json"
            }
        };
        // Call the REST endpoint and wait for data
        let response = await fetch(`/api/users/${userId}`, options);
        let data = await response.json();
        return data;
    }

    async readOne(userId, taskId) {
        let options = {
            method: "GET",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json",
                "accepts": "application/json"
            }
        };
        // Call the REST endpoint and wait for data
        let response = await fetch(`/api/users/${userId}/tasks/${taskId}`, options);
        let data = await response.json();
        return data;
    }

    async create(userId, task) {
        let options = {
            method: "POST",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json",
                "accepts": "application/json"
            },
            body: JSON.stringify(task)
        };
        // Call the REST endpoint and wait for data
        let response = await fetch(`/api/users/${userId}/tasks`, options);
        let data = await response.json();
        return data;
    }

    async update(userId, task) {
        let options = {
            method: "PUT",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json",
                "accepts": "application/json"
            },
            body: JSON.stringify(task)
        };
        // Call the REST endpoint and wait for data
        let response = await fetch(`/api/users/${userId}/tasks/${task.taskId}`, options);
        let data = await response.json();
        return data;
    }

    async delete(userId, taskId) {
        let options = {
            method: "DELETE",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json",
                "accepts": "application/json"
            }
        };
        // Call the REST endpoint and wait for data
        let response = await fetch(`/api/users/${userId}/tasks/${taskId}`, options);
        return response;
    }
}


/**
 * This is the view class which provides access to the DOM
 */
class View {
    constructor() {
        this.NEW_TASK = 0;
        this.EXISTING_TASK = 1;
        this.table = document.querySelector(".tasks table");
        this.error = document.querySelector(".error");
        this.userId = document.getElementById("user_id");
        this.name = document.getElementById("name");
        this.timestamp = document.getElementById("timestamp");
        this.taskId = document.getElementById("task_id");
        this.task = document.getElementById("task");
        this.createButton = document.getElementById("create");
        this.updateButton = document.getElementById("update");
        this.deleteButton = document.getElementById("delete");
        this.resetButton = document.getElementById("reset");
    }

    reset() {
        this.taskId.textContent = "";
        this.task.value = "";
        this.task.focus();
    }

    updateEditor(task) {
        this.taskId.textContent = task.taskId;
        this.task.value = task.content;
        this.task.focus();
    }

    setButtonState(state) {
        if (state === this.NEW_TASK) {
            this.createButton.disabled = false;
            this.updateButton.disabled = true;
            this.deleteButton.disabled = true;
        } else if (state === this.EXISTING_TASK) {
            this.createButton.disabled = true;
            this.updateButton.disabled = false;
            this.deleteButton.disabled = false;
        }
    }

    buildTable(user) {
        let tbody,
            html = "";

        // Update the person data
        this.userId.textContent = user.user_id;
        this.name.textContent = user.name;
        this.timestamp.textContent = user.timestamp;

        // Iterate over the tasks and build the table
        user.tasks.forEach((task) => {
            html += `
            <tr data-task_id="${task.task_id}" data-description="${task.description}">
                <td class="timestamp">${task.timestamp}</td>
                <td class="description">${task.description}</td>
		<td class="state">${task.state}</td>
            </tr>`;
        });
        // Is there currently a tbody in the table?
        if (this.table.tBodies.length !== 0) {
            this.table.removeChild(this.table.getElementsByTagName("tbody")[0]);
        }
        // Update tbody with our new content
        tbody = this.table.createTBody();
        tbody.innerHTML = html;
    }

    errorMessage(error_msg) {
        let error = document.querySelector(".error");

        error.innerHTML = error_msg;
        error.classList.add("visible");
        error.classList.remove("hidden");
        setTimeout(() => {
            error.classList.add("hidden");
            error.classList.remove("visible");
        }, 2000);
    }
}


/**
 * This is the controller class for the user interaction
 */
class Controller {
    constructor(model, view) {
        this.model = model;
        this.view = view;

        this.initialize();
    }

    async initialize() {
        await this.initializeTable();
        this.initializeTableEvents();
        this.initializeCreateEvent();
        this.initializeUpdateEvent();
        this.initializeDeleteEvent();
        this.initializeResetEvent();
    }

    async initializeTable() {
        try {
            let urlUserId = +document.getElementById("url_user_id").value,
                urlTaskId = +document.getElementById("url_task_id").value,
                user = await this.model.read(urlUserId);

            this.view.buildTable(user);

            // Did we navigate here with a task selected?
            if (urlTaskId) {
                let task = await this.model.readOne(urlUserId, urlTaskId);
                this.view.updateEditor(task);
                this.view.setButtonState(this.view.EXISTING_TASK);

            // Otherwise, nope, so leave the editor blank
            } else {
                this.view.reset();
                this.view.setButtonState(this.view.NEW_TASK);
            }
            this.initializeTableEvents();
        } catch (err) {
            this.view.errorMessage(err);
        }
    }

    initializeTableEvents() {
        document.querySelector("table tbody").addEventListener("click", (evt) => {
            let target = evt.target.parentElement,
                taskId = target.getAttribute("data-task_id"),
                description = target.getAttribute("data-description");
	        state = target.getAttribute("data-state");

            this.view.updateEditor({
                taskId: taskId,
                description: description,
		state:state
            });
            this.view.setButtonState(this.view.EXISTING_TASK);
        });
    }

    initializeCreateEvent() {
        document.getElementById("create").addEventListener("click", async (evt) => {
            let urlUserId = +document.getElementById("user_id").textContent,
                task = document.getElementById("task").value;

            evt.preventDefault();
            try {
                await this.model.create(urlUserId, {
                    content: task
		    state: task
                });
                await this.initializeTable();
            } catch(err) {
                this.view.errorMessage(err);
            }
        });
    }

    initializeUpdateEvent() {
        document.getElementById("update").addEventListener("click", async (evt) => {
            let userId = +document.getElementById("user_id").textContent,
                taskId = +document.getElementById("task_id").textContent,
                task = document.getElementById("task").value;

            evt.preventDefault();
            try {
                await this.model.update(userId, {
                    userId: userId,
                    taskId: taskId,
                    description: task,
		    state: task
                });
                await this.initializeTable();
            } catch(err) {
                this.view.errorMessage(err);
            }
        });
    }

    initializeDeleteEvent() {
        document.getElementById("delete").addEventListener("click", async (evt) => {
            let userId = +document.getElementById("user_id").textContent,
                taskId = +document.getElementById("task_id").textContent;

            evt.preventDefault();
            try {
                await this.model.delete(userId, taskId);
                await this.initializeTable();
            } catch(err) {
                this.view.errorMessage(err);
            }
        });
    }

    initializeResetEvent() {
        document.getElementById("reset").addEventListener("click", async (evt) => {
            evt.preventDefault();
            this.view.reset();
            this.view.setButtonState(this.view.NEW_TASK);
        });
    }
}

// Create the MVC components
const model = new Model();
const view = new View();
const controller = new Controller(model, view);

// export the MVC components as the default
export default {
    model,
    view,
    controller
};

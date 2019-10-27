/**
 * JavaScript file for the User page
 */

/* jshint esversion: 8 */

/**
 * This is the model class which provides access to the server REST API
 * @type {{}}
 */
class Model {
    async read() {
        let options = {
            method: "GET",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json",
                "accepts": "application/json"
            }
        };
        // Call the REST endpoint and wait for data
        let response = await fetch(`/api/users`, options);
        let data = await response.json();
        return data;
    }

    async readOne(userId) {
        let options = {
            method: "GET",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json",
                "accepts": "application/json"
            }
        };
        // Call the REST endpoint and wait for data
        let response = await fetch(`/api/users/${userId}`, options);
        let data = await response.json();
        return data;
    }

    async create(user) {
        let options = {
            method: "POST",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json",
                "accepts": "application/json"
            },
            body: JSON.stringify(person)
        };
        // Call the REST endpoint and wait for data
        let response = await fetch(`/api/users`, options);
        let data = await response.json();
        return data;
    }

    async update(user) {
        let options = {
            method: "PUT",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json",
                "accepts": "application/json"
            },
            body: JSON.stringify(user)
        };
        // Call the REST endpoint and wait for data
        let response = await fetch(`/api/users/${user.userId}`, options);
        let data = await response.json();
        return data;
    }

    async delete(userId) {
        let options = {
            method: "DELETE",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json",
                "accepts": "application/json"
            }
        };
        // Call the REST endpoint and wait for data
        let response = await fetch(`/api/users/${userId}`, options);
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
        this.table = document.querySelector(".users table");
        this.error = document.querySelector(".error");
        this.userId = document.getElementById("user_id");
        this.name = document.getElementById("name");
        this.createButton = document.getElementById("create");
        this.updateButton = document.getElementById("update");
        this.deleteButton = document.getElementById("delete");
        this.resetButton = document.getElementById("reset");
    }

    reset() {
        this.userId.textContent = "";
        this.name.value = "";
        this.name.focus();
    }

    updateEditor(person) {
        this.userId.textContent = user.user_id;
        this.name.value = user.name;
        this.name.focus();
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

    buildTable(users) {
        let tbody,
            html = "";

        // Iterate over the people and build the table
        users.forEach((user) => {
            html += `
            <tr data-user_id="${user.user_id}" data-name="${user.name}">
                <td class="timestamp">${user.timestamp}</td>
                <td class="name">${user.name}</td>
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

    errorMessage(message) {
        this.error.innerHTML = message;
        this.error.classList.add("visible");
        this.error.classList.remove("hidden");
        setTimeout(() => {
            this.error.classList.add("hidden");
            this.error.classList.remove("visible");
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
                users = await this.model.read();

            this.view.buildTable(users);

            // Did we navigate here with a person selected?
            if (urlUserId) {
                let user = await this.model.readOne(urlUserId);
                this.view.updateEditor(user);
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
        document.querySelector("table tbody").addEventListener("dblclick", (evt) => {
            let target = evt.target,
                parent = target.parentElement;

            evt.preventDefault();

            // Is this the name td?
            if (target) {
                let userId = parent.getAttribute("data-user_id");

                window.location = `/users/${userId}/tasks`;
            }
        });
        document.querySelector("table tbody").addEventListener("click", (evt) => {
            let target = evt.target.parentElement,
                person_id = target.getAttribute("data-person_id"),
                name = target.getAttribute("data-name"),

            this.view.updateEditor({
                user_id: user_id,
                name: name,
            });
            this.view.setButtonState(this.view.EXISTING_TASK);
        });
    }

    initializeCreateEvent() {
        document.getElementById("create").addEventListener("click", async (evt) => {
            let name = document.getElementById("name").value

            evt.preventDefault();
            try {
                await this.model.create({
                    name: name,
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
                name = document.getElementById("name").value,

            evt.preventDefault();
            try {
                await this.model.update({
                    userId: userId,
                    name: name
                });
                await this.initializeTable();
            } catch(err) {
                this.view.errorMessage(err);
            }
        });
    }

    initializeDeleteEvent() {
        document.getElementById("delete").addEventListener("click", async (evt) => {
            let userId = +document.getElementById("user_id").textContent;

            evt.preventDefault();
            try {
                await this.model.delete(userId);
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

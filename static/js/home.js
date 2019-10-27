/**
 * JavaScript file for the Home page
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
                "Content-Type": "application/json"
            }
        };
        // call the REST endpoint and wait for data
        let response = await fetch("/api/tasks", options);
        let data = await response.json();
        return data;
    }
}


/**
 * This is the view class which provides access to the DOM
 */
class View {
    constructor() {
        this.table = document.querySelector(".blog table");
        this.error = document.querySelector(".error");
    }

    buildTable(tasks) {
        let tbody = this.table.createTBody();
        let html = "";

        // Iterate over the tasks and build the table
        tasks.forEach((task) => {
            html += `
            <tr data-user_id="${task.user.user_id}" data-task_id="${task.task_id}">
                <td class="timestamp">${task.timestamp}</td>
                <td class="name">${task.user.name}</td>
                <td class="description">${task.description}</td>
		<td class="state">${task.state}</td>
            </tr>`;
        });
        // Replace the tbody with our new content
        tbody.innerHTML = html;
    }

    errorMessage(message) {
        this.error.innerHTML = message;
        this.error.classList.remove("hidden");
        this.error.classList.add("visible");
        setTimeout(() => {
            this.error.classList.remove("visible");
            this.error.classList.add("hidden");
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
        try {
            let tasks = await this.model.read();
            this.view.buildTable(tasks);
        } catch(err) {
            this.view.errorMessage(err);
        }

        // handle application events
        document.querySelector("table tbody").addEventListener("dblclick", (evt) => {
            let target = evt.target,
                parent = target.parentElement;

            // is this the name td?
            if (target.classList.contains("name")) {
                let user_id = parent.getAttribute("data-user_id");

                window.location = `/users/${user_id}`;

            // is this the content td
            } else if (target.classList.contains("description")) {
                let user_id = parent.getAttribute("data-user_id"),
                    task_id = parent.getAttribute("data-task_id");

                window.location = `users/${user_id}/tasks/${task_id}`;
            }
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

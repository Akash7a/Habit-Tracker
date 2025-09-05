const taskForm = document.querySelector("#task_form");
const taskTitleElem = document.querySelector("#task_title");
const taskDescElem = document.querySelector("#task_description");
const taskDateElem = document.querySelector("#dueDate");
const taskSubBtn = document.querySelector("#task_sub_btn");
import { loadData, saveData } from "./storage.js";


const tasks = loadData("tasks") || [];
let isEditingId = null;

const saveToLocalStorage = () => {
    saveData("tasks", tasks);
}

const createdTaskObj = ({ title, description, dueDate }) => {
    return {
        id: Date.now(),
        title,
        description,
        dueDate,
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }
}

const createTasks = (e) => {
    e.preventDefault();

    const titleVal = taskTitleElem.value.trim();
    const descVal = taskDescElem.value.trim();
    const dateVal = taskDateElem.value;

    if (titleVal === "" || dateVal === "") {
        alert("Please fill in title and due date")
        return;
    }


    const newTask = createdTaskObj({
        title: titleVal,
        description: descVal,
        dueDate: dateVal,
    });

    if (isEditingId) {
        const task = tasks.find((t) => t.id === isEditingId);

        if (task) {
            task.title = taskTitleElem.value;
            task.description = taskDescElem.value;
            task.dueDate = taskDateElem.value;
        }
        saveToLocalStorage();
        renderTasks();
        isEditingId = null;
        taskSubBtn.textContent = "Add Task";
    } else {
        tasks.push(newTask);
        saveToLocalStorage();
        renderTasks();
    }
    taskForm.reset();
}



const renderTasks = () => {
    const container = document.querySelector(".task_container");
    container.innerHTML = ""; // clear before rendering

    const heading = document.createElement("h2");
    heading.textContent = "Your Tasks";
    container.appendChild(heading);

    if (tasks.length === 0) {
        const msg = document.createElement("p");
        msg.textContent = "No tasks yet.";
        container.appendChild(msg);
        return;
    }

    tasks.forEach((t) => {
        const taskEl = document.createElement("div");
        taskEl.classList.add("task");

        const title = document.createElement("h3");
        title.textContent = t.title;

        const desc = document.createElement("p");
        desc.textContent = t.description || "No description";

        const due = document.createElement("p");
        due.textContent = `Due: ${t.dueDate}`;

        const status = document.createElement("p");
        status.textContent = t.completed ? "Done" : "Pending";

        const toggleBtn = createButtons("✅", "archive_btn", () => { toggleTask(t.id) });

        const deleteBtn = createButtons("❌", "delete_btn", () => { deleteTask(t.id) });

        const updateBtn = createButtons("📝", "update_btn", () => {
            updateTask(t.id)
        });

        taskEl.appendChild(title);
        taskEl.appendChild(desc);
        taskEl.appendChild(due);
        taskEl.appendChild(status);
        taskEl.appendChild(toggleBtn);
        taskEl.appendChild(updateBtn);
        taskEl.appendChild(deleteBtn);
        container.appendChild(taskEl);
    });
};

const createButtons = (lable, className, onClick) => {
    const btn = document.createElement("button");
    btn.textContent = lable;
    btn.classList.add(className);

    if (typeof onClick === "function") {
        btn.addEventListener("click", onClick);
    }
    return btn;
}

const updateTask = (id) => {
    const task = tasks.find((t) => t.id === id);
    if (task) {
        isEditingId = task.id;
        taskTitleElem.value = task.title;
        taskDescElem.value = task.description;
        taskDateElem.value = task.dueDate;

    }
    taskSubBtn.textContent = "Updating Task...";
    taskForm.scrollIntoView({ block: 'start', behavior: "smooth" });
}
const deleteTask = (id) => {
    const updatedData = tasks.filter((t) => t.id !== id);

    if (!updatedData) return;

    tasks.length = 0;

    tasks.push(...updatedData);

    saveToLocalStorage();
    renderTasks();
}

const toggleTask = (id) => {
    const task = tasks.find((t) => t.id === id);

    if (task) {
        task.completed = !task.completed;
        saveToLocalStorage();
        renderTasks();
    }
}
export const initTasks = () => {
    renderTasks();
    taskForm.addEventListener("submit", createTasks);
}

initTasks();
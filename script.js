const form = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const subjectInput = document.getElementById("subject-input");
const dateInput = document.getElementById("date-input");
const list = document.getElementById("task-list");
const emptyMsg = document.getElementById("empty");
const summary = document.getElementById("summary");
const clearBtn = document.getElementById("clear-done");
const filterButtons = document.querySelectorAll(".filter");

let tasks = JSON.parse(localStorage.getItem("study-tasks")) || [];
let currentFilter = "all";

function save() {
  localStorage.setItem("study-tasks", JSON.stringify(tasks));
}

function formatDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

function isOverdue(task) {
  if (!task.due || task.done) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(task.due + "T00:00:00") < today;
}

function render() {
  list.innerHTML = "";

  const visible = tasks.filter((t) => {
    if (currentFilter === "active") return !t.done;
    if (currentFilter === "done") return t.done;
    return true;
  });

  visible.forEach((task) => {
    const li = document.createElement("li");
    li.className = "task" + (task.done ? " done" : "");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.setAttribute("aria-label", "Mark as done");
    checkbox.addEventListener("change", () => toggleTask(task.id));

    const body = document.createElement("div");
    body.className = "task-body";

    const title = document.createElement("span");
    title.className = "task-title";
    title.textContent = task.text;

    const meta = document.createElement("span");
    meta.className = "task-meta" + (isOverdue(task) ? " overdue" : "");
    let metaText = task.subject;
    if (task.due) {
      metaText += " • " + (isOverdue(task) ? "Overdue: " : "Due ") + formatDate(task.due);
    }
    meta.textContent = metaText;

    body.append(title, meta);

    const del = document.createElement("button");
    del.className = "delete";
    del.innerHTML = "&times;";
    del.setAttribute("aria-label", "Delete task");
    del.addEventListener("click", () => deleteTask(task.id));

    li.append(checkbox, body, del);
    list.appendChild(li);
  });

  emptyMsg.hidden = visible.length > 0;

  const remaining = tasks.filter((t) => !t.done).length;
  summary.textContent = tasks.length === 0
    ? "No tasks yet"
    : remaining === 0
      ? "All done. Nice work!"
      : remaining + (remaining === 1 ? " task left" : " tasks left");

  clearBtn.hidden = !tasks.some((t) => t.done);
}

function addTask(e) {
  e.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;

  tasks.unshift({
    id: Date.now(),
    text: text,
    subject: subjectInput.value,
    due: dateInput.value,
    done: false,
  });

  save();
  render();
  form.reset();
  taskInput.focus();
}

function toggleTask(id) {
  tasks = tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
  save();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  save();
  render();
}

form.addEventListener("submit", addTask);

clearBtn.addEventListener("click", () => {
  tasks = tasks.filter((t) => !t.done);
  save();
  render();
});

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    currentFilter = btn.dataset.filter;
    filterButtons.forEach((b) => b.classList.toggle("active", b === btn));
    render();
  });
});

render();

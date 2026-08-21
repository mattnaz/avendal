const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");

async function loadTodos() {
  const res = await fetch("/api/todos");
  const todos = await res.json();
  renderTodos(todos);
}

function renderTodos(todos) {
  list.innerHTML = "";
  for (const todo of todos) {
    const li = document.createElement("li");
    li.className = todo.done ? "done" : "";

    const span = document.createElement("span");
    span.textContent = todo.text;
    span.addEventListener("click", () => toggleTodo(todo.id));

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "✕";
    deleteBtn.addEventListener("click", () => deleteTodo(todo.id));

    li.append(span, deleteBtn);
    list.appendChild(li);
  }
}

async function toggleTodo(id) {
  await fetch(`/api/todos/${id}/toggle`, { method: "PATCH" });
  loadTodos();
}

async function deleteTodo(id) {
  await fetch(`/api/todos/${id}`, { method: "DELETE" });
  loadTodos();
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  await fetch("/api/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  input.value = "";
  loadTodos();
});

loadTodos();

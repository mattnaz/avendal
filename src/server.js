import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { listTodos, addTodo, toggleTodo, removeTodo } from "./todoStore.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/api/todos", (req, res) => {
  res.json(listTodos());
});

app.post("/api/todos", (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: "text is required" });
  }
  res.status(201).json(addTodo(text.trim()));
});

app.patch("/api/todos/:id/toggle", (req, res) => {
  const todo = toggleTodo(Number(req.params.id));
  if (!todo) return res.status(404).json({ error: "not found" });
  res.json(todo);
});

app.delete("/api/todos/:id", (req, res) => {
  const ok = removeTodo(Number(req.params.id));
  if (!ok) return res.status(404).json({ error: "not found" });
  res.status(204).end();
});

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Todo app running at http://localhost:${PORT}`);
  });
}

export default app;

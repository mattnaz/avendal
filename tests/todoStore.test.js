import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { listTodos, addTodo, toggleTodo, removeTodo, resetTodos } from "../src/todoStore.js";

beforeEach(() => {
  resetTodos();
});

test("addTodo adds a new todo", () => {
  const todo = addTodo("buy milk");
  assert.equal(todo.text, "buy milk");
  assert.equal(todo.done, false);
  assert.equal(listTodos().length, 1);
});

test("toggleTodo flips the done flag", () => {
  const todo = addTodo("write code");
  toggleTodo(todo.id);
  assert.equal(listTodos()[0].done, true);
});

test("removeTodo deletes a todo", () => {
  const todo = addTodo("temp");
  removeTodo(todo.id);
  assert.equal(listTodos().length, 0);
});

test("removeTodo returns false for unknown id", () => {
  assert.equal(removeTodo(999), false);
});

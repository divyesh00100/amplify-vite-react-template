import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";

const client = generateClient<Schema>();

function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
  }, []);

  function createTodo() {
    const content = window.prompt("Enter a new task");
    if (content) {
      client.models.Todo.create({ content, completed: false });
    }
  }

  function toggleComplete(id: string) {
    const updatedTodos = todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    setTodos(updatedTodos);
    client.models.Todo.update(id, { completed: !todos.find(todo => todo.id === id)?.completed });
  }

  function deleteTodo(id: string) {
    setTodos(todos.filter(todo => todo.id !== id));
    client.models.Todo.delete(id);
  }

  const filteredTodos = todos.filter(todo => {
    if (filter === "completed") return todo.completed;
    if (filter === "active") return !todo.completed;
    return true;
  });

  return (
    <main>
      <h1>My Task List</h1>
      <div className="controls">
        <button onClick={createTodo}>+ Add Task</button>
        <select onChange={(e) => setFilter(e.target.value)} value={filter}>
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      <ul>
        {filteredTodos.map((todo) => (
          <li key={todo.id} className={todo.completed ? "completed" : ""}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleComplete(todo.id)}
            />
            <span>{todo.content}</span>
            <button onClick={() => deleteTodo(todo.id)}>❌</button>
          </li>
        ))}
      </ul>
      <footer>
        🎉 Your task list is ready! Add, complete, or delete your tasks to stay organized.
        <br />
        <a href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates">
          Continue exploring this tutorial.
        </a>
      </footer>
    </main>
  );
}

export default App;

import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";

const client = generateClient<Schema>();

function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const [filter, setFilter] = useState("all");

  // Fetch todos from the backend and set the state
  useEffect(() => {
    const subscription = client.models.Todo.observeQuery().subscribe({
      next: ({ items }) => setTodos(items),
      error: (err) => console.error("Error fetching todos:", err),
    });
    return () => subscription.unsubscribe();
  }, []);

  // Create a new todo
  function createTodo() {
    const content = window.prompt("Enter a new task:");
    if (content) {
      client.models.Todo.create({ content, completed: false }).then((newTodo) => {
        setTodos((prevTodos) => [...prevTodos, newTodo]);
      });
    }
  }

  // Toggle the completion status of a todo
  function toggleComplete(id: string) {
    const todoToUpdate = todos.find((todo) => todo.id === id);
    if (todoToUpdate) {
      client.models.Todo.update(id, { completed: !todoToUpdate.completed }).then(() => {
        setTodos((prevTodos) =>
          prevTodos.map((todo) =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
          )
        );
      });
    }
  }

  // Delete a todo
  function deleteTodo(id: string) {
    client.models.Todo.delete(id).then(() => {
      setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
    });
  }

  // Filter todos based on the selected filter option
  const filteredTodos = todos.filter((todo) => {
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

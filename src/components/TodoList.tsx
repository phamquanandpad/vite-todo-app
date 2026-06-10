import type { Todo } from '../types/api';
import { TodoItem } from './TodoItem';

export function TodoList({ todos }: { todos: Todo[] }) {
  if (todos.length === 0) {
    return <p>No todos found.</p>;
  }
  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ul>
  );
}

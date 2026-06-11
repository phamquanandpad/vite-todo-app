import type { Todo } from '../types/api';
import { TodoItem } from './TodoItem';

export function TodoList({ todos }: { todos: Todo[] }) {
  return (
    <ul className="space-y-3">
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ul>
  );
}

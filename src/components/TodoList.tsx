import { useState } from 'react';
import type { Todo } from '../types/api';
import { TodoItem } from './TodoItem';
import { TodoEditForm } from './TodoEditForm';

export function TodoList({ todos }: { todos: Todo[] }) {
  const [editingId, setEditingId] = useState<number | null>(null);

  return (
    <ul className="space-y-3">
      {todos.map((todo) =>
        editingId === todo.id ? (
          <TodoEditForm key={todo.id} todo={todo} onDone={() => setEditingId(null)} />
        ) : (
          <TodoItem
            key={todo.id}
            todo={todo}
            onEditStart={() => setEditingId(todo.id)}
            onEditEnd={() => setEditingId(null)}
          />
        ),
      )}
    </ul>
  );
}

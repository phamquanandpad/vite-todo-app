import { useState } from 'react';
import type { Todo } from '../types/api';
import { TodoItem } from './TodoItem';
import { TodoEditForm } from './TodoEditForm';
import { Dialog } from './ui/Dialog';

export function TodoList({ todos }: { todos: Todo[] }) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const editingTodo = todos.find((t) => t.id === editingId) ?? null;

  return (
    <>
      <ul className="space-y-3">
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onEditStart={() => setEditingId(todo.id)}
          />
        ))}
      </ul>
      <Dialog
        open={editingId !== null}
        title="Edit Todo"
        onClose={() => setEditingId(null)}
      >
        {editingTodo && (
          <TodoEditForm todo={editingTodo} onDone={() => setEditingId(null)} />
        )}
      </Dialog>
    </>
  );
}

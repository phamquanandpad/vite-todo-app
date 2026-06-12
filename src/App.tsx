import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { ToastProvider } from './components/toast/ToastProvider';
import { useToast } from './components/toast/useToast';
import { ProtectedRoute } from './components/ProtectedRoute';
import { GuestRoute } from './components/GuestRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { TodosPage } from './pages/TodosPage';
import { ProfilePage } from './pages/ProfilePage';
import { DeletedTodosPage } from './pages/DeletedTodosPage';
import type { ErrorResponse } from './types/api';

function toastableMessage(err: unknown): string {
  if (err instanceof AxiosError) {
    const apiErrors = (err.response?.data as ErrorResponse | undefined)?.errors;
    if (apiErrors?.length) return apiErrors.join(', ');
    return err.message;
  }
  return err instanceof Error ? err.message : 'Something went wrong';
}

function QueryWithToast({ children }: { children: React.ReactNode }) {
  const toast = useToast();
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
        queryCache: new QueryCache({
          onError: (err, query) => {
            if (query.meta?.silent) return;
            toast.error('Request failed', toastableMessage(err));
          },
        }),
        mutationCache: new MutationCache({
          onError: (err, _vars, _ctx, mutation) => {
            if (mutation.meta?.silent) return;
            toast.error('Action failed', toastableMessage(err));
          },
        }),
      }),
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ToastProvider>
          <QueryWithToast>
            <Routes>
              <Route element={<GuestRoute />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
              </Route>
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<TodosPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/deleted" element={<DeletedTodosPage />} />
              </Route>
            </Routes>
          </QueryWithToast>
        </ToastProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}

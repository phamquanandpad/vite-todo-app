import { MutationCache, QueryCache, QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { PermissionsProvider } from './auth/PermissionsContext';
import { ToastProvider } from './components/toast/ToastProvider';
import { useToast } from './components/toast/useToast';
import { ProtectedRoute } from './components/ProtectedRoute';
import { GuestRoute } from './components/GuestRoute';
import { RequirePermission } from './components/auth/RequirePermission';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { TodosPage } from './pages/TodosPage';
import { ProfilePage } from './pages/ProfilePage';
import { DeletedTodosPage } from './pages/DeletedTodosPage';
import { PermissionsAdminPage } from './pages/PermissionsAdminPage';
import { UsersAdminPage } from './pages/UsersAdminPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { setOn403Handler } from './api/client';
import type { ErrorResponse } from './types/api';

function toastableMessage(err: unknown): string {
  if (err instanceof AxiosError) {
    const apiErrors = (err.response?.data as ErrorResponse | undefined)?.errors;
    if (apiErrors?.length) return apiErrors.join(', ');
    return err.message;
  }
  return err instanceof Error ? err.message : 'Something went wrong';
}

function ForbiddenHandler() {
  const qc = useQueryClient();
  useEffect(() => {
    setOn403Handler(() => {
      qc.invalidateQueries({ queryKey: ['me'] });
    });
    return () => setOn403Handler(null);
  }, [qc]);
  return null;
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
            if (err instanceof AxiosError && err.response?.status === 403) return;
            toast.error('Request failed', toastableMessage(err));
          },
        }),
        mutationCache: new MutationCache({
          onError: (err, _vars, _ctx, mutation) => {
            if (mutation.meta?.silent) return;
            if (err instanceof AxiosError && err.response?.status === 403) return;
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
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <ToastProvider>
          <QueryWithToast>            <ForbiddenHandler />
            <PermissionsProvider>            <Routes>
              <Route element={<GuestRoute />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
              </Route>
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<TodosPage />} />
                <Route path="/profile" element={
                  <RequirePermission permission="users:update">
                    <ProfilePage />
                  </RequirePermission>
                } />
                <Route path="/deleted" element={
                  <RequirePermission permission="todos:deleted">
                    <DeletedTodosPage />
                  </RequirePermission>
                } />
                <Route path="/admin/permissions" element={
                  <RequirePermission permission="permissions:index">
                    <PermissionsAdminPage />
                  </RequirePermission>
                } />
                <Route path="/admin/users" element={
                  <RequirePermission permission="users:index">
                    <UsersAdminPage />
                  </RequirePermission>
                } />
              </Route>
              <Route path="/404" element={<NotFoundPage />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
            </PermissionsProvider>
          </QueryWithToast>
        </ToastProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}

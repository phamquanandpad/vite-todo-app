import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AxiosError } from 'axios';
import { useAuth } from '../auth/useAuth';
import { useUser, useUpdateUser, useDeleteUser } from '../hooks/useUser';
import type { ErrorResponse } from '../types/api';

const schema = z.object({
  username: z.string().min(1, 'Username is required'),
  email: z.string().email('Invalid email'),
  password: z.string().optional(),
  password_confirmation: z.string().optional(),
}).refine(
  (d) => !d.password || d.password === d.password_confirmation,
  { message: "Passwords don't match", path: ['password_confirmation'] },
);
type FormValues = z.infer<typeof schema>;

export function ProfilePage() {
  const { userId, logout } = useAuth();
  const navigate = useNavigate();
  const { data: user, isLoading } = useUser(userId);
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormValues>({
      resolver: zodResolver(schema),
      values: user ? { username: user.username, email: user.email } : undefined,
    });

  const onSubmit = async (values: FormValues) => {
    if (!userId) return;
    setServerError(null);
    setSuccess(false);
    try {
      const body: Parameters<typeof updateUser.mutateAsync>[0]['body'] = {
        username: values.username,
        email: values.email,
      };
      if (values.password) {
        body.password = values.password;
        body.password_confirmation = values.password_confirmation;
      }
      await updateUser.mutateAsync({ id: userId, body });
      setSuccess(true);
    } catch (err) {
      const apiErrors = (err as AxiosError<ErrorResponse>).response?.data?.errors;
      setServerError(apiErrors?.join(', ') ?? 'Update failed');
    }
  };

  const handleDelete = async () => {
    if (!userId) return;
    if (!confirm('Are you sure you want to delete your account? This cannot be undone.')) return;
    try {
      await deleteUser.mutateAsync(userId);
      await logout();
      navigate('/login');
    } catch {
      setServerError('Failed to delete account');
    }
  };

  if (isLoading) return <p>Loading…</p>;

  return (
    <main style={{ maxWidth: '400px', margin: '2rem auto', padding: '0 1rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0 }}>Profile</h1>
        <Link to="/">← Todos</Link>
      </header>

      {serverError && <p role="alert" style={{ color: 'red' }}>{serverError}</p>}
      {success && <p style={{ color: 'green' }}>Profile updated successfully.</p>}

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div>
          <label>Username<br />
            <input {...register('username')} style={{ width: '100%' }} />
          </label>
          {errors.username && <span role="alert" style={{ color: 'red', fontSize: '0.875rem' }}>{errors.username.message}</span>}
        </div>
        <div>
          <label>Email<br />
            <input type="email" {...register('email')} style={{ width: '100%' }} />
          </label>
          {errors.email && <span role="alert" style={{ color: 'red', fontSize: '0.875rem' }}>{errors.email.message}</span>}
        </div>
        <div>
          <label>New Password (optional)<br />
            <input type="password" {...register('password')} style={{ width: '100%' }} />
          </label>
        </div>
        <div>
          <label>Confirm New Password<br />
            <input type="password" {...register('password_confirmation')} style={{ width: '100%' }} />
          </label>
          {errors.password_confirmation && <span role="alert" style={{ color: 'red', fontSize: '0.875rem' }}>{errors.password_confirmation.message}</span>}
        </div>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Save Changes'}
        </button>
      </form>

      <hr style={{ margin: '2rem 0' }} />
      <button
        onClick={handleDelete}
        disabled={deleteUser.isPending}
        style={{ color: 'red', background: 'none', border: '1px solid red', padding: '0.5rem 1rem', cursor: 'pointer' }}
      >
        Delete Account
      </button>
    </main>
  );
}

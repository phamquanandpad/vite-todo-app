import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AxiosError } from 'axios';
import { useAuth } from '../auth/useAuth';
import { useUser, useUpdateUser, useDeleteUser } from '../hooks/useUser';
import type { ErrorResponse } from '../types/api';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

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

  if (isLoading) {
    return <div className="text-center py-8">Loading profile...</div>;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Profile</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your account settings</p>
      </div>

      {serverError && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
          {serverError}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400">
          Profile updated successfully!
        </div>
      )}

      <Card>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-white font-bold text-lg">
            {user?.username?.[0]?.toUpperCase() || 'Q'}
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Logged in as</p>
            <p className="font-medium text-gray-900 dark:text-white">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Username"
            {...register('username')}
            error={errors.username?.message}
          />
          <Input
            label="Email"
            type="email"
            {...register('email')}
            error={errors.email?.message}
          />

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Change Password (optional)</h3>
            <div className="space-y-4">
              <Input
                label="New Password"
                type="password"
                placeholder="Leave blank to keep current password"
                {...register('password')}
              />
              <Input
                label="Confirm New Password"
                type="password"
                {...register('password_confirmation')}
                error={errors.password_confirmation?.message}
              />
            </div>
          </div>

          <Button type="submit" isLoading={isSubmitting} className="w-full">
            {isSubmitting ? 'Saving…' : 'Save Changes'}
          </Button>
        </form>
      </Card>

      <Card className="border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-400 mb-1">Delete Account</h3>
            <p className="text-sm text-red-800 dark:text-red-500">
              This action cannot be undone. All your data will be permanently deleted.
            </p>
          </div>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={deleteUser.isPending}
          >
            Delete
          </Button>
        </div>
      </Card>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AxiosError } from 'axios';
import { authApi } from '../api/auth';
import type { ErrorResponse } from '../types/api';

const schema = z.object({
  username: z.string().min(1, 'Username is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  password_confirmation: z.string().min(1, 'Please confirm your password'),
}).refine((d) => d.password === d.password_confirmation, {
  message: "Passwords don't match",
  path: ['password_confirmation'],
});
type FormValues = z.infer<typeof schema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      await authApi.register(values);
      navigate('/login');
    } catch (err) {
      const apiErrors = (err as AxiosError<ErrorResponse>).response?.data?.errors;
      setServerError(apiErrors?.join(', ') ?? 'Registration failed');
    }
  };

  return (
    <main style={{ maxWidth: '400px', margin: '4rem auto', padding: '0 1rem' }}>
      <h1>Register</h1>
      {serverError && <p role="alert" style={{ color: 'red' }}>{serverError}</p>}
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
          <label>Password<br />
            <input type="password" {...register('password')} style={{ width: '100%' }} />
          </label>
          {errors.password && <span role="alert" style={{ color: 'red', fontSize: '0.875rem' }}>{errors.password.message}</span>}
        </div>
        <div>
          <label>Confirm Password<br />
            <input type="password" {...register('password_confirmation')} style={{ width: '100%' }} />
          </label>
          {errors.password_confirmation && <span role="alert" style={{ color: 'red', fontSize: '0.875rem' }}>{errors.password_confirmation.message}</span>}
        </div>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Registering…' : 'Register'}
        </button>
      </form>
      <p>Already have an account? <Link to="/login">Login</Link></p>
    </main>
  );
}

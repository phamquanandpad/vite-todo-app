import { useContext } from 'react';
import { ToastContext } from './ToastProvider';
import type { ToastApi } from './types';

export function useToast(): ToastApi {
  return useContext(ToastContext);
}

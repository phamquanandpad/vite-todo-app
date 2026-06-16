import type { User } from '../../types/api';
import { Dialog } from '../ui/Dialog';

interface Props {
  user: User;
  newRole: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function RoleChangeConfirmDialog({ user, newRole, isLoading = false, onConfirm, onClose }: Props) {
  return (
    <Dialog
      open
      variant="destructive"
      title="Change role"
      description={`Change ${user.username} from ${user.role} → ${newRole}? Their permissions will be fully revoked and re-granted based on the ${newRole} role.`}
      confirmLabel={isLoading ? 'Saving…' : 'Confirm'}
      confirmDisabled={isLoading}
      onConfirm={onConfirm}
      onClose={onClose}
    />
  );
}

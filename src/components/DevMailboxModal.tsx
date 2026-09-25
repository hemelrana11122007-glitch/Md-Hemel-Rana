import React from 'react';

interface DevMailboxModalProps {
  onSelectAction?: (type: 'verify' | 'reset', token: string) => void;
}

/**
 * Dev Mailbox visual modal is hidden from the UI.
 * Backend token generation and verification logic runs silently in the background.
 */
export const DevMailboxModal: React.FC<DevMailboxModalProps> = () => {
  return null;
};

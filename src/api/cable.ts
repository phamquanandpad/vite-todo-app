import { createConsumer, type Consumer } from '@rails/actioncable';

// Convert the HTTP API base URL to the matching ws/wss URL.
//   http://localhost:3000  → ws://localhost:3000/cable
//   https://api.example    → wss://api.example/cable
function cableUrl(token: string): string {
  const base = import.meta.env.VITE_API_BASE_URL.replace(/^http/, 'ws');
  return `${base}/cable?token=${encodeURIComponent(token)}`;
}

let consumer: Consumer | null = null;
let activeToken: string | null = null;

export function getConsumer(token: string): Consumer {
  if (consumer && activeToken === token) return consumer;
  consumer?.disconnect();
  activeToken = token;
  consumer = createConsumer(cableUrl(token));
  return consumer;
}

export function disconnectConsumer(): void {
  consumer?.disconnect();
  consumer = null;
  activeToken = null;
}

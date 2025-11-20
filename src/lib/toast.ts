type ToastType = 'success' | 'error' | 'info' | 'warning';
type ToastItem = { id: number; type: ToastType; message: string };

type Listener = (items: ToastItem[]) => void;

let idSeq = 1;
let items: ToastItem[] = [];
const listeners: Set<Listener> = new Set();

function notify() {
  listeners.forEach((l) => l(items));
}

export function addToast(message: string, type: ToastType = 'info', timeoutMs = 3000) {
  const id = idSeq++;
  items = [...items, { id, type, message }];
  notify();
  if (timeoutMs > 0) {
    setTimeout(() => {
      removeToast(id);
    }, timeoutMs);
  }
}

export function removeToast(id: number) {
  items = items.filter((t) => t.id !== id);
  notify();
}

export function subscribe(listener: Listener) {
  listeners.add(listener);
  listener(items);
  return () => {
    listeners.delete(listener);
  };
}

export type { ToastItem, ToastType };

"use client";

import { createContext, useCallback, useContext, useState } from"react";
import { AnimatePresence, motion } from"framer-motion";

interface Toast {
 id: number;
 message: string;
 icon?: string;
}

const ToastCtx = createContext<{ show: (message: string, icon?: string) => void }>({
 show: () => {},
});

export function useToast() {
 return useContext(ToastCtx);
}

let nextId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
 const [toasts, setToasts] = useState<Toast[]>([]);

 const show = useCallback((message: string, icon?: string) => {
 const id = ++nextId;
 setToasts((t) => [...t, { id, message, icon }]);
 setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
 }, []);

 return (
 <ToastCtx.Provider value={{ show }}>
 {children}
 <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[100] flex flex-col items-center gap-2 px-4">
 <AnimatePresence>
 {toasts.map((t) => (
 <motion.div
 key={t.id}
 initial={{ opacity: 0, y: 20, scale: 0.9 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 exit={{ opacity: 0, y: 10, scale: 0.9 }}
 className="glass flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-ink-900 shadow-soft"
 >
 {t.icon && <span aria-hidden>{t.icon}</span>}
 {t.message}
 </motion.div>
 ))}
 </AnimatePresence>
 </div>
 </ToastCtx.Provider>
 );
}

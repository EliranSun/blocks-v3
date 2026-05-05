import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Toast } from "./Toast.jsx";

const ToastContext = createContext(null);

const DEFAULT_DURATION = {
    error: 7000,
    success: 4000,
    info: 5000,
};

const reloadAction = {
    label: "Reload",
    onClick: () => window.location.reload(),
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const timeoutsRef = useRef(new Map());

    const dismissToast = useCallback((id) => {
        const timeout = timeoutsRef.current.get(id);
        if (timeout) {
            clearTimeout(timeout);
            timeoutsRef.current.delete(id);
        }
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const showToast = useCallback((toast) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const variant = toast.variant || "error";
        const action = toast.reloadable ? reloadAction : toast.action;
        const duration = toast.duration ?? (action ? 0 : DEFAULT_DURATION[variant]);
        const next = { id, message: toast.message, variant, action };

        setToasts((prev) => [...prev, next]);

        if (duration > 0) {
            const timeout = setTimeout(() => {
                timeoutsRef.current.delete(id);
                setToasts((prev) => prev.filter((t) => t.id !== id));
            }, duration);
            timeoutsRef.current.set(id, timeout);
        }
        return id;
    }, []);

    const showError = useCallback(
        (message, options = {}) => showToast({ ...options, message, variant: "error" }),
        [showToast],
    );

    useEffect(() => {
        const onError = () => {
            showError("Something went wrong loading the app.", { reloadable: true });
        };
        const onRejection = () => {
            showError("Something went wrong.", { reloadable: true });
        };
        window.addEventListener("error", onError);
        window.addEventListener("unhandledrejection", onRejection);
        return () => {
            window.removeEventListener("error", onError);
            window.removeEventListener("unhandledrejection", onRejection);
        };
    }, [showError]);

    useEffect(() => {
        const timeouts = timeoutsRef.current;
        return () => {
            timeouts.forEach(clearTimeout);
            timeouts.clear();
        };
    }, []);

    const value = useMemo(
        () => ({ showToast, showError, dismissToast }),
        [showToast, showError, dismissToast],
    );

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div className="fixed bottom-4 right-4 z-[60] flex flex-col-reverse gap-3 pointer-events-none">
                <AnimatePresence initial={false}>
                    {toasts.map((t) => (
                        <Toast
                            key={t.id}
                            message={t.message}
                            variant={t.variant}
                            action={
                                t.action && {
                                    label: t.action.label,
                                    onClick: () => {
                                        t.action.onClick();
                                        dismissToast(t.id);
                                    },
                                }
                            }
                            onDismiss={() => dismissToast(t.id)}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used within a ToastProvider");
    return ctx;
};

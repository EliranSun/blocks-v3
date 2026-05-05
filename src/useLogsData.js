import { useCallback, useEffect, useState } from "react";
import { useToast } from "./ToastContext.jsx";

const API_URL = "https://walak.vercel.app/api/logs";

export const useLogsData = () => {
    const [logs, setLogs] = useState([]);
    const { showError } = useToast();

    useEffect(() => {
        fetch(API_URL)
            .then(res => {
                if (!res.ok) throw new Error("Failed to load logs");
                return res.json();
            })
            .then(setLogs)
            .catch(() => showError("Couldn't load your blocks.", { reloadable: true }));
    }, [showError]);

    const addLog = useCallback(data => {
        fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        })
            .then(res => {
                if (!res.ok) throw new Error("Failed to add log");
                return res.json();
            })
            .then(createdLog => setLogs(prev => [...prev, createdLog]))
            .catch(() => showError("Couldn't save your block. Try again."));
    }, [showError]);

    const editLog = useCallback((id, data) => {
        fetch(API_URL, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, ...data })
        })
            .then(res => {
                if (!res.ok) throw new Error("Failed to edit log");
                return res.json();
            })
            .then(() => setLogs(prev => prev.map(log => log._id === id ? { ...log, ...data } : log)))
            .catch(() => showError("Update failed. Your changes weren't saved."));
    }, [showError]);

    const deleteLog = useCallback(id => {
        fetch(`${API_URL}?id=${encodeURIComponent(id)}`, {
            method: "DELETE"
        })
            .then(res => {
                if (!res.ok) throw new Error("Failed to delete log");
                return res.json();
            })
            .then(() => setLogs(prev => prev.filter(log => log._id !== id)))
            .catch(() => showError("Couldn't delete. Try again."));
    }, [showError]);

    return { logs, addLog, editLog, deleteLog };
}

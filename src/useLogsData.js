import { useCallback, useEffect, useState } from "react";
import { useToast } from "./ToastContext.jsx";

const API_URL = "https://walak.vercel.app/api/logs";

export const useLogsData = () => {
    const [logs, setLogs] = useState([]);
    const { showError } = useToast();

    useEffect(() => {
        let response;
        fetch(API_URL)
            .then(res => {
                response = res;
                if (!res.ok) {
                    return res.text().then(body => {
                        const err = new Error(`Failed to load logs: ${res.status} ${res.statusText}`);
                        err.status = res.status;
                        err.statusText = res.statusText;
                        err.body = body;
                        err.url = res.url;
                        throw err;
                    });
                }
                return res.json();
            })
            .then(setLogs)
            .catch(err => {
                const details = {
                    url: err.url || API_URL,
                    status: err.status ?? response?.status ?? "—",
                    statusText: err.statusText ?? response?.statusText ?? "—",
                    name: err.name,
                    message: err.message,
                    body: err.body,
                    timestamp: new Date().toISOString(),
                };
                showError("Couldn't load your blocks.", { reloadable: true, details });
            });
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

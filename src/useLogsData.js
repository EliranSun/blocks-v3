import { useCallback, useEffect, useState } from "react";

const API_URL = "https://walak.vercel.app/api/logs";

export const useLogsData = () => {
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        fetch(API_URL)
            .then(res => res.json())
            .then(setLogs)
            .catch(console.error);
    }, []);

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
            .then(() => setLogs(prev => [...prev, data]))
            .catch(console.error);
    }, []);

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
            .catch(console.error);
    }, []);

    const deleteLog = useCallback(id => {
        fetch(`${API_URL}?id=${encodeURIComponent(id)}`, {
            method: "DELETE"
        })
            .then(res => { if (res.ok) res.json() })
            .then(() => setLogs(prev => prev.filter(log => log._id !== id)))
            .catch(console.error);
    }, []);

    return { logs, addLog, editLog, deleteLog };
}
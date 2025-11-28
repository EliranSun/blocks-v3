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

    const addLog = useCallback(({ date, name, category, subcategory, location, note, endDate }) => {
        fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({
                date,
                name,
                category,
                subcategory,
                location,
                note,
                endDate
            })
        })
            .then(res => res.json())
            .then(console.log)
            .catch(console.error);
    }, []);

    return { logs, addLog };
}
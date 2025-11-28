import { useEffect } from "react";

const API_URL = "https://walak.vercel.app/api/logs?date=2025-11-27";

export const useLogsData = () => {
    useEffect(() => {
        fetch(API_URL)
            .then(res => res.json())
            .then(results => console.log({ results }))
            .catch(error => console.error(error));
    }, []);
}
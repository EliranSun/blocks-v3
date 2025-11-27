import { useEffect } from "react";

const API_URL = "https://walak-next-ehwpx9w7q-indian-monkeys.vercel.app/api/logs";

export const useLogsData = () => {
    useEffect(() => {
        fetch(API_URL)
            .then(res => res.json())
            .then(results => console.log({ results }))
            .catch(error => console.error(error));
    }, []);
}
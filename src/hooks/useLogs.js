import { useCallback } from 'react';

const useLogs = () => {
  const updateLog = useCallback(async (id, updatedData) => {
    const response = await fetch(`/api/logs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData),
    });
    if (!response.ok) {
      throw new Error('Failed to update log');
    }
    return await response.json();
  }, []);

  const deleteLog = useCallback(async (id) => {
    const response = await fetch(`/api/logs/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete log');
    }
  }, []);

  return { updateLog, deleteLog };
};

export default useLogs;
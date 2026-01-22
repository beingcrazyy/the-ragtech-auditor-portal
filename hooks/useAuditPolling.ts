import { useState, useEffect, useRef } from 'react';
import { Audit, AuditRunStatus } from '../types';
import { api } from '../services/mockData';

export const useAuditPolling = (auditId: string | null) => {
    const [audit, setAudit] = useState<Audit | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        // Reset state when auditId changes or is removed
        if (!auditId) {
            setAudit(null);
            if (intervalRef.current) clearInterval(intervalRef.current);
            return;
        }

        const poll = async () => {
            try {
                const data = await api.getAudit(auditId);
                if (data) {
                    setAudit(data);
                    
                    // Stop polling if complete or failed
                    if (data.status === AuditRunStatus.COMPLETED || data.status === AuditRunStatus.FAILED) {
                        if (intervalRef.current) {
                            clearInterval(intervalRef.current);
                            intervalRef.current = null;
                        }
                    }
                }
            } catch (e) {
                console.error("Polling error:", e);
            }
        };

        // Immediate fetch
        poll();
        
        // Start polling every 2 seconds
        intervalRef.current = setInterval(poll, 2000);

        // Cleanup on unmount or id change
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [auditId]);

    return { audit };
};
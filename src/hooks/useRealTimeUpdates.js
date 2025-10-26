import { useState, useEffect, useCallback, useRef } from 'react';

export const useRealTimeUpdates = (refetchFunction) => {
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [newUpdatesCount, setNewUpdatesCount] = useState(0);
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date());
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  
  const intervalRef = useRef(null);
  const lastDataHashRef = useRef(null);

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefreshEnabled && refetchFunction) {
      intervalRef.current = setInterval(async () => {
        try {
          setConnectionStatus('checking');
          const result = await refetchFunction();
          
          // Simple hash to detect changes
          const dataHash = JSON.stringify(result?.data || result);
          if (lastDataHashRef.current && lastDataHashRef.current !== dataHash) {
            setNewUpdatesCount(prev => prev + 1);
          }
          lastDataHashRef.current = dataHash;
          
          setConnectionStatus('connected');
          setLastUpdateTime(new Date());
        } catch (error) {
          console.error('Auto-refresh failed:', error);
          setConnectionStatus('error');
        }
      }, 30000); // Refresh every 30 seconds

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [autoRefreshEnabled, refetchFunction]);

  // Manual refresh
  const manualRefresh = useCallback(async () => {
    if (!refetchFunction) return;
    
    try {
      setConnectionStatus('refreshing');
      await refetchFunction();
      setConnectionStatus('connected');
      setLastUpdateTime(new Date());
      setNewUpdatesCount(0);
    } catch (error) {
      console.error('Manual refresh failed:', error);
      setConnectionStatus('error');
      throw error;
    }
  }, [refetchFunction]);

  // Toggle auto-refresh
  const toggleAutoRefresh = useCallback(() => {
    setAutoRefreshEnabled(prev => !prev);
  }, []);

  // Clear new updates notification
  const clearNewUpdates = useCallback(() => {
    setNewUpdatesCount(0);
  }, []);

  // Check connection status
  const checkConnection = useCallback(async () => {
    try {
      setConnectionStatus('checking');
      // Simple connectivity check
      const response = await fetch('/api/health', { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      
      if (response.ok) {
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('error');
      }
    } catch (error) {
      setConnectionStatus('error');
    }
  }, []);

  // Initialize connection check
  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setConnectionStatus('connected');
      if (autoRefreshEnabled) {
        manualRefresh();
      }
    };

    const handleOffline = () => {
      setConnectionStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [autoRefreshEnabled, manualRefresh]);

  // Format last update time
  const getLastUpdateText = useCallback(() => {
    const now = new Date();
    const diffMs = now - lastUpdateTime;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    return lastUpdateTime.toLocaleDateString();
  }, [lastUpdateTime]);

  return {
    connectionStatus,
    newUpdatesCount,
    lastUpdateTime,
    autoRefreshEnabled,
    manualRefresh,
    toggleAutoRefresh,
    clearNewUpdates,
    checkConnection,
    getLastUpdateText
  };
};
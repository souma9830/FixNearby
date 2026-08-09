import React from 'react';
import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';

const SocketStatusBanner = ({ status = 'connected', pendingCount = 0 }) => {
  if (status === 'connected') return null;

  return (
    <div className={`w-full py-2 px-4 flex items-center justify-between text-xs font-medium ${
      status === 'reconnecting' 
        ? 'bg-amber-500 text-white' 
        : 'bg-rose-600 text-white'
    }`}>
      <div className="flex items-center gap-2">
        {status === 'reconnecting' ? (
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <WifiOff className="w-3.5 h-3.5" />
        )}
        <span>
          {status === 'reconnecting'
            ? 'Reconnecting to real-time service...'
            : 'You are offline. Real-time updates paused.'}
        </span>
      </div>
      {pendingCount > 0 && (
        <span className="bg-black/20 px-2 py-0.5 rounded text-white font-mono">
          {pendingCount} queued
        </span>
      )}
    </div>
  );
};

export default SocketStatusBanner;

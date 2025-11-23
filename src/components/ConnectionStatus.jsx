import { Wifi, WifiOff, RefreshCw, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const ConnectionStatus = ({ 
  status, 
  lastUpdateTime, 
  newUpdatesCount, 
  autoRefreshEnabled,
  onManualRefresh,
  onToggleAutoRefresh,
  onClearUpdates,
  getLastUpdateText
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          label: 'Connected'
        };
      case 'checking':
      case 'refreshing':
        return {
          icon: RefreshCw,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          label: status === 'checking' ? 'Checking...' : 'Refreshing...',
          animate: true
        };
      case 'offline':
        return {
          icon: WifiOff,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          label: 'Offline'
        };
      case 'error':
        return {
          icon: AlertCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          label: 'Connection Error'
        };
      default:
        return {
          icon: Wifi,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          label: 'Unknown'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className={`
      flex items-center space-x-3 px-3 py-2 rounded-lg border
      ${config.bgColor} ${config.borderColor}
    `}>
      {/* Status Icon */}
      <div className="flex items-center space-x-2">
        <Icon className={`
          w-4 h-4 ${config.color}
          ${config.animate ? 'animate-spin' : ''}
        `} />
        <span className={`text-sm font-medium ${config.color}`}>
          {config.label}
        </span>
      </div>

      {/* Last Update Time */}
      {status === 'connected' && lastUpdateTime && (
        <div className="flex items-center space-x-1 text-xs text-gray-500">
          <Clock className="w-3 h-3" />
          <span>{getLastUpdateText()}</span>
        </div>
      )}

      {/* New Updates Badge */}
      {newUpdatesCount > 0 && (
        <button
          onClick={onClearUpdates}
          className="flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs hover:bg-blue-200"
          title="Click to clear notifications"
        >
          <span>{newUpdatesCount} new</span>
        </button>
      )}

      {/* Controls */}
      <div className="flex items-center space-x-2">
        {/* Manual Refresh */}
        <button
          onClick={onManualRefresh}
          disabled={status === 'checking' || status === 'refreshing'}
          className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Manual refresh"
        >
          <RefreshCw className={`w-4 h-4 ${
            status === 'checking' || status === 'refreshing' ? 'animate-spin' : ''
          }`} />
        </button>

        {/* Auto Refresh Toggle */}
        <button
          onClick={onToggleAutoRefresh}
          className={`
            px-2 py-1 text-xs rounded border transition-colors
            ${autoRefreshEnabled 
              ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200' 
              : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
            }
          `}
          title={`Auto-refresh is ${autoRefreshEnabled ? 'enabled' : 'disabled'}`}
        >
          Auto: {autoRefreshEnabled ? 'ON' : 'OFF'}
        </button>
      </div>
    </div>
  );
};

export default ConnectionStatus;

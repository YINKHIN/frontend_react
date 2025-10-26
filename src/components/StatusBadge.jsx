import { AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';

const StatusBadge = ({ status, size = 'sm', showIcon = true, className = '' }) => {
  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle,
          label: 'Completed'
        };
      case 'draft':
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: Clock,
          label: 'Draft'
        };
      case 'expired':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: XCircle,
          label: 'Expired'
        };
      case 'partial':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: AlertTriangle,
          label: 'Partial'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: Clock,
          label: 'Unknown'
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;
  
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <span 
      className={`
        inline-flex items-center font-medium rounded-full border
        ${config.color} 
        ${sizeClasses[size]} 
        ${className}
      `}
      title={`Status: ${config.label}`}
    >
      {showIcon && (
        <Icon className={`${iconSizes[size]} mr-1.5`} />
      )}
      {config.label}
    </span>
  );
};

export default StatusBadge;
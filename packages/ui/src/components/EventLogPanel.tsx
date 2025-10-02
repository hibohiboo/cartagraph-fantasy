import React from 'react';

export interface EventLogEntry {
  id: string;
  timestamp: string;
  type: 'system' | 'player' | 'gm' | 'dice';
  actor?: string;
  message: string;
}

export interface EventLogPanelProps {
  events: EventLogEntry[];
  maxHeight?: string;
}

export const EventLogPanel: React.FC<EventLogPanelProps> = ({
  events,
  maxHeight = '400px',
}) => {
  const getEventTypeColor = (type: EventLogEntry['type']) => {
    switch (type) {
      case 'system':
        return 'text-gray-600 bg-gray-50';
      case 'player':
        return 'text-blue-700 bg-blue-50';
      case 'gm':
        return 'text-purple-700 bg-purple-50';
      case 'dice':
        return 'text-green-700 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-900">イベントログ</h3>
      </div>

      <div
        className="overflow-y-auto p-4 space-y-2"
        style={{ maxHeight }}
      >
        {events.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            まだイベントがありません
          </div>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className={`p-3 rounded-md ${getEventTypeColor(event.type)}`}
            >
              <div className="flex items-start gap-2">
                <span className="text-xs font-medium text-gray-500 mt-0.5">
                  {formatTimestamp(event.timestamp)}
                </span>
                <div className="flex-1">
                  {event.actor && (
                    <span className="font-semibold mr-2">{event.actor}:</span>
                  )}
                  <span className="text-sm">{event.message}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

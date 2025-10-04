import React, { useState, useMemo } from 'react';

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
  /** フィルタ機能を有効にする */
  enableFilter?: boolean;
  /** 検索機能を有効にする */
  enableSearch?: boolean;
}

export const EventLogPanel: React.FC<EventLogPanelProps> = ({
  events,
  maxHeight = '400px',
  enableFilter = true,
  enableSearch = true,
}) => {
  const [selectedTypes, setSelectedTypes] = useState<
    Set<EventLogEntry['type']>
  >(new Set(['system', 'player', 'gm', 'dice']));
  const [searchQuery, setSearchQuery] = useState('');

  // フィルタと検索を適用
  const filteredEvents = useMemo(
    () =>
      events.filter((event) => {
        // 型フィルタ
        if (!selectedTypes.has(event.type)) {
          return false;
        }
        // 検索フィルタ
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const matchMessage = event.message.toLowerCase().includes(query);
          const matchActor = event.actor?.toLowerCase().includes(query);
          return matchMessage || matchActor;
        }
        return true;
      }),
    [events, selectedTypes, searchQuery],
  );

  const toggleTypeFilter = (type: EventLogEntry['type']) => {
    const newTypes = new Set(selectedTypes);
    if (newTypes.has(type)) {
      newTypes.delete(type);
    } else {
      newTypes.add(type);
    }
    setSelectedTypes(newTypes);
  };
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

  const getEventTypeLabel = (type: EventLogEntry['type']): string => {
    switch (type) {
      case 'system':
        return 'システム';
      case 'player':
        return 'プレイヤー';
      case 'gm':
        return 'GM';
      case 'dice':
        return 'ダイス';
      default:
        return '';
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

        {/* 検索バー */}
        {enableSearch && (
          <div className="mt-3">
            <input
              type="text"
              placeholder="メッセージを検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {/* タイプフィルタ */}
        {enableFilter && (
          <div className="mt-3 flex flex-wrap gap-2">
            {(['system', 'player', 'gm', 'dice'] as const).map((type) => (
              <button
                key={type}
                onClick={() => toggleTypeFilter(type)}
                className={`
                  px-3 py-1 rounded-full text-sm font-medium transition-all
                  ${
                    selectedTypes.has(type)
                      ? `${getEventTypeColor(type)} opacity-100`
                      : 'bg-gray-200 text-gray-400 opacity-50'
                  }
                `}
              >
                {getEventTypeLabel(type)}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="overflow-y-auto p-4 space-y-2" style={{ maxHeight }}>
        {filteredEvents.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            {events.length === 0
              ? 'まだイベントがありません'
              : 'フィルタ条件に一致するイベントがありません'}
          </div>
        ) : (
          filteredEvents.map((event) => (
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

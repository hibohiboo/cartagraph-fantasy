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

// イベントタイプの色定義
const EVENT_TYPE_COLORS: Record<EventLogEntry['type'], string> = {
  system: 'text-gray-600 bg-gray-50',
  player: 'text-blue-700 bg-blue-50',
  gm: 'text-purple-700 bg-purple-50',
  dice: 'text-green-700 bg-green-50',
};

// イベントタイプのラベル定義
const EVENT_TYPE_LABELS: Record<EventLogEntry['type'], string> = {
  system: 'システム',
  player: 'プレイヤー',
  gm: 'GM',
  dice: 'ダイス',
};

// イベントフィルタリングロジックを分離したカスタムフック
function useEventFilter(
  events: EventLogEntry[],
  selectedTypes: Set<EventLogEntry['type']>,
  searchQuery: string
) {
  return useMemo(() => events.filter((event) => {
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
    }), [events, selectedTypes, searchQuery]);
}

// タイムスタンプフォーマット関数
function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// フィルタボタンコンポーネント
const FilterButtons: React.FC<{
  selectedTypes: Set<EventLogEntry['type']>;
  onToggle: (type: EventLogEntry['type']) => void;
}> = ({ selectedTypes, onToggle }) => {
  const types: EventLogEntry['type'][] = ['system', 'player', 'gm', 'dice'];

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {types.map((type) => (
        <button
          key={type}
          onClick={() => onToggle(type)}
          className={`
            px-3 py-1 rounded-full text-sm font-medium transition-all
            ${
              selectedTypes.has(type)
                ? `${EVENT_TYPE_COLORS[type]} opacity-100`
                : 'bg-gray-200 text-gray-400 opacity-50'
            }
          `}
        >
          {EVENT_TYPE_LABELS[type]}
        </button>
      ))}
    </div>
  );
};

// イベントアイテムコンポーネント
const EventItem: React.FC<{ event: EventLogEntry }> = ({ event }) => (
  <div className={`p-3 rounded-md ${EVENT_TYPE_COLORS[event.type]}`}>
    <div className="flex items-start gap-2">
      <span className="text-xs font-medium text-gray-500 mt-0.5">
        {formatTimestamp(event.timestamp)}
      </span>
      <div className="flex-1">
        {event.actor && <span className="font-semibold mr-2">{event.actor}:</span>}
        <span className="text-sm">{event.message}</span>
      </div>
    </div>
  </div>
);

// フィルタヘッダーコンポーネント
const FilterHeader: React.FC<{
  enableSearch: boolean;
  enableFilter: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTypes: Set<EventLogEntry['type']>;
  onToggleFilter: (type: EventLogEntry['type']) => void;
}> = ({ enableSearch, enableFilter, searchQuery, onSearchChange, selectedTypes, onToggleFilter }) => (
  <div className="px-6 py-4 border-b border-gray-200">
    <h3 className="text-xl font-bold text-gray-900">イベントログ</h3>
    {enableSearch && (
      <div className="mt-3">
        <input
          type="text"
          placeholder="メッセージを検索..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    )}
    {enableFilter && <FilterButtons selectedTypes={selectedTypes} onToggle={onToggleFilter} />}
  </div>
);

// イベントリストコンポーネント
const EventList: React.FC<{
  filteredEvents: EventLogEntry[];
  hasEvents: boolean;
  maxHeight: string;
}> = ({ filteredEvents, hasEvents, maxHeight }) => (
  <div className="overflow-y-auto p-4 space-y-2" style={{ maxHeight }}>
    {filteredEvents.length === 0 ? (
      <div className="text-center text-gray-500 py-8">
        {hasEvents ? 'フィルタ条件に一致するイベントがありません' : 'まだイベントがありません'}
      </div>
    ) : (
      filteredEvents.map((event) => <EventItem key={event.id} event={event} />)
    )}
  </div>
);

export function EventLogPanel(props: EventLogPanelProps) {
  const { events, maxHeight = '400px', enableFilter = true, enableSearch = true } = props;

  const [selectedTypes, setSelectedTypes] = useState<Set<EventLogEntry['type']>>(
    new Set(['system', 'player', 'gm', 'dice'])
  );
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEvents = useEventFilter(events, selectedTypes, searchQuery);

  const toggleTypeFilter = (type: EventLogEntry['type']) => {
    const newTypes = new Set(selectedTypes);
    if (newTypes.has(type)) {
      newTypes.delete(type);
    } else {
      newTypes.add(type);
    }
    setSelectedTypes(newTypes);
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      <FilterHeader
        enableSearch={enableSearch}
        enableFilter={enableFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedTypes={selectedTypes}
        onToggleFilter={toggleTypeFilter}
      />
      <EventList filteredEvents={filteredEvents} hasEvents={events.length > 0} maxHeight={maxHeight} />
    </div>
  );
}

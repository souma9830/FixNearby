import { useState } from 'react';
import { Search, MessageSquare, Wifi, WifiOff, BadgeCheck } from 'lucide-react';

const ChatSidebar = ({ conversations, activeConversation, onSelectConversation, connected }) => {
  const [search, setSearch] = useState('');

  const filtered = conversations.filter((c) =>
    c.participant.toLowerCase().includes(search.toLowerCase()) ||
    (c.lastMessage && c.lastMessage.toLowerCase().includes(search.toLowerCase())) ||
    (c.serviceCategory && c.serviceCategory.toLowerCase().includes(search.toLowerCase()))
  );

  const formatRelativeTime = (date) => {
    const now = Date.now();
    const diff = now - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="flex w-80 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-slate-900">Messages</h2>
          <div className="flex items-center gap-1.5">
            {connected ? (
              <Wifi size={14} className="text-emerald-500" />
            ) : (
              <WifiOff size={14} className="text-rose-500" />
            )}
            <span className={`text-xs ${connected ? 'text-emerald-600' : 'text-rose-600'}`}>
              {connected ? 'Connected' : 'Offline'}
            </span>
          </div>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageSquare size={32} className="mb-2 text-slate-300" />
            <p className="text-sm text-slate-500">No conversations yet</p>
            <p className="text-xs text-slate-400 mt-1">Book a service to start chatting</p>
          </div>
        )}
        {filtered.length === 0 && search && (
          <div className="py-8 text-center">
            <p className="text-sm text-slate-500">No results for &quot;{search}&quot;</p>
          </div>
        )}
        {filtered.map((conv) => (
          <button
            key={conv.id}
            onClick={() => onSelectConversation(conv.id)}
            className={`flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-50 ${
              activeConversation === conv.id ? 'bg-blue-50' : ''
            }`}
          >
            <div className="relative shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                {conv.participant.charAt(0)}
              </div>
              <span
                className={`absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white ${
                  conv.online ? 'bg-emerald-500 shadow-xs' : 'bg-slate-300'
                }`}
                title={conv.online ? 'Active now' : 'Offline'}
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-sm font-semibold text-slate-900 truncate">
                    {conv.participant}
                  </span>
                  {conv.isVerified && (
                    <BadgeCheck className="ml-1 h-4 w-4 shrink-0 text-cyan-500" />
                  )}
                </div>
                <span className="shrink-0 text-[10px] text-slate-400">
                  {formatRelativeTime(conv.timestamp)}
                </span>
              </div>
              <p className="truncate text-xs text-slate-500">{conv.role}</p>
              <p className="truncate text-xs text-slate-400 mt-0.5">{conv.lastMessage}</p>
            </div>
            {conv.unread > 0 && (
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                {conv.unread}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChatSidebar;

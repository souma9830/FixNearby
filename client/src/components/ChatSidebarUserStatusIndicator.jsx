

export const ChatSidebarUserStatusIndicator = ({ isOnline, lastActive }) => {
  return (
    <div className="status-indicator flex items-center gap-2">
      <span className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
      <span className="text-xs text-gray-500">{isOnline ? 'Active Now' : `Last seen ${lastActive || 'recently'}`}</span>
    </div>
  );
};

export default ChatSidebarUserStatusIndicator;

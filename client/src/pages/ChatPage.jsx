import { useEffect, useState } from 'react';
import useDocumentTitle from '../hooks/useDocumentTitle';
import ChatWindow from '../components/ChatWindow';
import ChatSidebar from '../components/ChatSidebar';
import { connectSocket, disconnectSocket, onPresenceUpdate } from '../services/socketService';

const MOCK_CONVERSATIONS = [
  { id: 'conv1', participant: 'John Doe', role: 'Electrician', lastMessage: 'I can come by tomorrow at 2pm', timestamp: new Date(Date.now() - 300000), unread: 2, online: true, isVerified: true },
  { id: 'conv2', participant: 'Jane Smith', role: 'Plumber', lastMessage: 'Thanks for the quick response!', timestamp: new Date(Date.now() - 7200000), unread: 0, online: false, isVerified: false },
  { id: 'conv3', participant: 'Mike Johnson', role: 'Carpenter', lastMessage: 'The materials will cost around $50', timestamp: new Date(Date.now() - 86400000), unread: 1, online: true, isVerified: true },
];

const MOCK_MESSAGES = {
  conv1: [
    { id: 'm1', senderId: 'worker1', text: 'Hi! I received your booking request.', timestamp: new Date(Date.now() - 600000), isOwn: false },
    { id: 'm2', senderId: 'user', text: 'Great! When are you available?', timestamp: new Date(Date.now() - 500000), isOwn: true },
    { id: 'm3', senderId: 'worker1', text: 'I can come by tomorrow at 2pm', timestamp: new Date(Date.now() - 400000), isOwn: false },
    { id: 'm4', senderId: 'worker1', text: 'Does that work for you?', timestamp: new Date(Date.now() - 300000), isOwn: false },
  ],
  conv2: [
    { id: 'm5', senderId: 'user', text: 'Thanks for fixing the pipe so quickly!', timestamp: new Date(Date.now() - 8000000), isOwn: true },
    { id: 'm6', senderId: 'worker2', text: 'Youre welcome! Happy to help.', timestamp: new Date(Date.now() - 7500000), isOwn: false },
    { id: 'm7', senderId: 'worker2', text: 'Thanks for the quick response!', timestamp: new Date(Date.now() - 7200000), isOwn: false },
  ],
  conv3: [
    { id: 'm8', senderId: 'worker3', text: 'I checked the wardrobe measurements.', timestamp: new Date(Date.now() - 90000000), isOwn: false },
    { id: 'm9', senderId: 'worker3', text: 'The materials will cost around $50', timestamp: new Date(Date.now() - 86400000), isOwn: false },
  ],
};

const ChatPage = () => {
  const [activeConversation, setActiveConversation] = useState('conv1');
  const [conversations, setConversations] = useState(MOCK_CONVERSATIONS);
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [connected, setConnected] = useState(false);

  useDocumentTitle('Chat');

  useEffect(() => {
    const raw = localStorage.getItem('fixnearby_user');
    let token = '';
    if (raw) {
      try {
        const userData = JSON.parse(raw);
        token = userData?.token || '';
      } catch {}
    }

    if (token) {
      const socket = connectSocket(token);
      setConnected(socket?.connected || false);

      socket?.on('connect', () => setConnected(true));
      socket?.on('disconnect', () => setConnected(false));
    }

    const cleanupPresence = onPresenceUpdate((data) => {
      setConversations(prev =>
        prev.map(c =>
          c.id === data.conversationId
            ? { ...c, online: data.online }
            : c
        )
      );
    });

    return () => {
      cleanupPresence();
      disconnectSocket();
    };
  }, []);

  const handleSelectConversation = (convId) => {
    setActiveConversation(convId);
    setConversations(prev =>
      prev.map(c =>
        c.id === convId ? { ...c, unread: 0 } : c
      )
    );

    if (!messages[convId]) {
      setMessages(prev => ({
        ...prev,
        [convId]: MOCK_MESSAGES[convId] || [],
      }));
    }
  };

  const handleSendMessage = (text) => {
    if (!activeConversation || typeof text !== 'string' || !text.trim()) return;

    const sanitized = text
      .trim()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');

    const newMsg = {
      id: `msg-${Date.now()}`,
      senderId: 'user',
      text: sanitized,
      timestamp: new Date(),
      isOwn: true,
    };

    setMessages(prev => ({
      ...prev,
      [activeConversation]: [...(prev[activeConversation] || []), newMsg],
    }));

    setConversations(prev =>
      prev.map(c =>
        c.id === activeConversation
          ? { ...c, lastMessage: sanitized, timestamp: new Date() }
          : c
      )
    );
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-6xl px-4 py-4">
      <div className="flex w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <ChatSidebar
          conversations={conversations}
          activeConversation={activeConversation}
          onSelectConversation={handleSelectConversation}
          connected={connected}
        />
        <ChatWindow
          conversation={conversations.find(c => c.id === activeConversation)}
          messages={messages[activeConversation] || []}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
};

export default ChatPage;

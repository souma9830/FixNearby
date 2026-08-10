import { useEffect, useRef, useState } from 'react';
import {
  Send,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Image as ImageIcon,
  Check,
  CheckCheck,
  BadgeCheck,
  ShieldCheck,
  MapPin,
  Search,
  X,
  Download,
  Maximize2,
  UploadCloud,
} from 'lucide-react';
import ChatAttachmentModal from './chat/ChatAttachmentModal';

const ChatWindow = ({ conversation, messages, onSendMessage, isTyping }) => {
  const [input, setInput] = useState('');
  const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);
  const [modalFileType, setModalFileType] = useState('all');
  const [activeLightboxImage, setActiveLightboxImage] = useState(null);
  const [isDragOverWindow, setIsDragOverWindow] = useState(false);
  const [showVerifiedTooltip, setShowVerifiedTooltip] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [conversation?.id]);

  const handleWindowDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOverWindow(true);
  };

  const handleWindowDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOverWindow(false);
  };

  const handleWindowDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOverWindow(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setModalFileType('image');
      setIsAttachmentModalOpen(true);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSendAttachment = (attachmentData) => {
    if (onSendMessage) {
      onSendMessage(`[Attachment: ${attachmentData.fileName || 'File'}]`, attachmentData);
    }
  };

  const handleShareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const locText = `📍 Shared Location: https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`;
          onSendMessage(locText);
        },
        () => {
          onSendMessage('📍 Shared Location: Local Service Area');
        }
      );
    } else {
      onSendMessage('📍 Shared Location: Local Service Area');
    }
  };

  if (!conversation) {
    return (
      <div className="flex flex-1 items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-200">
            <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-700">Select a conversation</h3>
          <p className="text-sm text-slate-500">Choose a conversation from the sidebar to start chatting</p>
        </div>
      </div>
    );
  }

  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const filteredMessages = searchQuery
    ? messages.filter((m) => m.text && m.text.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  return (
    <div
      onDragOver={handleWindowDragOver}
      onDragLeave={handleWindowDragLeave}
      onDrop={handleWindowDrop}
      className="relative flex flex-1 flex-col"
    >
      {/* Drag & Drop Visual Overlay Zone */}
      {isDragOverWindow && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-blue-600/90 text-white backdrop-blur-xs border-4 border-dashed border-white rounded-xl transition-all animate-in fade-in duration-200">
          <UploadCloud className="w-16 h-16 mb-2 animate-bounce" />
          <h3 className="text-xl font-bold">Drop Image to Upload</h3>
          <p className="text-sm opacity-90">Release file anywhere in the chat window</p>
        </div>
      )}

      {/* Active Conversation Header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-3 bg-white z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
              {conversation.participant.charAt(0)}
            </div>
            {conversation.online && (
              <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 relative">
              <h3 className="text-sm font-semibold text-slate-900">{conversation.participant}</h3>

              {/* Verified Badge Checkmark with Interactive Security Card Popover */}
              {conversation.isVerified && (
                <div className="relative flex items-center">
                  <button
                    type="button"
                    onMouseEnter={() => setShowVerifiedTooltip(true)}
                    onMouseLeave={() => setShowVerifiedTooltip(false)}
                    onClick={() => setShowVerifiedTooltip((prev) => !prev)}
                    className="focus:outline-none flex items-center"
                  >
                    <BadgeCheck className="h-4 w-4 shrink-0 text-cyan-500 hover:text-cyan-600 transition cursor-pointer" />
                  </button>

                  {/* Verified Details Popover Card */}
                  {showVerifiedTooltip && (
                    <div className="absolute top-6 left-0 z-30 w-64 rounded-xl border border-cyan-100 bg-white p-3.5 shadow-xl transition-all animate-in fade-in zoom-in-95 duration-150">
                      <div className="flex items-start gap-2.5">
                        <ShieldCheck className="h-5 w-5 text-cyan-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-slate-900">Verified Service Professional</p>
                          <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
                            Identity document and background check verified by FixNearby Accreditation Trust Team.
                          </p>
                          <div className="mt-2 flex items-center gap-1.5 text-[10px] font-semibold text-cyan-700 bg-cyan-50 px-2 py-1 rounded-md">
                            <span>✓ Identity Verified</span>
                            <span>•</span>
                            <span>✓ License Approved</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600 border border-blue-200">
                {conversation.serviceCategory || 'AC Repair Service'}
              </span>
            </div>
            <p className="text-xs text-slate-500">{conversation.role}</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          {showSearch ? (
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg px-2 py-1">
              <Search size={14} className="text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chat..."
                className="w-32 bg-transparent text-xs outline-none text-slate-700"
                autoFocus
              />
              <button onClick={() => { setSearchQuery(''); setShowSearch(false); }} className="text-slate-400 hover:text-slate-600">
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowSearch(true)}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              title="Search in conversation"
            >
              <Search size={18} />
            </button>
          )}

          <button type="button" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition" title="Call Provider">
            <Phone size={18} />
          </button>
          <button type="button" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition" title="Video Call">
            <Video size={18} />
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMenu((prev) => !prev)}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              title="More options"
            >
              <MoreVertical size={18} />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-10 z-20 w-44 rounded-xl border border-slate-200 bg-white py-1 shadow-lg text-xs">
                <button
                  type="button"
                  onClick={() => { handleShareLocation(); setShowMenu(false); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-slate-700 hover:bg-slate-50"
                >
                  <MapPin size={14} className="text-blue-500" /> Share Location
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto px-6 py-4 bg-slate-50/30">
        {filteredMessages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-slate-400">
              {searchQuery ? `No messages found matching "${searchQuery}"` : 'No messages yet. Start a conversation!'}
            </p>
          </div>
        )}
        <div className="space-y-3">
          {filteredMessages.map((msg) => {
            const hasImageAttachment =
              msg.attachment &&
              (msg.attachment.fileType?.startsWith('image/') ||
                /\.(jpg|jpeg|png|gif|webp)$/i.test(msg.attachment.fileUrl || msg.attachment.fileName || ''));

            return (
              <div
                key={msg.id || msg._id}
                className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm ${
                    msg.isOwn
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-slate-800 border border-slate-200/80'
                  }`}
                >
                  {/* Image Attachment Rendering */}
                  {hasImageAttachment && (
                    <div className="mb-2 relative group overflow-hidden rounded-xl border border-black/10">
                      <img
                        src={msg.attachment.fileUrl}
                        alt={msg.attachment.fileName || 'Chat attachment'}
                        className="max-h-60 w-full object-cover rounded-xl cursor-pointer hover:scale-102 transition duration-200"
                        onClick={() => setActiveLightboxImage(msg.attachment)}
                      />
                      <button
                        type="button"
                        onClick={() => setActiveLightboxImage(msg.attachment)}
                        className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-lg opacity-0 group-hover:opacity-100 transition backdrop-blur-xs"
                        title="View Fullscreen"
                      >
                        <Maximize2 size={14} />
                      </button>
                    </div>
                  )}

                  {msg.text && (
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                  )}

                  <div
                    className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
                      msg.isOwn ? 'text-blue-200' : 'text-slate-400'
                    }`}
                  >
                    <span>{formatTime(msg.timestamp || msg.createdAt)}</span>
                    {msg.isOwn && (
                      <span>
                        {msg.status === 'read' ? (
                          <CheckCheck size={12} className="text-emerald-300" />
                        ) : msg.status === 'delivered' ? (
                          <CheckCheck size={12} className="text-blue-200" />
                        ) : (
                          <Check size={12} className="text-blue-200" />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-white border border-slate-200 px-4 py-2 text-xs text-slate-500 italic animate-pulse shadow-sm">
                {conversation.participant} is typing...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Action Pills */}
      <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-medium shrink-0">Quick Actions:</span>
          {[
            'Hi, are you available for AC Repair today?',
            'Can you share price estimate?',
            '📍 Share Location',
            'Please call me when you reach.'
          ].map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                if (chip === '📍 Share Location') {
                  handleShareLocation();
                } else {
                  onSendMessage(chip);
                }
              }}
              className="shrink-0 rounded-full bg-white border border-slate-200 px-3 py-1 text-slate-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition shadow-xs"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Message Input Box */}
      <form onSubmit={handleSubmit} className="border-t border-slate-200 bg-white px-6 py-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => { setModalFileType('all'); setIsAttachmentModalOpen(true); }}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            title="Attach file"
          >
            <Paperclip size={18} />
          </button>
          <button
            type="button"
            onClick={() => { setModalFileType('image'); setIsAttachmentModalOpen(true); }}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 transition"
            title="Send image"
          >
            <ImageIcon size={18} />
          </button>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="rounded-xl bg-blue-600 p-2.5 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <Send size={18} />
          </button>
        </div>
      </form>

      <ChatAttachmentModal
        isOpen={isAttachmentModalOpen}
        onClose={() => setIsAttachmentModalOpen(false)}
        onSendAttachment={handleSendAttachment}
        initialFileType={modalFileType}
      />

      {/* Lightbox Fullscreen Modal */}
      {activeLightboxImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center justify-center">
            <button
              onClick={() => setActiveLightboxImage(null)}
              className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition"
              title="Close image view"
            >
              <X size={20} />
            </button>
            <img
              src={activeLightboxImage.fileUrl}
              alt={activeLightboxImage.fileName || 'Full image'}
              className="max-h-[80vh] max-w-full rounded-2xl object-contain shadow-2xl border border-white/10"
            />
            <div className="mt-4 flex items-center gap-4 bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800 text-xs text-white">
              <span className="font-semibold">{activeLightboxImage.fileName || 'Image Attachment'}</span>
              {activeLightboxImage.fileSize && (
                <span className="text-slate-400">({(activeLightboxImage.fileSize / 1024).toFixed(1)} KB)</span>
              )}
              <a
                href={activeLightboxImage.fileUrl}
                download={activeLightboxImage.fileName || 'attachment'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-semibold"
              >
                <Download size={14} /> Download
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;

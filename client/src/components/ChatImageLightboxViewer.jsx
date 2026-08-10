import React, { useState } from 'react';

export const ChatImageLightboxViewer = ({ imageUrl, altText = 'Chat attachment' }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!imageUrl) return null;

  return (
    <div className="chat-image-attachment-wrapper">
      <img 
        src={imageUrl} 
        alt={altText} 
        className="chat-thumbnail cursor-pointer rounded-lg hover:opacity-90 max-w-xs transition-opacity" 
        onClick={() => setIsOpen(true)}
      />
      {isOpen && (
        <div className="lightbox-overlay fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <button 
              className="absolute top-2 right-2 text-white bg-gray-800 rounded-full p-2 hover:bg-gray-700"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
            <img src={imageUrl} alt={altText} className="max-h-[85vh] object-contain rounded-md" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatImageLightboxViewer;

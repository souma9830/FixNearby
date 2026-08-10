import React, { useEffect, useState } from 'react';

let announceCallback = null;

export const announceToScreenReader = (message, priority = 'polite') => {
  if (announceCallback) {
    announceCallback(message, priority);
  }
};

const AriaAnnouncer = () => {
  const [announcement, setAnnouncement] = useState({ text: '', priority: 'polite' });

  useEffect(() => {
    announceCallback = (msg, priority = 'polite') => {
      setAnnouncement({ text: msg, priority });
      setTimeout(() => setAnnouncement({ text: '', priority: 'polite' }), 4000);
    };
    return () => {
      announceCallback = null;
    };
  }, []);

  return (
    <div
      className="sr-only font-mono text-[1px] opacity-0 pointer-events-none"
      role={announcement.priority === 'assertive' ? 'alert' : 'status'}
      aria-live={announcement.priority}
      aria-atomic="true"
    >
      {announcement.text}
    </div>
  );
};

export default AriaAnnouncer;

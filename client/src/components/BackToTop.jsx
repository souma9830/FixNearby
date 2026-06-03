import { useState, useEffect } from 'react';

const BackToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
       style={{ bottom: '116px', right: '48px' }}
       className="fixed z-[9998] w-10 h-10 bg-blue-600 hover:bg-blue-700 hover:scale-110 text-white rounded-full shadow-lg transition-all duration-300 flex items-center justify-center text-lg font-bold"
    >
      ↑
    </button>
  );
};

export default BackToTop;
import { useState, useRef, useEffect } from 'react';

const LazyImage = ({ src, alt, className, ...props }) => {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    if (imgRef.current) observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className={`overflow-hidden ${className || ''}`} {...props}>
      {!loaded && !inView && (
        <div className="w-full h-full bg-gray-200 animate-pulse" />
      )}
      {inView && (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setLoaded(true)}
          loading="lazy"
        />
      )}
    </div>
  );
};

export default LazyImage;

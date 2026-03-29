import { useEffect, useState } from 'react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

const ANIMATION_MS = 220;

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  footer,
  className = '',
}: DrawerProps) {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsVisible(true));
      });
    } else if (shouldRender) {
      setIsVisible(false);
      const timer = setTimeout(() => setShouldRender(false), ANIMATION_MS);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isOpen, shouldRender]);

  useEffect(() => {
    if (!shouldRender) return undefined;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [shouldRender, onClose]);

  if (!shouldRender) return null;

  return (
    <div className={`fixed inset-0 z-50 !mt-0 ${className}`}>
      <button
        type="button"
        aria-label="Close drawer"
        onClick={onClose}
        className={[
          'absolute inset-0 bg-black/30 transition-opacity duration-200',
          isVisible ? 'opacity-100' : 'opacity-0',
        ].join(' ')}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={[
          'absolute inset-0 flex flex-col bg-white transition-transform duration-200 ease-out',
          isVisible ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            type="button"
            aria-label="Close drawer"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 px-4 py-4">{children}</div>
        {footer && <div className="border-t border-gray-200 px-4 py-4">{footer}</div>}
      </section>
    </div>
  );
}

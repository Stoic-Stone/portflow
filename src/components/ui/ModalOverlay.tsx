import React from 'react';

interface ModalOverlayProps {
  children: React.ReactNode;
  onClose: () => void;
}

const ModalOverlay: React.FC<ModalOverlayProps> = ({ children, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full relative">
      {children}
      <button
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold"
        onClick={onClose}
        aria-label="Fermer"
        type="button"
      >
        ×
      </button>
    </div>
  </div>
);

export default ModalOverlay; 
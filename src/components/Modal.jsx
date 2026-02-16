import React, { useState } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, title, children, onClose, onSubmit, submitText = 'Submit', cancelText = 'Cancel' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {children}
        </div>

        <div className="flex gap-3 p-6 border-t border-gray-200 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            {cancelText}
          </button>
          {onSubmit && (
            <button
              onClick={onSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              {submitText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;

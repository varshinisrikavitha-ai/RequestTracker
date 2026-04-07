import React from 'react';

const TextArea = ({ label, placeholder, value, onChange, error, required, rows = 4, ...props }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">
        {label}
        {required && <span className="text-rose-500 ml-1">*</span>}
      </label>
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={rows}
        className={`w-full px-4 py-3 border rounded-2xl outline-none transition resize-none bg-white text-slate-900 placeholder-slate-400 shadow-sm ${
          error
            ? 'border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-100'
            : 'border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100'
        }`}
        {...props}
      />
      {error && <p className="text-rose-600 text-sm mt-2">{error}</p>}
    </div>
  );
};

export default TextArea;

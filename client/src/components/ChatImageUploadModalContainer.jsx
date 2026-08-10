import React, { useState } from 'react';

export const ChatImageUploadModalContainer = ({ onSendAttachment, onClose }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  return (
    <div className="upload-modal-container bg-white p-6 rounded-xl shadow-2xl border border-gray-200">
      <h3 className="text-lg font-semibold mb-4">Send Image Attachment</h3>
      <input type="file" accept="image/*" onChange={handleFileChange} className="mb-4" />
      {previewUrl && (
        <div className="preview-box mb-4 max-h-48 overflow-hidden rounded-lg">
          <img src={previewUrl} alt="Upload preview" className="object-cover w-full h-full" />
        </div>
      )}
      <div className="modal-actions flex justify-end gap-2">
        <button onClick={onClose} className="px-4 py-2 text-gray-600 border rounded-md">Cancel</button>
        <button 
          disabled={!selectedFile} 
          onClick={() => onSendAttachment(selectedFile)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
        >
          Send Image
        </button>
      </div>
    </div>
  );
};

export default ChatImageUploadModalContainer;

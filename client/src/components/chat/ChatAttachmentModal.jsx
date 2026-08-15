import  { useState } from 'react';
import {  X, UploadCloud, FileText, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import apiClient from '../../services/apiClient';

const ChatAttachmentModal = ({ isOpen, onClose, onSendAttachment, initialFileType = 'all' }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [imageMeta, setImageMeta] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(initialFileType === 'image' ? 'image' : 'all');

  if (!isOpen) return null;

  const processSelectedFile = (selected) => {
    if (!selected) return;

    if (selected.size > 10 * 1024 * 1024) {
      setError('File size exceeds the 10MB limit.');
      return;
    }

    if (activeTab === 'image' && !selected.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, WebP, GIF).');
      return;
    }

    setFile(selected);
    setError(null);

    if (selected.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        const img = new Image();
        img.onload = () => {
          setImageMeta({ width: img.width, height: img.height });
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(selected);
    } else {
      setPreview(null);
      setImageMeta(null);
    }
  };

  const handleFileChange = (e) => {
    processSelectedFile(e.target.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('attachment', file);

      const response = await apiClient.post('/attachments/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      onSendAttachment(response.data.attachment);
      handleResetAndClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload attachment.');
    } finally {
      setUploading(false);
    }
  };

  const handleResetAndClose = () => {
    setFile(null);
    setPreview(null);
    setImageMeta(null);
    setError(null);
    setIsDragging(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 transition-all">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-lg">
            <ImageIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>{activeTab === 'image' ? 'Send Image Attachment' : 'Send File Attachment'}</span>
          </div>
          <button onClick={handleResetAndClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Filters */}
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 mb-4">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'all'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            All Files
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('image')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1 ${
              activeTab === 'image'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Images Only
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
            isDragging
              ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30'
              : 'border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40'
          }`}
        >
          <input
            type="file"
            onChange={handleFileChange}
            className="hidden"
            id="chat-file-input"
            accept={activeTab === 'image' ? 'image/png, image/jpeg, image/webp, image/gif' : 'image/*,audio/*,.pdf,.doc,.docx,.txt'}
          />
          <label htmlFor="chat-file-input" className="cursor-pointer flex flex-col items-center">
            <UploadCloud className="w-10 h-10 text-indigo-500 mb-2" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {isDragging ? 'Drop your image file here' : activeTab === 'image' ? 'Click or drag image file here' : 'Click to select photo, audio, or document'}
            </span>
            <span className="text-xs text-slate-400 mt-1">
              {activeTab === 'image' ? 'PNG, JPG, WEBP, GIF up to 10MB' : 'PNG, JPG, MP3, PDF, DOCX up to 10MB'}
            </span>
          </label>
        </div>

        {file && (
          <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center space-x-3 truncate">
              {preview ? (
                <img src={preview} alt="Preview" className="w-12 h-12 object-cover rounded-lg border border-slate-200 dark:border-slate-700" />
              ) : (
                <FileText className="w-8 h-8 text-indigo-500" />
              )}
              <div className="truncate text-xs">
                <span className="font-bold text-slate-900 dark:text-white block truncate">{file.name}</span>
                <span className="text-slate-400">
                  {(file.size / 1024).toFixed(1)} KB {imageMeta ? `• ${imageMeta.width}x${imageMeta.height}px` : ''}
                </span>
              </div>
            </div>
            <button
              onClick={() => { setFile(null); setPreview(null); setImageMeta(null); }}
              className="p-1 text-slate-400 hover:text-rose-500 rounded-md transition"
              title="Remove selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="mt-6 flex space-x-3">
          <button
            onClick={handleResetAndClose}
            className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="flex-1 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl text-xs hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {uploading ? (
              <span>Uploading...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Send Attachment</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatAttachmentModal;

import { api } from '../../lib/api';
import { useState, useEffect } from 'react';
import { addToast } from '../../lib/toast';
import { Upload, File, Image, FileText, X, CheckCircle, Download, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../../components/PageHeader';
import { cn } from '../../lib/utils';

export default function UploadsPage() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploaded, setUploaded] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    // Load existing uploads
    api.get('/uploads').then((res) => {
      setUploaded(res.data.files || []);
    }).catch(() => {});
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles(e.dataTransfer.files);
    }
  };

  async function onUpload(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!files || files.length === 0) return;
    
    setUploading(true);
    const form = new FormData();
    Array.from(files).forEach((f) => form.append('files', f));
    
    try {
      const { data } = await api.post('/uploads', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploaded([...uploaded, ...data.files]);
      addToast(`${data.files.length} file(s) uploaded successfully`, 'success');
      setFiles(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Upload failed');
      addToast('Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  }

  const getFileIcon = (url: string) => {
    const ext = url.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) {
      return Image;
    }
    if (['pdf', 'doc', 'docx'].includes(ext || '')) {
      return FileText;
    }
    return File;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Media Library"
        description="Upload and manage your media files"
      />

      {/* Upload Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card card-padding"
      >
        <form onSubmit={onUpload}>
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={cn(
              'border-2 border-dashed rounded-2xl p-12 text-center transition-all',
              dragActive
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            )}
          >
            <Upload className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-bold mb-2">Drop files here or click to upload</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Support for images, documents, and other media files
            </p>
            <input
              type="file"
              multiple
              onChange={(e) => setFiles(e.target.files)}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="btn btn-primary cursor-pointer inline-flex"
            >
              <Upload className="w-4 h-4" />
              Select Files
            </label>
            {files && files.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">
                  {files.length} file(s) selected
                </p>
                <button
                  type="submit"
                  disabled={uploading}
                  className="btn btn-primary"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Upload Files
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </form>
        {error && (
          <div className="mt-4 p-4 rounded-xl bg-destructive/10 border-2 border-destructive/20 text-destructive text-sm font-medium">
            {error}
          </div>
        )}
      </motion.div>

      {/* Uploaded Files Grid */}
      {uploaded.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card card-padding"
        >
          <h3 className="text-xl font-bold mb-6">Uploaded Files</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <AnimatePresence>
              {uploaded.map((file, index) => {
                const FileIcon = getFileIcon(file.url);
                return (
                  <motion.div
                    key={file.url}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    className="group relative"
                  >
                    <div className="card card-padding card-hover p-4">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center">
                          <FileIcon className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <div className="text-center w-full">
                          <p className="text-xs font-medium truncate" title={file.filename || file.url}>
                            {file.filename || file.url.split('/').pop()}
                          </p>
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-primary hover:underline mt-1 inline-block"
                          >
                            View
                          </a>
                        </div>
                      </div>
                      <button
                        className="absolute top-2 right-2 btn btn-ghost btn-sm p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => {
                          setUploaded(uploaded.filter((f) => f.url !== file.url));
                          addToast('File removed from list', 'success');
                        }}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {uploaded.length === 0 && !uploading && (
        <div className="card card-padding text-center py-16">
          <File className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-lg font-semibold mb-2">No files uploaded yet</p>
          <p className="text-sm text-muted-foreground">
            Upload your first file to get started
          </p>
        </div>
      )}
    </div>
  );
}


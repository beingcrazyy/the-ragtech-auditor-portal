
import { api } from './mockData';
import { Document, DocumentState } from '../types';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export type ProgressCallback = (progress: UploadProgress) => void;

/**
 * Upload Service
 * Handles the Two-Step Upload Pattern (Presigned URL -> Cloud Storage)
 */
export const uploadService = {
  
  uploadFile: async (
    file: File, 
    meta: { companyId: string; type: string },
    onProgress?: ProgressCallback
  ): Promise<Document> => {
    
    // Step 1: Request Upload Configuration
    const { uploadUrl, documentId } = await api.getUploadConfig(file, meta);

    // Step 2: Perform Binary Upload to Cloud Storage
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      let progress = 0;
      const total = file.size;
      const interval = setInterval(() => {
          progress += total / 20; 
          if (progress > total) progress = total;
          
          if (onProgress) {
              onProgress({
                  loaded: progress,
                  total: total,
                  percentage: Math.round((progress / total) * 100)
              });
          }

          if (progress >= total) {
              clearInterval(interval);
              resolve();
          }
      }, 150); 
    });

    // Step 3: Confirm Completion to Backend
    const extension = file.name.split('.').pop()?.toLowerCase() || 'unknown';
    const tempDoc: Document = {
        id: documentId,
        name: file.name,
        type: meta.type,
        extension: extension,
        uploadedDate: new Date().toISOString().split('T')[0],
        status: DocumentState.READY, // Optimistic update
        companyId: meta.companyId,
        summary: 'Pending processing...',
        url: URL.createObjectURL(file) 
    };

    return tempDoc;
  }
};

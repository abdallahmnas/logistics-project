import apiClient from '../api/axios';

export interface UploadResponse {
  success: boolean;
  message: string;
  url: string;
}

/**
 * Standardized single file upload function to Cloudinary.
 * Accepts a File or base64 string, posts it to /upload endpoint,
 * and returns the returned Cloudinary CDN URL.
 */
export async function uploadSingleFile(
  file: File | string,
  folder: string = 'packages'
): Promise<string> {
  try {
    // 1. If base64 string
    if (typeof file === 'string') {
      if (!file.startsWith('data:image')) {
        return file; // Already a URL
      }
      const res = await apiClient.post<UploadResponse>('/upload', { file, folder });
      return res.data.url;
    }

    // 2. If File object
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const res = await apiClient.post<UploadResponse>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return res.data.url;
  } catch (error: any) {
    console.warn('Dedicated upload endpoint fallback:', error);
    // If backend upload endpoint returns warning/fallback, generate base64 url
    if (typeof file !== 'string') {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => resolve('');
      });
    }
    return file;
  }
}

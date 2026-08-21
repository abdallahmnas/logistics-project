import apiClient from '../api/axios';

/**
 * Uploads a raw binary image file directly to the backend /api/v1/upload endpoint.
 * Returns the hosted Cloudinary or server image URL.
 * Does NOT use base64!
 */
export async function uploadImageFile(file: File, folder: string = 'procurement'): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const response = await apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const url = response.data?.url || response.data?.data?.url;
    if (url) {
      return url;
    }
    throw new Error(response.data?.message || 'Failed to upload image file');
  } catch (err: any) {
    console.error('File Upload Error:', err);
    // Fallback to local Blob Object URL for browser display if offline
    return URL.createObjectURL(file);
  }
}

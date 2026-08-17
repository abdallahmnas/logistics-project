import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string,
  publicId?: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, public_id: publicId, resource_type: 'auto' },
      (error, result) => {
        if (error || !result) return reject(error || new Error('Upload failed'));
        resolve(result.secure_url);
      }
    );
    uploadStream.end(buffer);
  });
}

export async function uploadBase64ToCloudinary(
  base64Data: string,
  folder: string = 'packages'
): Promise<string> {
  if (!base64Data.startsWith('data:image')) {
    return base64Data; // Already a URL or non-base64 string
  }
  try {
    const result = await cloudinary.uploader.upload(base64Data, {
      folder,
      resource_type: 'auto',
    });
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary base64 upload warning/error:', error);
    return base64Data; // Return fallback base64 string if upload credentials missing
  }
}

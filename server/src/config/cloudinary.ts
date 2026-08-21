import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

import fs from 'fs';
import path from 'path';

export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string,
  publicId?: string
): Promise<string> {
  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
    try {
      return await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder, public_id: publicId, resource_type: 'auto' },
          (error, result) => {
            if (error || !result) return reject(error || new Error('Upload failed'));
            resolve(result.secure_url);
          }
        );
        uploadStream.end(buffer);
      });
    } catch (err) {
      console.warn('Cloudinary upload warning, saving to local disk fallback:', err);
    }
  }

  try {
    const uploadsDir = path.resolve(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const filename = `${publicId || Date.now()}_${Math.floor(Math.random() * 1000)}.png`;
    const filepath = path.join(uploadsDir, filename);
    fs.writeFileSync(filepath, buffer);
    return `/uploads/${filename}`;
  } catch (err) {
    return `data:image/png;base64,${buffer.toString('base64')}`;
  }
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

import { registerPlugin } from '@capacitor/core';

export interface SaveToPhotosPlugin {
  saveBase64Image(options: { base64: string }): Promise<{ success: boolean }>;
}

const SaveToPhotos = registerPlugin<SaveToPhotosPlugin>('SaveToPhotos');

export default SaveToPhotos;

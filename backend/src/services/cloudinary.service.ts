import cloudinary from "../config/cloudinary";

export const cloudinaryService = {
  async uploadImage(filePathOrBase64: string, folder: "recipes" | "avatars") {
    const result = await cloudinary.uploader.upload(filePathOrBase64, {
      folder: `memorable/${folder}`,
      resource_type: "image",
    });
    return { url: result.secure_url, publicId: result.public_id };
  },
  async deleteImage(publicId: string) {
    await cloudinary.uploader.destroy(publicId);
  },
  async uploadVideo(filePathOrBase64: string) {
    const result = await cloudinary.uploader.upload(filePathOrBase64, {
      folder: "memorable/recipe-videos",
      resource_type: "video",
    });
    return { url: result.secure_url, publicId: result.public_id };
  },
  async deleteVideo(publicId: string) {
    await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
  },
};

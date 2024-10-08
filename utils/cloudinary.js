const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

exports.cloudapi = cloudinary;

exports.handleUpload = async (file) => {
  const b64 = Buffer.from(file.buffer).toString("base64");
  const dataURI = "data:" + file.mimetype + ";base64," + b64;
  const uploadedImg = await cloudinary.uploader.upload(dataURI);
  const { public_id, url } = uploadedImg;
  const transformUrl = cloudinary.url(public_id, {
    width: 128,
    height: 128,
  });
  return { public_id, transformUrl, url };
};

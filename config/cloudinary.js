/*

// Import Cloudinary and set up configuration
const cloudinary = require('cloudinary').v2;
require("dotenv").config();

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

// Function to upload file to Cloudinary
async function uploadFile(filePath) {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'uploads'
    });
    console.log('File uploaded to Cloudinary:', result);
    return result;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return null;
  }
}

// // Example usage
// uploadFile('path/to/your/file.jpg')
//   .then((result) => console.log(result))
//   .catch((error) => console.error(error));

module.exports = uploadFile;
*/

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});
module.exports = { cloudinary };
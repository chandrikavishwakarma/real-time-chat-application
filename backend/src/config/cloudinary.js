const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name : process.env.CLOUD_NAME,
    secret_key : process.env.CLOUDINARY_SECRET,
    api_key : process.env.CLOUDINARY_API_KEY
})
module.exports = cloudinary;
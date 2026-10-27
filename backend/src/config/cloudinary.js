const cloudinary = require('cloudinary').v2;
cloudinary.config({
    my_cloud : process.env.CLOUD_NAME,
    secret_key : process.env.CLOUDINARY_SECRET,
    api_key : process.env.CLOUDINARY_API_KEY
})
module.exports = cloudinary;
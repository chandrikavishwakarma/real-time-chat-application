const cloudinary = require('../config/cloudinary.js')
const uploadFileToCloudinary = async (file) => {
  try {
    const uploadFile = await new Promise((resolve, reject)=>{
      const stream = cloudinary.uploader.upload_stream(
        {
          folder : "uploaded_files",
          resource_type : "auto"
        },
        (error, result) => {
          if(error){
            console.log(error);
            reject(error)
          }else{
            resolve(result)
          }
        }
      )
      stream.end(file.buffer)
    }
  )
  return uploadFile;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
};

module.exports = uploadFileToCloudinary;
// import axios from "axios";

// const uploadImagesToCloudinary = async (files) => {
//     try {
//         const { data } = await axios.get('http://localhost:5000/admin/generate-upload-url');
//         const { signature, timestamp, uploadPresent, apiKey, cloudName } = data;
//         const imageUrls = [];

//         for (const file of files) {
//             const formData = new FormData();
//             formData.append('file', file);
//             formData.append('upload_present', uploadPresent);
//             formData.append('timestamp', timestamp);
//             formData.append('api_key', apiKey);

//             const response = await axios.post(
//                 `https://api.cloudinary.com/v1_1/${dgbbdhdg7}/image/upload`,
//                 formData
//             );

//             console.log("Image uploaded successfully:", response.data.secure_url);
//             imageUrls.push(response.data.secure_url);
//         }

//         return imageUrls;
//     } catch (error) {

//         console.error(
//             "Error uploading images to Cloudinary:",
//             error.response ? error.response.data : error.message
//           );
//           throw error;

//     }
// }
// export default uploadImagesToCloudinary;

import axios from "axios";

const uploadImagesToCloudinary = async (files) => {
  try {

    const { data } = await axios.get('http://localhost:5000/admin/generate-upload-url');
    const { signature, timestamp, uploadPreset, apiKey, cloudName } = data;

    const imageUrls = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset); // Fixed typo here
      formData.append('timestamp', timestamp);
      formData.append('api_key', apiKey);
      formData.append('signature', signature); // Include signature if needed for signed uploads

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${dgbbdhdg7}/image/upload`, // Use dynamic cloud name
        formData
      );

      console.log("Image uploaded successfully:", response.data.secure_url);
      imageUrls.push(response.data.secure_url);
    }

    return imageUrls;
  } catch (error) {
    console.error(
      "Error uploading images to Cloudinary:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

export default uploadImagesToCloudinary;

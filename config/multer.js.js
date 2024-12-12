const multer = require("multer");
const shortid = require('shortid');



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, __dirname + "../../uploads");
    },
    filename: function (req, file, cb) {
      const fileExtension = file.mimetype.split("/")[1]; 
      cb(null, `${shortid.generate()}.${fileExtension}`);
    }
});



// File filter function to allow only certain mime types
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);  // Accept the file
  } else {
    cb(new Error('Invalid file type'), false);  // Reject the file
  }
};

  
const upload = multer({ storage: storage, fileFilter: fileFilter });



module.exports = upload;
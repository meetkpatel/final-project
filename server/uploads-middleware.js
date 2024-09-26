// const path = require('path');
// const multer = require('multer');

// const imagesDirectory = path.join(__dirname, 'public/images');

// const storage = multer.diskStorage({
//   destination(req, file, callback) {
//     callback(null, imagesDirectory);
//   },
//   filename(req, file, callback) {
//     const fileExtension = path.extname(file.originalname);
//     const name = `${file.fieldname}-${Date.now()}${fileExtension}`;
//     callback(null, name);
//   }
// });

// const uploadsMiddleware = multer({ storage }).single('image');
// module.exports = uploadsMiddleware;

/// ///////////////////////////////////////////

const path = require('path');
const mime = require('mime');
const multer = require('multer');
const multerS3 = require('multer-s3');
const S3 = require('aws-sdk/clients/s3');

// connect us to S3 on AWS
const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

// create a storage adapter
const storage = multerS3({
  s3: s3,
  bucket: process.env.AWS_S3_BUCKET,
  acl: 'public-read', // so that users can view the files
  key: (req, file, done) => {
    const fileExtension = path.extname(file.originalname);
    // include the extension in the key (.jpg, .png, .wav, .mp4, etc)
    const key = `${Date.now()}${fileExtension}`;
    done(null, key);
  },
  contentType: (req, file, done) => {
    // tell S3 what Content-Type to use when serving the file
    const contentType = mime.getType(file.originalname);
    done(null, contentType);
  }
});

// create the middleware
const uploadsMiddleware = multer({
  storage: storage
}).single('image');

// the string argument to .single()
// matches the <input name="file-to-upload" type="file"/>

module.exports = uploadsMiddleware;

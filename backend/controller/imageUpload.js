const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
const allowedExtensions = ['.png', '.jpg', '.jpeg', '.bmp', '.gif'];

// AWS S3 클라이언트 설정
const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY,
    secretAccessKey: process.env.AWS_S3_SECRET_KEY,
  },
});

async function uploadFileToS3(file) {
  const timestamp = Date.now();
  const filename = `uploads/survey-images/${timestamp}_${file.originalname}`;

  const params = {
    Bucket: process.env.AWS_BUCKET,
    Key: filename,
    Body: file.buffer,
    ACL: 'public-read-write',
    ContentType: file.mimetype,
  };

  try {
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    return `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${filename}`;
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw error;
  }
}

// S3에서 파일 삭제
async function deleteFileFromS3(url) {
  const bucket = process.env.AWS_BUCKET;
  const key = url.split(
    `https://${bucket}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/`,
  )[1];

  const params = {
    Bucket: bucket,
    Key: key,
  };

  try {
    const command = new DeleteObjectCommand(params);
    await s3Client.send(command);
    console.log('File deleted successfully');
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    throw error;
  }
}

async function updateFileOnS3(newFile) {
  try {
    // 새 파일 업로드
    if (newFile) {
      // 새로운 파일명 생성
      const timestamp = Date.now();
      const filename = `uploads/survey-images/${timestamp}_${newFile.originalname}`;

      const params = {
        Bucket: process.env.AWS_BUCKET,
        Key: filename,
        Body: newFile.buffer,
        ACL: 'public-read-write',
        ContentType: newFile.mimetype,
      };

      const command = new PutObjectCommand(params);
      await s3Client.send(command);

      const newUrl = `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${filename}`;
      console.log(`새 이미지 업로드: ${newUrl}`);
      return newUrl;
    }

    return null;
  } catch (error) {
    console.error('이미지 업데이트 오류:', error.message);
    throw error;
  }
}

// multer-s3 설정
const uploadS3 = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.AWS_BUCKET,
    acl: 'public-read-write',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      const timestamp = Date.now();
      //const originalName = file.originalname;
      const filename = `/uploads/survey-images/${timestamp}_${file.originalname}`;

      cb(null, filename);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    if (
      allowedExtensions.includes(path.extname(file.originalname).toLowerCase())
    ) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  },
}).fields([
  { name: 'mainImageUrl', maxCount: 1 },
  { name: 'imageUrl', maxCount: 10 }, // 클라이언트에서 최대 10개의 이미지를 배열 형태로 보낼 수 있다고 가정
]);

// PDF 임시 업로드용 presigned PUT URL 생성 (5분 유효)
async function generatePresignedUploadUrl(s3Key) {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET,
    Key: s3Key,
    ContentType: 'application/pdf',
  });
  return getSignedUrl(s3Client, command, { expiresIn: 300 });
}

// S3에서 파일을 Buffer로 읽기
async function getFileFromS3(s3Key) {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET,
    Key: s3Key,
  });
  const response = await s3Client.send(command);
  const chunks = [];
  for await (const chunk of response.Body) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

module.exports = { uploadS3, uploadFileToS3, deleteFileFromS3, updateFileOnS3, generatePresignedUploadUrl, getFileFromS3 };

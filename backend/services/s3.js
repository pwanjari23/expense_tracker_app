const AWS = require("aws-sdk");
require("dotenv").config();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

exports.uploadToS3 = async (
  data,
  filename,
  contentType = "application/json",
) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: filename,
    Body: data,
    // ACL: "public-read",
    ContentType: contentType,
  };

  const result = await s3.upload(params).promise();
  return result.Location;
};

// /* eslint-disable consistent-return */
// import * as path from 'path';
// import * as fs from 'fs';
// import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
// import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
// import dotenv from 'dotenv';
// import { logsError } from '../../../lib';

// dotenv.config();

// const s3Client = new S3Client({
//   region: process.env.AWS_REGION || 'us-east-1',
//   credentials: { accessKeyId: process.env.S3_ACCESS_ID, secretAccessKey: process.env.S3_SECRET_KEY },
// });

// export const uploadS3 = async (file, bucket, name) => {
//   try {
//     const params = {
//       Bucket: bucket,
//       Key: String(name),
//       Body: file,
//       ContentType: 'text/html',
//     };
//     const command = new PutObjectCommand(params);
//     const data = await s3Client.send(command);
//     return data;
//   } catch (error) {
//     logsError(error);
//   }
// };

// export const getPresignedURL = async (bucket, key) => {
//   try {
//     const params = {
//       Bucket: bucket,
//       Key: key,
//       Expires: 100, // time to expire in seconds
//       // ResponseContentDisposition: `attachment; filename="${key}"`,
//     };
//     const command = new GetObjectCommand(params);
//     return await getSignedUrl(s3Client, command, { expiresIn: 100 });
//   } catch (error) {
//     logsError(error);
//   }
// };

// export const removeS3 = async (bucket, key) => {
//   try {
//     const params = {
//       Bucket: bucket,
//       Key: key,
//     };
//     const command = new DeleteObjectCommand(params);
//     const data = await s3Client.send(command);
//     return data;
//   } catch (error) {
//     logsError(error);
//   }
// };

// export const s3BucketFileHandler = async (fileName, body) => {
//   try {
//     const pathName = path.resolve('./src/helpers/reports');
//     const filePath = `${pathName}/${fileName}.html`;

//     fs.writeFileSync(filePath, body);

//     await uploadS3(body, process.env.BUCKET_NAME, `${fileName}.html`);
//     fs.unlinkSync(filePath);
//   } catch (error) {
//     logsError(error);
//   }
// };

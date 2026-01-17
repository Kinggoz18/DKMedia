import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import { FastifyBaseLogger } from 'fastify';

dotenv.config();

export class CloudflareR2BucketManager {
  private readonly s3Client: S3Client
  cloudflareAccountId: string | undefined = process.env.CLOUDFLARE_ACCOUNT_ID
  cloudflareAccessKey: string | undefined = process.env.CLOUDFLARE_ACCESS_KEY;
  cloudflareSecretKey: string | undefined = process.env.CLOUDFLARE_SECRET_KEY
  cloudflareBucketName = process.env.CLOUDFLARE_BUCKET_NAME
  logger: FastifyBaseLogger;


  cloudlareAPIUrl = `https://${this.cloudflareAccountId}.r2.cloudflarestorage.com`
  cloudflareUrl = `${this.cloudlareAPIUrl}/${this.cloudflareBucketName}`

  constructor(logger: FastifyBaseLogger) {
    this.logger = logger;

    if (!this.cloudflareAccountId) {
      throw new Error('CLOUDFLARE_ACCOUNT_ID is not set');
    }

    if (!this.cloudflareUrl) {
      throw new Error('CLOUDFLARE_URL is not set');
    }

    if (!this.cloudflareAccessKey) {
      throw new Error('CLOUDFLARE_ACCESS_KEY is not set');
    }

    if (!this.cloudflareSecretKey) {
      throw new Error('CLOUDFLARE_SECRET_KEY is not set');
    }

    this.s3Client = new S3Client({
      endpoint: this.cloudflareUrl,
      forcePathStyle: false,
      region: 'auto',
      credentials: {
        accessKeyId: this.cloudflareAccessKey,
        secretAccessKey: this.cloudflareSecretKey
      }
    });

    if (!this.s3Client) {
      throw new Error('S3Client is not set');
    }
  }

  /**
   * Uploads an image to s3
   * @param {Buffer} imageBuffers
   * @returns {Promise<String>} secure_url
   */
  uploadImage = async (imageBuffers: Buffer): Promise<string> => {
    try {
      const buffer = imageBuffers;
      const fn = this.generateFileName();
      const key = `images/${fn}.jpeg`;

      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.cloudflareBucketName,
          Key: key,
          Body: buffer,
          ContentType: 'image/jpeg',
        })
      );

      const secure_url = `https://www.dkmedia305.com/dkmedia-website/${key}`;
      return secure_url;
    } catch (error: any) {
      throw new Error(
        error?.message ??
        'Something went wrong while uploading image to Cloudflare R2 Bucket'
      );
    }
  };

  /**
   * Uploads a video to s3
   * @param {Buffer} videoBuffer
   * @returns {Promise<String>} secure_url
   */
  uploadVideo = async (videoBuffer: Buffer): Promise<string> => {
    try {
      const buffer = videoBuffer;
      const fn = this.generateFileName();
      const key = `videos/${fn}.mp4`;

      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.cloudflareBucketName,
          Key: key,
          Body: buffer,
          ContentType: 'video/mp4',
        })
      );
      const secure_url = `https://www.dkmedia305.com/dkmedia-website/${key}`;
      return secure_url;
    } catch (error: any) {
      throw new Error(
        error?.message ??
        'Something went wrong while uploading video to Cloudflare R2 Bucket'
      );
    }
  };

  /**
   * Delete a single resource from Digital ocean
   * @param {*} url
   */
  deleteSingleResource = async (url: string): Promise<void> => {
    try {
      //Delete the video
      const parsedUrl = new URL(url.trim());
      const key = parsedUrl.pathname.slice(1);

      const deleteParams = {
        Bucket: this.cloudflareBucketName,
        Key: key
      };

      const deleteCommand = new DeleteObjectCommand(deleteParams);
      const resposne = await this.s3Client.send(deleteCommand);
    } catch (error: any) {
      throw new Error(
        error?.message ??
        'Something went wrong while deleting resource from Cloudflare R2 Bucket'
      );
    }
  };

  deleteMultipleResources = async () => { };

  /**
   * Generate file name for uploaded media
   * @returns {string} file name
   */
  generateFileName(): string {
    const timestamp = Date.now();
    const shortUuid = uuidv4();
    return `${timestamp}${shortUuid}`.replace(/[^a-zA-Z0-9]/g, '');
  }
}

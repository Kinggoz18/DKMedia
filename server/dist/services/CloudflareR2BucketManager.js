import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
dotenv.config();
export class CloudflareR2BucketManager {
    constructor(logger) {
        this.cloudflareAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;
        this.cloudflareAccessKey = process.env.CLOUDFLARE_ACCESS_KEY;
        this.cloudflareSecretKey = process.env.CLOUDFLARE_SECRET_KEY;
        this.cloudflareBucketName = process.env.CLOUDFLARE_BUCKET_NAME;
        this.cloudlareAPIUrl = `https://${this.cloudflareAccountId}.r2.cloudflarestorage.com`;
        this.cloudflareUrl = `${this.cloudlareAPIUrl}/${this.cloudflareBucketName}`;
        /**
         * Uploads an image to s3
         * @param {Buffer} imageBuffers
         * @returns {Promise<String>} secure_url
         */
        this.uploadImage = async (imageBuffers) => {
            try {
                const buffer = imageBuffers;
                const fn = this.generateFileName();
                const key = `images/${fn}.jpeg`;
                await this.s3Client.send(new PutObjectCommand({
                    Bucket: this.cloudflareBucketName,
                    Key: key,
                    Body: buffer,
                    ContentType: 'image/jpeg',
                }));
                const secure_url = `https://www.dkmedia305.com/dkmedia-website/${key}`;
                return secure_url;
            }
            catch (error) {
                throw new Error(error?.message ??
                    'Something went wrong while uploading image to Cloudflare R2 Bucket');
            }
        };
        /**
         * Uploads a video to s3
         * @param {Buffer} videoBuffer
         * @returns {Promise<String>} secure_url
         */
        this.uploadVideo = async (videoBuffer) => {
            try {
                const buffer = videoBuffer;
                const fn = this.generateFileName();
                const key = `videos/${fn}.mp4`;
                await this.s3Client.send(new PutObjectCommand({
                    Bucket: this.cloudflareBucketName,
                    Key: key,
                    Body: buffer,
                    ContentType: 'video/mp4',
                }));
                const secure_url = `https://www.dkmedia305.com/dkmedia-website/${key}`;
                return secure_url;
            }
            catch (error) {
                throw new Error(error?.message ??
                    'Something went wrong while uploading video to Cloudflare R2 Bucket');
            }
        };
        /**
         * Delete a single resource from Digital ocean
         * @param {*} url
         */
        this.deleteSingleResource = async (url) => {
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
            }
            catch (error) {
                throw new Error(error?.message ??
                    'Something went wrong while deleting resource from Cloudflare R2 Bucket');
            }
        };
        this.deleteMultipleResources = async () => { };
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
     * Generate file name for uploaded media
     * @returns {string} file name
     */
    generateFileName() {
        const timestamp = Date.now();
        const shortUuid = uuidv4();
        return `${timestamp}${shortUuid}`.replace(/[^a-zA-Z0-9]/g, '');
    }
}

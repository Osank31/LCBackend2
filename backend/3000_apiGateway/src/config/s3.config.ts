import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl, } from "@aws-sdk/s3-request-presigner";
import { AWS_ACCESS_KEY, AWS_SECRET_ACCESS_KEY } from "../constants/constants";

const client = new S3Client({
    region: "ap-south-1",
    credentials: {
        accessKeyId: AWS_ACCESS_KEY,
        secretAccessKey: AWS_SECRET_ACCESS_KEY
    }
});
export const createPresignedUrlWithClient = ({ bucket, key }: { bucket: string; key: string }) => {
    const command = new PutObjectCommand({ Bucket: bucket, Key: key });
    return getSignedUrl(client, command, { expiresIn: 3600 });
};
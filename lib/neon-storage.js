import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const bucket = process.env.NEON_STORAGE_BUCKET || "cisse-media";
let client;

function getStorageConfig() {
  const endpoint = process.env.AWS_ENDPOINT_URL_S3?.replace(/\/+$/, "");
  const region = process.env.AWS_REGION;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const missing = [
    ["AWS_ENDPOINT_URL_S3", endpoint],
    ["AWS_REGION", region],
    ["AWS_ACCESS_KEY_ID", accessKeyId],
    ["AWS_SECRET_ACCESS_KEY", secretAccessKey],
  ].filter(([, value]) => !value).map(([name]) => name);

  if (missing.length) {
    throw new Error(`Configuration Neon Object Storage manquante : ${missing.join(", ")}.`);
  }

  return { endpoint, region, accessKeyId, secretAccessKey };
}

function getClient(config) {
  if (!client) {
    client = new S3Client({
      endpoint: config.endpoint,
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      forcePathStyle: true,
      requestChecksumCalculation: "WHEN_REQUIRED",
    });
  }
  return client;
}

export async function uploadObject(key, body, contentType) {
  const config = getStorageConfig();
  await getClient(config).send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: contentType,
    CacheControl: "public, max-age=31536000, immutable",
  }));
  return `${config.endpoint}/${bucket}/${String(key).split("/").map(encodeURIComponent).join("/")}`;
}

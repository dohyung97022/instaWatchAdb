const { S3Client, ListObjectsCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
// api
// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/index.html

module.exports.new = async function (options) {
    const s3 = {};
    s3.region = options.region;
    const S3 = new S3Client({ region: s3.region });

    //s3.listObjectsFromBucketName
    s3.listObjectsFromBucketName = async function (bucketName) {
        var bucketParams = {
            Bucket: bucketName
        };
        const objects = await S3.send(new ListObjectsCommand(bucketParams));
        return objects;
    }

    //s3.getLatestObjectAndTimeFromBucketName
    s3.getLatestObjectWithinTimeFromBucketName = async function (bucketName, withinTime) {
        var bucketParams = {
            Bucket: bucketName
        };
        const objects = await S3.send(new ListObjectsCommand(bucketParams));
        var latestTime = 0;
        var latestObject = '';
        for (const object of objects['Contents']) {
            var objectDate = new Date(object.LastModified);
            if (latestTime < objectDate.getTime() && withinTime < objectDate.getTime()) {
                latestTime = objectDate.getTime();
                latestObject = object['Key'];
            }
        }
        return latestObject;
    }

    //s3.getObjectSignedUrlFromBucket
    s3.getObjectSignedUrlFromBucket = async function (bucketName, objectKey) {
        var bucketParams = {
            Bucket: bucketName,
            Key: objectKey
        };
        const url = await getSignedUrl(S3, new GetObjectCommand(bucketParams));
        return url;
    }

    return s3;
}
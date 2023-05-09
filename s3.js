const dotenv = require('dotenv')
const crypto = require('crypto')
const util = require('util')


const aws = require("aws-sdk");

const randomBytes = util.promisify(crypto.randomBytes)

dotenv.config()

const region = "us-east-2"
const bucketName = "messenger-avatars"
const accessKeyId = process.env.AWS_ACCESS_KEY_ID
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY



const s3 = new aws.S3({
    region,
    accessKeyId,
    secretAccessKey,
    signatureVersion: 'v4'
})


async function generateUploadURL() {
    const rawBytes = await randomBytes(16)
    const imageName = rawBytes.toString('hex')

    const params = ({
        Bucket: bucketName,
        Key: imageName,
        Expires: 60
    })

    try {
        const uploadURL = await s3.getSignedUrlPromise('putObject', params)
        return uploadURL
    } catch (e) {
        console.log(e)
    }
}

module.exports = { generateUploadURL }
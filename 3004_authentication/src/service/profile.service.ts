import { createPresignedUrlWithClient } from "../config/s3.config"
import {v4 as uuidv4} from "uuid"

export const getPresignedUrl = async ({mimeType}: {mimeType: string}) => {
    const key = `${uuidv4()}.${mimeType}`
    const url = await createPresignedUrlWithClient({
        bucket: "lcbackend.osank.dev",
        key
    })
    return {preSignedUrl: url, fileName: key}
}
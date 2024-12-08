import { BlobServiceClient, BlockBlobClient } from "@azure/storage-blob";
import { AZURE_BLOB_CONNECTION_STRING, AZURE_BLOB_CONTAINER_NAME } from "../config";

//  initializes the BlobServiceClient. It allows interaction with blob containers and their contents.
const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_BLOB_CONNECTION_STRING);

// gets a client for interacting with a specific blob container.
const containerClient = blobServiceClient.getContainerClient(AZURE_BLOB_CONTAINER_NAME);

export const uploadToBlobStorage = async (
  fileBuffer: Buffer,
  fileName: string,
) => {
  const blobName = `${Date.now()}-${fileName}`;
  const blockBlobClient: BlockBlobClient =
    containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.upload(fileBuffer, fileBuffer.length);
  return blockBlobClient.url; // Return the public URL of the file
};

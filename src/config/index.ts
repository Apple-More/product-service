import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT;
export const AZURE_BLOB_CONNECTION_STRING = process.env.AZURE_BLOB_CONNECTION_STRING;
export const AZURE_BLOB_CONTAINER_NAME = process.env.AZURE_BLOB_CONTAINER_NAME;
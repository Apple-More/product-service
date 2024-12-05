import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT;
export const USER_SERVICE_URL = process.env.USER_SERVICE_URL;
export const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL;
export const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL;
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
export const AZURE_BLOB_CONNECTION_STRING = process.env.AZURE_BLOB_CONNECTION_STRING;
export const AZURE_BLOB_CONTAINER_NAME = process.env.AZURE_BLOB_CONTAINER_NAME;
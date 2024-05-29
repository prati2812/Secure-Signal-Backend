import { config } from 'dotenv';

config();

const {
    PORT,
    HOST,
    HOST_URL,
    SECRET_KEY,
    STRIPE_API_PUBLIC_KEY,
    STRIPE_SECRET_KEY
} = process.env;

export const port = PORT;
export const host = HOST;
export const hostUrl = HOST_URL;
export const secret_key = SECRET_KEY;
export const stripe_api_pulic_key = STRIPE_API_PUBLIC_KEY;
export const stripe_secret_key = STRIPE_SECRET_KEY;



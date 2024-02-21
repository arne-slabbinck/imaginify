import mongoose, { Mongoose } from 'mongoose';

const MONGODB_URL = process.env.MONGODB_URL;

interface MongooseConnection {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
}

// In next.js we have to call our database with each server call or API request we do

// But since next.js runs in a serverless environment, serverless functions are stateless

// they don't maintain a continuous connection to the DataBase

// this needs optimisation so we don't have allot of connections open

// so we need to CACH our connections


let cached: MongooseConnection = (global as any).mongoose

// if we're calling this for the first time, we need to check if it's allready cached or not
if(!cached) {
    cached = (global as any).mongoose = {
        conn: null, promise: null
    }
}

// here we'll do the connection
export const connectToDatabase = async () => {

    // if a cached connection already exist, we just return it and exit function
    if(cached.conn) return cached.conn;

    if(!MONGODB_URL) throw new Error('Missing MONGODB_URL');

    // if there's no cached promise of connection, we want to create a new one
    cached.promise = 
        cached.promise ||
        mongoose.connect(MONGODB_URL, {
            dbName: 'imaginify', bufferCommands: false
        })
    
    // once we have this promise, it will result in a connection
    cached.conn = await cached.promise;

    return cached.conn;
    
}
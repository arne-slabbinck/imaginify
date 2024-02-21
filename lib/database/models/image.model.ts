// Our first mongoose model FeelsStrongMan Clap

import { Document, Schema, model, models } from "mongoose";

export interface IImage extends Document {
    title: string;
    transformationType: string;
    publicId: string;
    secureUrl: string;
    width?: number;
    height?: number;
    config?: object;
    transformationUrl?: string;
    aspectRatio?: string;
    color?: string;
    prompt?: string;
    author: {
        _id: string;
        firstName: string;
        lastName: string;
    }
    createdAt?: Date;
    updatedAt?: Date;
}


const ImageSchema = new Schema({
    title: { type: String, required: true },
    transformationType: { type: String, required: true},
    publicId: { type: String, required: true},
    secureUrl: { type: URL, required: true},
    width: { type: Number },
    height: { type: Number },
    config: { type: Object },
    transformationUrl: { type: URL },
    aspectRatio: { type: String },
    color: { type: String },
    prompt: { type: String },
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
})

// make this schema into a model

// we check if image already exist among models, 
// if it doesn't (||) we can create a new model with name Image based on ImageSchema
const Image = models?.Image || model('Image', ImageSchema)

export default Image;

// Since we work with typescript, we can immediately craete a type with this image
// so that our frontend immediately knows what properties do we have on the documents build of image schema

// --> create new interface for this image
// ChatGPT4:
// Create an IImage interface based off of the following ImageSchema:   (see above)
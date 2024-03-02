"use server";

// server actions that allow us to add, update, delete, and get images from our database

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils";
import image from "next/image";
import User from "../database/models/user.model";
import Image from "../database/models/image.model";
import { redirect } from "next/navigation";

import { v2 as cloudinary } from 'cloudinary'

const populateUser = (query: any) => query.populate({
    path: 'author',
    model: User,
    select: '_id firstName lastName' //which fields we want to populate
})

// ADD IMAGE  (to database)
export async function addImage({ image, userId, path }: AddImageParams) {
    try {
        await connectToDatabase();

        const author = await User.findById(userId);

        if (!author) {
            throw new Error("User not found");
        }

        const newImage = await Image.create({
            ...image,
            author: author._id,
        })

        revalidatePath(path); // allow us to show created image, not what was cached

        return JSON.parse(JSON.stringify(newImage));
    } catch (error) {
        handleError(error)
    }
}

// UPDATE IMAGE  (from database)
export async function updateImage({ image, userId, path }: UpdateImageParams) {
    try {
        await connectToDatabase();

        // find image
        const imageToUpdate = await Image.findById(image._id);

        // check if image exists, and if user has permission to update
        if (!imageToUpdate || imageToUpdate.author.toHexString() !== userId) {
            throw new Error("Unauthorized or image not found");
        }

        const updatedImage = await Image.findByIdAndUpdate(
            imageToUpdate._id, // the image we want to update
            image,             // the image object itself (the data we want to update)
            { new: true }      // create new instance of that document

        )

        revalidatePath(path); // allow us to show created image, not what was cached

        return JSON.parse(JSON.stringify(updateImage));
    } catch (error) {
        handleError(error)
    }
}

// DELETE IMAGE  (from database)
export async function deleteImage(imageId: string) {
    try {
        await connectToDatabase();

        await Image.findByIdAndDelete(imageId);
    } catch (error) {
        handleError(error)
    } finally {
        redirect('/')
    }
}

// GET IMAGE  (from database)
export async function getImageById(imageId: string) {
    try {
        await connectToDatabase();

        // we don't wanna simply get the data of the image
        // we want to get the data of the author who created that image as well
        const image = await populateUser(Image.findById(imageId))
        // we are getting wich user created it, and populating the image so it contains
        // the data about the user that created it

        if(!image) throw new Error("Image not found");

        return JSON.parse(JSON.stringify(image));
    } catch (error) {
        handleError(error)
    }
}

// GET ALL IMAGES
export async function getAllImages({ limit = 9, page = 1, searchQuery = ''}: {
        limit?: number;
        page: number;
        searchQuery?: string;
    }) {
        try {
            await connectToDatabase();

            cloudinary.config({
                cloud_name:process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
                api_key: process.env.CLOUDINARY_API_KEY,
                api_secret: process.env.CLOUDINARY_API_SECRET,
                secure: true,
            })

            console.log('do we get this far')
            
            let expression = 'folder=imaginify';  // name of folder in ur cloudinary product environment settings

            if (searchQuery) {
                expression += ` AND ${searchQuery}`
            }

            // get resources we need (also for if we have query string)
            const { resources }  = await cloudinary.search
                .expression(expression)
                .execute();
            
            // get back the resource id's so we can get them from our database
            const resourceIds = resources.map((resource: any) => resource.public_id);

            // form a new query for querying our own DB with the resources ID's
            let query = {};

            if(searchQuery) {
                // go over the publicId's, and include resource Id's we got back from cloudinary
                query = {
                    publicId: {
                        $in: resourceIds
                    }
                }
            }

            //implement pagination
            const skipAmount = (Number(page) -1) * limit;

            //fetch back images, also with the userdata so we know who created it
            const images = await populateUser(Image.find(query))
                .sort({ updateAt: -1}) //newer ones appear at top
                .skip(skipAmount)      //for pagination
                .limit(limit);

            // define number of total images with passed query
            const totalImages = await Image.find(query).countDocuments();

            // total number of all images in general
            const savedImages = await Image.find().countDocuments();

            return {
                data: JSON.parse(JSON.stringify(images)),
                totalPage: Math.ceil(totalImages / limit),  //returns smallest number that's greater than or equal to
                savedImages,
            }


        } catch (error) {
            handleError(error)
        }
}



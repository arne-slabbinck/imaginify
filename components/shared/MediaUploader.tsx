"use client";

import { useToast } from "@/components/ui/use-toast"
import { dataUrl, getImageSize } from "@/lib/utils";
import { CldImage, CldUploadWidget } from "next-cloudinary"
import { PlaceholderValue } from "next/dist/shared/lib/get-img-props";
import Image from "next/image"

type MediaUploaderProps = {
    onValueChange: (value: string) => void;
    setImage: React.Dispatch<any>; // specify type for react set states with < >
    publicId: string;
    image: any;
    type: string;
}

const MediaUploader = ({
    onValueChange,
    setImage,
    image,
    publicId,
    type
}: MediaUploaderProps) => {

    const { toast } = useToast()

    const onUploadSuccessHandler = (result: any) => {

        // set image to the state, get prev state, spread previous state, update publicId
        setImage((prevState: any) => ({
            ...prevState,
            publicId: result?.info?.public_id,
            width: result?.info?.width,
            height: result?.info?.height,
            secureUrl: result?.info?.secure_url
        }))

        // Very important, when form changes, update the public ID of the form
        // Let application know public ID has changed, and display uploaded image
        onValueChange(result?.info?.public_id)

        toast({
            title: 'Image uploaded successfully',
            description: '1 credit was deducted from your account',
            duration: 5000,
            className: 'success-toast'
        })
    }

    const onUploadErrorHandler = () => {
        toast({
            title: 'Something went wrong while uploading',
            description: 'Please try again',
            duration: 5000,
            className: 'error-toast'
        })
    }

    return (
        <CldUploadWidget
            uploadPreset="noedel_imaginify"
            options={{
                multiple: false,
                resourceType: "image",
            }}
            onSuccess={onUploadSuccessHandler}
            onError={onUploadErrorHandler}
        >
            {/* What will we show within upload widget
            Open dynamic block of code and immediately have a function where we can destructure
            the Open state */}
            {({ open }) => (
                <div className="flex flex-col gap-4">
                    <h3 className="h3-bold text-black">Original</h3>

                 {/* Display image if we have a public ID (comes from props we pass in this component) */}
                    {publicId ? (
                        // check If we have access to public id, show image
                        // this is the part that happens after we upload the image
                        <>
                            <div className="cursor-pointer overflow-hidden rounded-[10px]">
                                <CldImage 
                                    width={getImageSize(type, image, "width")}
                                    // dynamically calculate width with getImageSize
                                    // takes our aspect ratio, and returns dimensions
                                    height={getImageSize(type, image, "height")}
                                    src={publicId}
                                    alt="image"
                                    sizes={"(max-width: 767px) 100vw, 50vw"}
                                    placeholder={dataUrl as PlaceholderValue}
                                    className="media-uploader_cldImage"
                                />
                            </div>
                        </>

                    ) : (
                        // if we don't have public ID, show no image
                        // this is where we will actually upload it
                        <div 
                            className="media-uploader_cta"
                            onClick={() => open()}                            
                        >
                            <div className="media-uploader_cta-image">
                                {/* Image placeholder */}
                                <Image 
                                    src="/assets/icons/add-light-red.svg"
                                    alt="Add Image"
                                    width={24}
                                    height={24}
                                />
                            </div>
                            <p className="p-14-medium text-gray-500">
                                    Click here to upload image
                            </p>
                        </div>

                    )}
                </div>
            )}
        </CldUploadWidget>
    )
}

export default MediaUploader
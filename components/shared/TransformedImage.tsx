"use client";

import React from 'react'
import Image from 'next/image'
import { CldImage } from 'next-cloudinary'
import { dataUrl, debounce, getImageSize } from '@/lib/utils'
import { PlaceholderValue } from 'next/dist/shared/lib/get-img-props'

const TransformedImage = ({ image, type, title, transformationConfig, isTransforming,
                            setIsTransforming, hasDownload = false}: TransformedImageProps) => {

  const downloadHandler = () => {}

  return (
    <div className="flex flex-col gap-4">
        <div className="flex-between">
            <h3 className="h3-bold text-black">Transformed</h3>

            {hasDownload && (
                <button className="download-btn" onClick={downloadHandler}> 
                {/* because we give the button an onclick listener prop, we need to specify "on client" on top  */}
                    <Image 
                        src="/assets/icons/download-light-red.svg"
                        alt="Download"
                        width={24}
                        height={24}
                        className="pb-[6px]"
                    />
                </button>
            )}
        </div>

        {image?.publicId && transformationConfig ? (

            // this is what we see when the transformation is done
            <div className="relative">
                <CldImage 
                    width={getImageSize(type, image, "width")}
                    // dynamically calculate width with getImageSize
                    // takes our aspect ratio, and returns dimensions
                    height={getImageSize(type, image, "height")}
                    src={image?.publicId}
                    alt={image.title}
                    sizes={"(max-width: 767px) 100vw, 50vw"}
                    placeholder={dataUrl as PlaceholderValue}
                    className="transformed-image"
                    onLoad={() => {
                        //check if we can access setIsTransforming and set to false cause image is loaded
                        setIsTransforming && setIsTransforming(false); 
                    }}
                    onError={() => {
                        debounce(() => {
                            setIsTransforming && setIsTransforming(false);
                        }, 8000) // if nothing happens after 8 seconds we can assume it failed
                    }}
                    // IMPORTANT: spread the entire transformation config
                    {...transformationConfig}
                    // This config will contain all the image transformations we want to apply
                />

                {/* Show loaders while we are transforming */}
                {isTransforming && (
                    <div className="transforming-loader">
                        <Image 
                            src="/assets/icons/spinner.svg"
                            width={50}
                            height={50}
                            alt="Transforming"
                        />
                    </div>
                )}

            </div>
        ) : (
            <div className="transformed-placeholder text-gray-500">
                Transformed Image
            </div>
        )}
    </div>
  )
}

export default TransformedImage
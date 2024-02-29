// You can find all this on the shadecn documentation page for form

// "use client" component because it has to manage keyboard and keypress submit events
"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"


// this builds the form
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { aspectRatioOptions, defaultValues, transformationTypes } from "@/constants"
import { CustomField } from "./CustomField"
import { useState, useTransition } from "react"
import { AspectRatioKey, debounce, deepMergeObjects } from "@/lib/utils"
import MediaUploader from "./MediaUploader"
import TransformedImage from "./TransformedImage"
import { transform } from "next/dist/build/swc"
import image from "next/image"
import { updateCredits } from "@/lib/actions/user.actions"
import { getCldImageUrl } from "next-cloudinary"
import { addImage } from "@/lib/actions/image.actions"


// validation, fields
export const formSchema = z.object({
    title: z.string(),
    aspectRatio: z.string().optional(),
    color: z.string().optional(),
    prompt: z.string().optional(),
    publicId: z.string(),
})

const TransformationForm = ({ action, data = null, userId, type, 
                              creditBalance, config = null }: TransformationFormProps) => {
    
    // We can also get access to the current transformation type we're doing
    const transformationType = transformationTypes[type];

    // we need states for image upload
    const [image, setImage] = useState(data)

    // we also want to track the current transformation, what are we doing with the image
    // we specify it's of type transformation, or (single | in typescript), null
    const [newTransformation, setnewTransformation] = useState<Transformations | null>(null);

    //state to see if we're submitting
    const [isSubmitting, setisSubmitting] = useState(false);

    const [isTransforming, setisTransforming] = useState(false);
    const [transformationConfig, settransformationConfig] = useState(config);
    
    // useTransitionhook let's you update the state without blocking the UI
    const [isPending, startTransition] = useTransition()

    // In case we edit specific image, we might have some data from before
    // If data exist and if action is equal to update, then we can define object
    // containing some default values
    const initialValues = data && action === 'Update' ? {

        // this will only populate the data of the form in case we're updating the allready existing image
        title: data?.title,
        aspectRatio: data?.aspectRatio,
        color: data?.color,
        prompt: data?.prompt,
        publicId: data?.publicId,
    
        // else we can set it to true defaultValues (coming from constants)
    } : defaultValues

    // 1. Define your form.
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: initialValues,
    })

    // 2. Define a submit handler.
    async function onSubmit(values: z.infer<typeof formSchema>) {
        // Do something with the form values.
        // This will be type-safe and validated.
        console.log(values)

        setisSubmitting(true);

        // if we have data or image, we can proceed to the upload
        if(data || image) {

            // let's get the transformationUrl provided for us by cloudinary
            const transformationUrl = getCldImageUrl({
                width: image?.width,
                height: image?.height,
                src: image?.publicId,
                ...transformationConfig
            })

            // form imagedata by creating new object, getting info from form(values) & uploaded image
            const imageData = {
                title: values.title,
                publicId: image?.publicId,
                transformationType: type,    // is it a recoller, generative fill, ...
                width: image?.width,
                height: image?.height,
                config: transformationConfig,
                secureURL: image?.secureUrl,
                transformationURL: transformationUrl,
                aspectRatio: values.aspectRatio,
                prompt: values.prompt,
                color: values.color,
            }

            if(action === 'Add') {
                // Add image
                try {
                    const newImage = await addImage({
                        image: imageData,
                        userId,
                        path: '/'
                    })
                } catch (error) {
                    console.log(error);
                }
            }
        }

    }

    const onSelectFieldHandler = (value: string, onChangeField: (value: string) => void) => {

        // get size
        const imageSize = aspectRatioOptions[value as AspectRatioKey]

        // set image, get prevstate, immidiately return something
        setImage((prevState: any) => ({
            //spread previous state
            ...prevState,
            aspectRatio: imageSize.aspectRatio,
            width: imageSize.width,
            height: imageSize.height,
        }))

        // once we have the image, we can set new transformation
        setnewTransformation(transformationType.config);

        // return field with modified value
        return onChangeField(value)
    }

    const onInputChangeHandler = (fieldName: string, value: string, type: string, 
                                  onChangeField: (value: string) => void) => {

        // debounce will send inputs only by a 1 sec interval to your server
        debounce(() => {
            setnewTransformation((prevState: any) => ({
                //return object where we spread the previous state
                ...prevState,
                //we modify the type of transformation
                [type]: {
                    ...prevState?.[type],
                    [fieldName === 'prompt' ? 'prompt' : 'to' ]: value
                }
            }))

            return onChangeField(value)

        }, 1000);
    }

    // TODO: Update creditFee to something else
    const onTransformHandler = async () => {
        setisTransforming(true)

        settransformationConfig(
            // we want to merge the new transformation with the transformationConfig
            deepMergeObjects(newTransformation, transformationConfig)
            // deepMergeObjects is generated by chatGPT where it merges all keys of both objects
            // to ensure all of them end up in a newly created object wich we set to transformConfig
        )

        setnewTransformation(null)

        startTransition(async () => {
            await updateCredits(userId, -1)
        })
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <CustomField 
                    control={form.control}
                    name="title"
                    formLabel="Image Title"
                    className="w-full text-gray-700"
                    // destructure the field from the values we're getting
                    // automatically return input property, to which we can spread all the field props
                    render={({ field }) => <Input {...field} className="input-field" />}
                />

                {/* Only if type is fill, display customField with a render prop where we get the field
                    Copied from shadcn docs*/}
                {type === 'fill' && (
                    <CustomField
                        control={form.control} 
                        name="aspectRatio"
                        formLabel="Aspect Ratio"
                        className="w-full text-gray-700"
                        render={({ field }) => (
                            <Select
                                onValueChange={(value) => onSelectFieldHandler(value, field.onChange)}
                                // styles={{
                                //     control: (baseStyles, state) => ({
                                //         ...baseStyles,
                                //         borderColor: state.isFocused ? 'grey' : 'red',
                                //     }),
                                // }}
                                
                            >
                                <SelectTrigger className="select-field">
                                    <SelectValue placeholder={<div className="select-placeholder-text">Select sizes</div>}  />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.keys(aspectRatioOptions).map((key) => (
                                        <SelectItem key={key} value={key} className="select-item text-gray-700">
                                            {aspectRatioOptions[key as AspectRatioKey].label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                )}

                {(type === 'remove' || type === 'recolor') && (
                    <div className="prompt-field">
                        <CustomField 
                            control={form.control}
                            name="prompt"
                            formLabel={
                                type === 'remove' ? 'Object to remove' : 'Object to recolor'
                            }
                            className="w-full"
                            render={(({ field }) => (
                                <Input 
                                    value={field.value}
                                    className="input-field"
                                    onChange={(e) => onInputChangeHandler(
                                        'prompt',  //pass the string of the field we're changing
                                        e.target.value, //where we pass it, so it knows the data
                                        type, //are we removing background or changing color?
                                        field.onChange
                                    )}
                                />
                            ))}
                        />

                        {type === 'recolor' && (
                            <CustomField 
                                control={form.control}
                                name="color"
                                formLabel="Replacement Color"
                                className="w-full"
                                render={({ field }) => (
                                    <Input 
                                        value={field.value}
                                        className="input-field"
                                        onChange={(e) => onInputChangeHandler(
                                            'color',  //pass the string of the field we're changing
                                            e.target.value, //where we pass it, so it knows the data
                                            'recolor', 
                                            field.onChange
                                        )}
                                    />
                                )}
                            />
                        )}
                        
                    </div>
                )}

                <div className="media-uploader-field">
                    <CustomField 
                        control={form.control}
                        name="publicId"
                        className="flex size-full flex-col"
                        render={({ field }) => (
                            <MediaUploader 
                                onValueChange={field.onChange}
                                setImage={setImage}
                                publicId={field.value}
                                image={image}
                                type={type}
                            />
                        )}
                    />

                    <TransformedImage 
                        image={image}
                        type={type}
                        title={form.getValues().title}
                        isTransforming={isTransforming}
                        setIsTransforming={setisTransforming}
                        transformationConfig={transformationConfig}
                    />
                </div>

                <div className="flex flex-col gap-4">
                <Button 
                    type="button"
                    className="submit-button-red capitalize"
                    // make it disabled if we're currently submitting
                    disabled={isTransforming || newTransformation === null}
                    onClick={onTransformHandler}
                >
                    {isTransforming ? 'Transforming...' : 'Apply transformation'}
                </Button>
                <Button 
                    type="submit"
                    className="submit-button-red capitalize"
                    // make it disabled if we're currently submitting
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Submitting...' : 'Save Image'}
                </Button>

                </div>

            </form>
        </Form>
    )
}


export default TransformationForm
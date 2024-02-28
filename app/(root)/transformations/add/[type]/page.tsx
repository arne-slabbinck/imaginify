import Header from '@/components/shared/Header'
import TransformationForm from '@/components/shared/TransformationForm';
import { transformationTypes } from '@/constants'

// We are under the route add/restore
// Whatever you put in the square brackets of the map structure (type), 
// you'll have acceses to in the props

const AddTransformationTypePage = ({ params: { type } }: SearchParamProps) => {

  const transformation = transformationTypes[type];

  return (
    <>
      <Header 
        title={transformation.title} 
        subtitle={transformation.subTitle}
      />

      <TransformationForm />
      
    </>

  )
}

export default AddTransformationTypePage
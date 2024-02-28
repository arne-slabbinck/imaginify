import Header from '@/components/shared/Header'
import TransformationForm from '@/components/shared/TransformationForm';
import { transformationTypes } from '@/constants'
import { getUserById } from '@/lib/actions/user.actions';
import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

// We are under the route add/restore
// Whatever you put in the square brackets of the map structure (type), 
// you'll have acceses to in the props

const AddTransformationTypePage = async ({ params: { type } }: SearchParamProps) => {

  const { userId } = auth();
  const transformation = transformationTypes[type];

  if(!userId) redirect('/sign-in')

  const user = await getUserById(userId);

  return (
    <>
      <Header 
        title={transformation.title} 
        subtitle={transformation.subTitle}
      />

      <section className="mt-10">
        <TransformationForm 
          action="Add"
          userId={user._id}
          type={transformation.type as TransformationTypeKey}
          creditBalance={user.creditBalance}
        />
      </section>


    </>

  )
}

export default AddTransformationTypePage
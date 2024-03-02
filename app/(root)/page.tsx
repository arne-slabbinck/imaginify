import { navLinks } from '@/constants'
import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import React from 'react'
import Image from 'next/image'
import { Collection } from '@/components/shared/Collection'
import { getAllImages } from '@/lib/actions/image.actions'


// Apply brand color to all clerc components by passing the appearance prop to the clerk providor (base layout file in app folder)

const Home = async ({ searchParams }: SearchParamProps) => {

  const page = Number(searchParams?.page) || 1;  // default it to 1
  const searchQuery = (searchParams?.query as string) || '';

  const images = await getAllImages({ page, searchQuery })

  return (

    <>
      <section className="home">
        <h1 className="home-heading">
          Unleash Your Creative Vision.
        </h1>
        <ul className="flex-center w-full gap-20">
          {navLinks.slice(2,6).map((link) => (
            <Link
              key={link.route}
              href={link.route}
              className="flex-center flex-col gap-2"
            >
              <li className="flex-center w-fit rounded-full bg-white p-4">
                <Image 
                  src={link.icon}
                  alt="image"
                  width={24}
                  height={24}
                />
              </li>
              <p className="p-14-medium text-center text-white">{link.label}</p>
            </Link>
          ))}
        </ul>
      </section>

      <section className="sm:mt-12">
            <Collection 
              hasSearch={true}
              images={images?.data}
              totalPages={images?.totalPage}
              page={page}
            />
      </section>
    </>

    // # MEME HOMEPAGE
    // <div>
      
    //   <div className="hexagon-wrapper flex flex-row">
        
    //     <div className="hexagon">
    //       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 32" fill="currentcolor">
    //         <path d="M0 8 L0 24 L14 32 L28 24 L28 8 L14 0 Z"/>
    //       </svg>
          
    //     </div>
    //     <div className="flex items-center">
    //       <p className="ml-5 h2-bold text-red-400">Noedel</p>
    //     </div>
        
        
    //   </div>
    //   <h1 className="text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
    //     Transform images.
    //   </h1>
    //   <div className="pl-2">
    //     <h2 className="h2-bold text-black pt-1"> yes. do it.</h2>
    //     <p className="p-14-medium text-gray-500 pt-3">
    //                                 now
    //                         </p>
    //   </div>
      
    // </div>
  )
}

export default Home
"use client";  // this turns the application from a server side rendered component by default,
               // to a client side rendered one.

import { navLinks } from '@/constants'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'
import { Button } from '../ui/button';

const Sidebar = () => {

    // using browser functionalities, so have to add 'use client'-directive at the top of the file
    const pathname = usePathname();
    

    return (
        <aside className="sidebar">
            <div className="flex size-full flex-col gap-4">
                <Link href="/" className="sidebar-logo">
                    <Image src="/assets/images/logo-text.svg" alt="logo" width={180} height={28} />
                </Link>

                <nav className="sidebar-nav">
                    {/* Code within will only show when user is signed in */}
                    <SignedIn>
                        <ul className="sidebar-nav_elements">
                            {navLinks.slice(0, 6).map((link) => {
                                // We need to first figure out if the current link is active or not
                                const isActive = link.route === pathname

                                return (
                                    <li key={link.route} 
                                        className={`sidebar-nav_element group
                                        
                                        // Only when it is active
                                        ${ isActive ? 'bg-purple-gradient text-white'
                                                    : 'text-gray-700'}
                                        `}>
                                            <Link className="sidebar-link" href={link.route}>
                                                <Image 
                                                    src={link.icon}
                                                    alt="logo"
                                                    width={24}
                                                    height={24}
                                                    className={`${isActive && 'brightness-200'}`}
                                                />
                                                {link.label}
                                            </Link>
                                    </li>
                                )
                            })}
                        </ul>

                        <ul className="sidebar-nav_elements">

                        {navLinks.slice(6).map((link) => {

                                const isActive = link.route === pathname

                                return (
                                    <li key={link.route} 
                                        className={`sidebar-nav_element group
                                        
                                        // Only when it is active
                                        ${ isActive ? 'bg-purple-gradient text-white'
                                                    : 'text-gray-700'}
                                        `}>
                                            <Link className="sidebar-link" href={link.route}>
                                                <Image 
                                                    src={link.icon}
                                                    alt="logo"
                                                    width={24}
                                                    height={24}
                                                    className={`${isActive && 'brightness-200'}`}
                                                />
                                                {link.label}
                                            </Link>
                                    </li>
                                )
                            })}

                            <li className="flex-center cursor-pointer gap-2 p-4">
                                <UserButton afterSignOutUrl='/' showName />
                            </li>
                        </ul>
                    </SignedIn>

                    <SignedOut>
                        {/* asChild property will make it render as a link */}
                        <Button asChild className="button bg-purple-gradient bg-cover">
                            <Link href="/sign-in">Login</Link>
                        </Button>
                    </SignedOut>
                </nav>
            </div>
        </aside>
    )
}

export default Sidebar
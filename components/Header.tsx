"use client";
import { SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "./ui/button";
import { FilePlus2, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useInterview } from "./Interview-context";

function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { isInterviewActive } = useInterview();

    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [mobileMenuOpen]);

    // Si hay una entrevista activa, no mostramos el header
    if (isInterviewActive) {
        return null;
    }

    return (
        <div className="relative z-50">
            <div className="flex justify-between items-center bg-white shadow-sm p-5 border-b sticky top-0">
                <Link href="/dashboard" className="text-blue-500 font-semibold text-lg">
                    hackthejob.ai
                </Link>

                <SignedIn>
                    <div className="flex items-center space-x-2">
                        <Button asChild variant="link" className="hidden md:flex">
                            <Link href="/dashboard/upgrade">Pricing</Link>
                        </Button>

                        <Button asChild variant="outline" className="hidden md:flex">
                            <Link href="/dashboard">Mis entrevistas</Link>
                        </Button>

                        <Button asChild variant="outline" className="border-blue-600 hidden md:flex">
                            <Link href="/dashboard/upload">
                                <FilePlus2 className="text-blue-600" />
                            </Link>
                        </Button>

                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="md:hidden"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </Button>

                        <UserButton />
                    </div>
                </SignedIn>
            </div>

            <div 
                className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
                    mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={() => setMobileMenuOpen(false)}
            />

            <div 
                className={`fixed top-0 right-0 h-full w-64 bg-white z-50 shadow-lg transform transition-transform duration-300 ease-in-out rounded-l-2xl ${
                    mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                <div className="flex flex-col h-full">
                    <div className="flex justify-between items-center p-5 border-b">
                        <span className="text-blue-500 font-semibold text-lg">Menu</span>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setMobileMenuOpen(false)}
                            aria-label="Close menu"
                        >
                            <X className="h-6 w-6" />
                        </Button>
                    </div>
                    <nav className="flex-grow">
                        <ul className="p-5 space-y-4">
                            <li>
                                <Link href="/dashboard/upgrade" className="text-gray-800 text-lg block py-2" onClick={() => setMobileMenuOpen(false)}>
                                    Pricing
                                </Link>
                            </li>
                            <li>
                                <Link href="/dashboard" className="text-gray-800 text-lg block py-2" onClick={() => setMobileMenuOpen(false)}>
                                    Mis entrevistas
                                </Link>
                            </li>
                            <li>
                                <Link href="/dashboard/upload" className="text-gray-800 text-lg block py-2" onClick={() => setMobileMenuOpen(false)}>
                                    Upload
                                </Link>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </div>
    );
}

export default Header;
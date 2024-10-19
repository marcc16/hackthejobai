import { SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "./ui/button";
import { FilePlus2 } from "lucide-react";
import Image from "next/image";
//import UpgradeButton from "./UpgradeButton";

function Header() {
    return (
        <div className="flex justify-between items-center bg-white shadow-sm p-5 border-b">
            <Link href="/dashboard">
                <Image src="/logo3.png" alt="hackthejob.ai logo" className="h-7 w-auto" width={200} height={40} />
            </Link>

            <SignedIn>
                <div className="flex items-center space-x-2">
                    <Button asChild variant="link" className="hidden md:flex">
                        <Link href="/dashboard/upgrade">Pricing</Link>
                    </Button>

                    <Button asChild variant="outline">
                        <Link href="/dashboard">Mis entrevistas</Link>
                    </Button>

                    <Button asChild variant="outline" className="border-blue-600">
                        <Link href="/dashboard/upload">
                            <FilePlus2 className="text-blue-600" />
                        </Link>
                    </Button>

                    <UserButton />
                </div>
            </SignedIn>
        </div>
    );
}
export default Header;

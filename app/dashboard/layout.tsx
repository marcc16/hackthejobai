import Header from "@/components/Header";
import { ClerkLoaded } from "@clerk/nextjs";
import { InterviewProvider } from "@/components/Interview-context";

function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkLoaded>
      <InterviewProvider>
        <div className="flex-1 flex flex-col h-screen">
          <Header />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </InterviewProvider>
    </ClerkLoaded>
  );
}

export default DashboardLayout;
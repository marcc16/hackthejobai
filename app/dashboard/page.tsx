import Documents from "@/components/Documents";

export const dynamic = "force-dynamic";

function Dashboard() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-semibold text-blue-500 mb-8">
          Mis entrevistas
        </h1>

        <div className="bg-white shadow-sm rounded-lg p-6">
          <Documents />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
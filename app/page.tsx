import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  // Test database connection
  const tenantCount = await prisma.tenant.count();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">Structura</h1>
        <p className="text-xl text-gray-600 mb-8">
          Multi-Tenant Website Builder
        </p>
        <div className="bg-white rounded-lg shadow-lg p-6 inline-block">
          <p className="text-sm text-gray-500 mb-2">Database Status</p>
          <p className="text-2xl font-semibold text-green-600">✓ Connected</p>
          <p className="text-sm text-gray-400 mt-2">Tenants: {tenantCount}</p>
        </div>
      </div>
    </div>
  );
}

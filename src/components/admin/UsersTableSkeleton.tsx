export function UsersTableSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Usuario
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Empresa
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Rol
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Estado
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Fecha
              </th>
              <th className="px-5 py-3 w-24" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {Array.from({ length: 5 }).map((_, idx) => (
              <tr key={idx} className="animate-pulse">
                <td className="px-5 py-4">
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-gray-200 rounded" />
                    <div className="h-3 w-48 bg-gray-100 rounded" />
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="h-4 w-28 bg-gray-200 rounded" />
                </td>
                <td className="px-5 py-4">
                  <div className="h-6 w-16 bg-gray-200 rounded-full" />
                </td>
                <td className="px-5 py-4">
                  <div className="h-6 w-20 bg-gray-200 rounded-full" />
                </td>
                <td className="px-5 py-4">
                  <div className="h-3 w-24 bg-gray-200 rounded" />
                </td>
                <td className="px-5 py-4">
                  <div className="h-8 w-20 bg-gray-200 rounded ml-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

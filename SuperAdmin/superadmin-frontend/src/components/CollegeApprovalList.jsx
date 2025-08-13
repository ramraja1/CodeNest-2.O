export default function CollegeApprovalList({ colleges, onAction ,status }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded shadow">
        <thead>
          <tr className="text-left border-b">
            <th className="py-2 px-4">College Name</th>
            <th className="py-2 px-4">Contact Person</th>
            <th className="py-2 px-4">Email</th>
            <th className="py-2 px-4">Requested On</th>
            <th className="py-2 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {colleges.map(college => (
            <tr key={college._id} className="border-b hover:bg-gray-50">
              <td className="py-2 px-4 font-medium">{college.name}</td>
              <td className="py-2 px-4">{college.contactName || "-"}</td>
              <td className="py-2 px-4">{college.email}</td>
              <td className="py-2 px-4">
                {college.createdAt
                  ? new Date(college.createdAt).toLocaleDateString()
                  : "-"}
              </td>
              <td className="py-2 px-4 flex gap-2">
                {
                  status=="pending"? <button
                  onClick={() => onAction(college._id, true)}
                  className="px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                  title="Approve"
                >
                  Approve
                </button> : null
                }
                
                <button
                  onClick={() => onAction(college._id, false)}
                  className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600"
                  title="Reject"
                >
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

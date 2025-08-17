import React from "react";
import { useOutletContext } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";

export default function BatchMembers() {
  const { batch } = useOutletContext();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Members</h2>
      {batch.students?.length ? (
        <ul className="space-y-3">
          {batch.students.map((student) => (
            <li
              key={student._id}
              className="flex items-center gap-3 bg-white p-3 rounded shadow"
            >
              <FaUserCircle size={30} className="text-gray-500" />
              <span>{student.name || "Unnamed Student"}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600">No members in this batch yet.</p>
      )}
    </div>
  );
}

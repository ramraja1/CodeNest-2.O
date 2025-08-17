import React from "react";
import { useOutletContext } from "react-router-dom";

export default function BatchOverview() {
  const { batch } = useOutletContext();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Batch Overview</h2>
      <p className="text-gray-700">{batch.description || "No description provided."}</p>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-semibold mb-2">Upcoming Contest</h3>
        {batch.nextContest ? (
          <p>{batch.nextContest.title} • {new Date(batch.nextContest.startTime).toLocaleString()}</p>
        ) : (
          <p>No upcoming contests yet.</p>
        )}
      </div>
    </div>
  );
}

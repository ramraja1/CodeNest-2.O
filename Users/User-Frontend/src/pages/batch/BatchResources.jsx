import React from "react";
import { useOutletContext } from "react-router-dom";

export default function BatchResources() {
  const { batch } = useOutletContext();

  return (
    <div>
      <h2 className="text-2xl font-bold">Resources</h2>
      {batch.resources?.length ? (
        <ul className="list-disc ml-6 mt-4 text-gray-700 space-y-2">
          {batch.resources.map((r, idx) => (
            <li key={idx}>
              <a
                href={r.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 hover:underline"
              >
                {r.title}
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600 mt-2">No resources available yet.</p>
      )}
    </div>
  );
}

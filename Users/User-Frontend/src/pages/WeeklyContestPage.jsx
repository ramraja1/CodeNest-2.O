import React from 'react';
import { useNavigate } from 'react-router-dom';

const weeklyContestsDummy = [
  {
    id: 1,
    name: "Week 39 Coding Sprint",
    startDate: new Date("2025-09-22T10:00:00"),
    endDate: new Date("2025-09-28T23:59:59"),
    description: "A weekly set of 5 quick problems to boost your skills.",
  },
  {
    id: 2,
    name: "Week 40 Algorithm Challenge",
    startDate: new Date("2025-09-29T10:00:00"),
    endDate: new Date("2025-10-05T23:59:59"),
    description: "Fresh algorithm problems every week to practice and compete.",
  },
];

const WeeklyContestPage = () => {
  const navigate = useNavigate();
  const [now, setNow] = React.useState(new Date());

  React.useEffect(() => {
    const intervalId = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(intervalId);
  }, []);

  const formatTimeLeft = (millis) => {
    const totalSeconds = Math.floor(millis / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white p-10 max-w-5xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="mb-10 px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-md shadow-md flex items-center gap-2"
      >
        &larr; Back
      </button>

      <h1 className="text-4xl font-bold text-indigo-900 mb-12 text-center">Weekly Contests</h1>

      <div className="space-y-10">
        {weeklyContestsDummy.map(({ id, name, startDate, endDate, description }) => {
          const started = now >= startDate;
          const ended = now > endDate;
          const timeLeft = ended ? "Contest Ended" : started ? `Ends in ${formatTimeLeft(endDate - now)}` : `Starts in ${formatTimeLeft(startDate - now)}`;

          return (
            <div
              key={id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
            >
              <h2 className="text-2xl font-semibold text-indigo-900 mb-2">{name}</h2>
              <p className="text-indigo-700 mb-3">{description}</p>
              <p className="mb-3 font-semibold text-indigo-800">{timeLeft}</p>
              <button
                onClick={() => alert(`Starting Weekly Contest: ${name}`)}
                disabled={!started || ended}
                className={`px-5 py-2 rounded-md text-white font-semibold transition ${
                  !started || ended ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {ended ? "Ended" : started ? "Start Contest" : "Coming Soon"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyContestPage;

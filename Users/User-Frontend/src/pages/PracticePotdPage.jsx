import React, { useEffect, useState } from "react";

export default function PracticePotdOverview() {
  const [currentPotd, setCurrentPotd] = useState(null);
  const [previousPotds, setPreviousPotds] = useState([]);
  const [userStats, setUserStats] = useState({ streak: 0, calendar: [] });
  const token = localStorage.getItem("token");
  const server = import.meta.env.VITE_SERVER;

  useEffect(() => {
    async function fetchData() {
      try {
        const [todayRes, prevRes, userRes] = await Promise.all([
          fetch(`${server}/api/potd/today`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${server}/api/potd/previous`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${server}/api/users/me`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (todayRes.ok) setCurrentPotd(await todayRes.json());
        if (prevRes.ok) setPreviousPotds(await prevRes.json());
        if (userRes.ok) {
          const user = await userRes.json();
          setUserStats({ streak: user.potdStats?.streak || 0, calendar: user.streak?.calendar || [] });
        }
      } catch (error) {
        console.error("Error loading data", error);
      }
    }
    fetchData();
  }, [server, token]);

  // Countdown Timer for next midnight
  const getTimeRemaining = () => {
    const now = new Date();
    const nextMidnight = new Date();
    nextMidnight.setHours(24, 0, 0, 0);
    const diff = nextMidnight - now;
    if (diff <= 0) return "00:00:00";

    const hours = String(Math.floor(diff / 3600000)).padStart(2,"0");
    const mins = String(Math.floor((diff % 3600000) / 60000)).padStart(2,"0");
    const secs = String(Math.floor((diff % 60000) / 1000)).padStart(2,"0");
    return `${hours}:${mins}:${secs}`;
  };

  const [timer, setTimer] = useState(getTimeRemaining());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(getTimeRemaining());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSolveClick = () => {
    // Replace with your navigation logic
    alert("Navigate to solve POTD page");
  };

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-10 bg-gradient-to-b from-emerald-50 to-white min-h-screen">
      <header className="flex justify-between items-center">
        <h1 className="text-4xl font-extrabold text-emerald-700">Problem of the Day</h1>
        <button onClick={() => window.location.href = "/student"} className="text-emerald-700 font-semibold hover:underline">Back to Dashboard</button>
      </header>

      {currentPotd ? (
        <section className="bg-white p-6 rounded-lg shadow flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold">{currentPotd.questionId.title}</h2>
            <p className="mt-1 text-gray-600 font-mono text-sm">Time remaining: <span className="font-bold">{timer}</span></p>
          </div>
          <button 
            onClick={handleSolveClick} 
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2 rounded shadow"
          >
            Solve Now
          </button>
        </section>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow text-center text-gray-600 text-lg">
          No Problem of the Day assigned yet.
        </div>
      )}

      <section>
        <h2 className="text-3xl font-semibold text-gray-700 mb-6">Previous Problems</h2>
        <div className="flex overflow-x-auto space-x-4">
          {previousPotds.length === 0 && (
            <p className="text-gray-500 italic">No previous problems available</p>
          )}
          {previousPotds.map(p => (
            <div key={p._id} className="min-w-[240px] bg-white p-4 rounded-lg shadow cursor-pointer flex flex-col justify-between"
              onClick={() => alert(`Open POTD ${p.questionId.title}`)}>
              <h3 className="font-semibold text-lg text-emerald-700">{p.questionId.title}</h3>
              <p className="text-gray-600 mt-2 text-sm line-clamp-3">{p.questionId.description}</p>
              <div className="mt-3 flex justify-between items-center">
                <span className={`text-sm font-semibold px-2 py-1 rounded ${p.solved ? "bg-green-200 text-green-700" : "bg-gray-200 text-gray-600"}`}>
                  {p.solved ? "Solved" : "Unsolved"}
                </span>
                <button 
                  className="text-sm text-emerald-600 hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    
                  }}
                >
                  Solve
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-semibold text-gray-700 mb-6">Your Streak</h2>
        <StreakCalendar calendar={userStats.calendar} />
      </section>
    </div>
  );
}


// Simple GitHub-style streak calendar grid
function StreakCalendar({ calendar }) {
  // Group calendar by week, assuming calendar is sorted by date
  // calendar is array of { date: "YYYY-MM-DD", solved: boolean }

  if (!calendar || calendar.length === 0) {
    return <p className="text-gray-500 italic">No streak data available.</p>;
  }

  // Create a map of dates to solved for quick lookup
  const solvedMap = {};
  calendar.forEach((day) => {
    solvedMap[day.date] = day.solved;
  });

  // Get a range of the last N days (e.g., last 30 days)
  const daysToShow = 30;
  const today = new Date();
  const dates = [];
  for (let i = daysToShow - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10)); // YYYY-MM-DD
  }

  return (
    <div className="grid grid-cols-7 gap-1">
      {dates.map((date) => {
        const solved = solvedMap[date];
        const bgColor = solved ? "bg-emerald-600" : "bg-gray-300";
        return (
          <div
            key={date}
            title={`${date}: ${solved ? "Solved" : "Missed"}`}
            className={`${bgColor} w-7 h-7 rounded shadow cursor-default`}
          />
        );
      })}
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import {
  FaEdit,
  FaUser,
  FaAt,
  FaUniversity,
  FaMedal,
  FaChartLine,
  FaAward,
  FaCrown,
  FaCamera,
  FaBell,
  FaTrophy,
  FaLock,
  FaArrowLeft,
  FaTable,
  FaBars,
  FaTimes,
  FaDownload,
  FaHome,
} from "react-icons/fa";
import classNames from "classnames";
import { Tooltip } from "react-tooltip";
import { toast } from "react-toastify";// Toast notifications import

// ---------------- Utility Functions ----------------
function formatDate(date) {
  const d = new Date(date);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

const token = localStorage.getItem("token");
const server = `${import.meta.env.VITE_SERVER}`;

const contestCSVExport = (contests) => {
  const header = ["Contest", "Rank", "Trophy", "Score"];

  const rows = contests.map((c) => [
    `"${c.title ?? ""}"`, // Quote strings to handle commas
    c.rank ?? "",
    c.trophy ?? "",
    c.totalScore ?? "",
  ]);

  const csvContent = [header, ...rows].map((e) => e.join(",")).join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "contests.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  toast.success("Contest data exported as CSV ✅");
};

// ---------------- Main Component ----------------
export default function MyProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const toggleSidebar = () => setSidebarOpen((s) => !s);

  useEffect(() => {
    async function fetchUserData() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${server}/api/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch user data");
        const data = await response.json();
        setUser({
          ...data,
          streak: data.streak || {
            current: 0,
            longest: 0,
            calendar: [],
          },
          potdStats: data.potdStats || {
            attempted: 0,
            solved: 0,
            streak: 0,
            progress: [],
          },
        });
        toast.success("Profile loaded ✅");
      } catch (err) {
        setError(err.message);
        toast.error("Failed to load profile ❌");
      } finally {
        setLoading(false);
      }
    }
    fetchUserData();
  }, []);

  function onAvatarChange(e) {
    const file = e.target.files?.[0];
    if (file) {
      setUser((u) => ({ ...u, avatarUrl: URL.createObjectURL(file) }));
      toast("Avatar preview updated 👤");
    }
  }

  function exportCSV() {
    if (!user?.contestStats?.length) {
      toast("No contests to export.");
      return;
    }
    contestCSVExport(user.contests);
  }

  const goBackHome = () => {
    toast("Returning back home 🏠");
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-lg font-semibold">
        Loading user profile...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-red-600 font-semibold">
        <p>Error loading profile: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row transition-colors duration-500 bg-slate-50 text-slate-900">
      <Sidebar user={user} sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="flex-1 flex flex-col min-h-screen overflow-auto">
        <TopNavbar user={user} toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} onBackHome={goBackHome} />

        <main className="flex-grow w-full max-w-7xl mx-auto p-4 md:p-10 space-y-10">
          <ProfileHeader user={user} onAvatarChange={onAvatarChange} onEditClick={() => setEditModalOpen(true)} />
          <AchievementsSection achievements={user.achievements || []} />
          <ContestPerformance onExportCSV={exportCSV} />
          <SecurityPreferences />
        </main>
      </div>

      {editModalOpen && (
        <EditProfileModal
          user={user}
          setUser={setUser}
          onClose={() => setEditModalOpen(false)}
          saving={saving}
          setSaving={setSaving}
        />
      )}

      <Tooltip id="tooltip" />
    </div>
  );
}

// ---------------- Sidebar ----------------
function Sidebar({ user, sidebarOpen, toggleSidebar }) {
  return (
    <>
      {/* Overlay on mobile */}
      <div
        onClick={toggleSidebar}
        className={classNames(
          "fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden transition-opacity",
          {
            "opacity-100 pointer-events-auto": sidebarOpen,
            "opacity-0 pointer-events-none": !sidebarOpen,
          }
        )}
      />

      <aside
        className={classNames(
          "fixed top-0 left-0 h-screen w-64 flex flex-col py-10 px-5 border-r bg-white shadow-lg z-50 transition-transform md:translate-x-0 md:static md:flex-shrink-0 overflow-y-auto",
          { "-translate-x-full": !sidebarOpen, "translate-x-0": sidebarOpen }
        )}
      >
        <button
          onClick={toggleSidebar}
          className="md:hidden absolute top-5 right-5 p-2 text-gray-600 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
          aria-label="Close menu"
        >
          <FaTimes />
        </button>
        <div className="flex items-center gap-3 mb-12">
          <img
            src={user.avatarUrl}
            alt={`${user.name} avatar`}
            className="h-12 w-12 rounded-full border-2 border-emerald-400 object-cover"
          />
          <div>
            <p className="font-semibold text-lg leading-none">{user.name}</p>
            <p className="text-xs text-emerald-500">{user.collegeName}</p>
          </div>
        </div>
        <nav className="space-y-3 font-semibold text-slate-700" aria-label="Sidebar Navigation">
          <NavLink icon={<FaUser />} label="Profile" active />
          <NavLink icon={<FaTable />} label="Contests" />
          <NavLink icon={<FaChartLine />} label="Stats" />
          <NavLink icon={<FaBell />} label="Notifications" />
          <NavLink icon={<FaLock />} label="Security" />
        </nav>
      </aside>
    </>
  );
}

// ---------------- Top Navbar -----------------
function TopNavbar({ user, toggleSidebar, sidebarOpen, onBackHome }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b bg-white sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          aria-label="Toggle menu"
          className="md:hidden text-slate-600 p-2 rounded hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
        >
          {sidebarOpen ? <FaTimes /> : <FaBars />}
        </button>
        <button
          onClick={onBackHome}
          aria-label="Go back home"
          className="text-slate-600 p-2 rounded hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition flex items-center gap-1"
        >
          <FaHome /> Home
        </button>
      </div>

      <h1 className="text-2xl font-extrabold select-none hidden md:block">My Dashboard</h1>

      <div className="flex items-center gap-4 relative select-none">
        <button
          className="p-2 rounded-full hover:bg-slate-200 transition focus:outline-none focus:ring-2 focus:ring-emerald-500"
          aria-label="View notifications"
        >
          <FaBell />
        </button>
        <button
          tabIndex={0}
          onClick={() => setDropdownOpen((o) => !o)}
          onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
          aria-haspopup="true"
          aria-expanded={dropdownOpen}
          className="rounded-full border border-gray-300 hover:border-emerald-500 transition p-[2px] focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <img src={user.avatarUrl} alt={`${user.name} avatar`} className="h-9 w-9 rounded-full object-cover" />
        </button>

        {dropdownOpen && (
          <ul
            className="absolute right-0 top-full mt-2 w-40 bg-white shadow-lg rounded-xl py-2 text-sm text-slate-700 z-40 border border-slate-300"
            role="menu"
            aria-label="User menu"
          >
            <li>
              <a href="#" className="block px-4 py-2 hover:bg-emerald-100 focus:bg-emerald-200 focus:outline-none">
                Your Profile
              </a>
            </li>
            <li>
              <a href="#" className="block px-4 py-2 hover:bg-emerald-100 focus:bg-emerald-200 focus:outline-none">
                Settings
              </a>
            </li>
            <li>
              <hr className="border-slate-300 my-1" />
            </li>
            <li>
              <a href="#" className="block px-4 py-2 text-red-600 hover:bg-red-100 focus:bg-red-200 focus:outline-none">
                Logout
              </a>
            </li>
          </ul>
        )}
      </div>
    </header>
  );
}

// ---------------- Profile Header -----------------
function ProfileHeader({ user, onAvatarChange, onEditClick }) {
  const fileInputRef = useRef();

  return (
    <section className="bg-white rounded-3xl shadow-xl md:p-12 flex flex-col md:flex-row gap-10 items-center transition">
      <div className="relative group">
        <img
          src={user.avatarUrl}
          alt="Avatar"
          className="w-40 h-40 rounded-full border-4 border-emerald-400 shadow-md object-cover select-none"
          draggable={false}
          loading="lazy"
        />
      </div>
      <div className="flex-1 space-y-2 select-text">
        <h2 className="text-3xl font-extrabold tracking-tight break-words">{user.name}</h2>
        <p className="flex items-center gap-2 text-slate-500">
          <FaAt />
          {user.email}
        </p>
        <p className="flex items-center gap-2 text-emerald-600">
          <FaUniversity />
          {user.collegeName}
        </p>
        <p className="my-4 text-lg max-w-xl whitespace-pre-wrap break-words">{user.bio}</p>
        <button
          onClick={onEditClick}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-500 transition"
          aria-label="Edit Profile"
        >
          <FaEdit /> Edit Profile
        </button>
      </div>
      <div className="flex flex-col gap-5 justify-center min-w-[180px]">
        <ValueWidget label="Coins" value={user.codingPoints} color="emerald" />
        <ValueWidget label="Solved" value={user.solvedQuestions.length} color="blue" />
      </div>
    </section>
  );
}

// ---------------- ValueWidget ------------------
function ValueWidget({ label, value, color = "emerald" }) {
  return (
    <div
      className={classNames(
        `bg-${color}-100 rounded-xl p-4 flex flex-col items-center shadow font-semibold select-text`
      )}
    >
      <span className={`text-sm text-${color}-600 opacity-80`}>{label}</span>
      <span className={`text-3xl font-bold text-${color}-700 font-mono select-text`}>{value}</span>
    </div>
  );
}

// ---------------- NavLink ----------------------
function NavLink({ icon, label, active }) {
  return (
    <a
      href="#"
      className={classNames(
        "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-semibold text-slate-700 select-none",
        "hover:bg-emerald-100 hover:text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500",
        { "bg-emerald-100 text-emerald-700": active }
      )}
      aria-current={active ? "page" : undefined}
    >
      {icon}
      <span>{label}</span>
    </a>
  );
}

// ---------------- Achievements ---------------------
function AchievementsSection({ achievements }) {
  if (achievements.length === 0) {
    return (
      <section className="bg-white rounded-3xl shadow-xl p-8 text-center text-slate-400 border-2 border-dashed">
        🚀 Start solving problems to unlock achievements!
      </section>
    );
  }

  return (
    <section className="bg-white rounded-3xl shadow-xl p-8">
      <h3 className="text-2xl font-bold flex gap-2 items-center mb-6">
        <FaMedal className="text-amber-400" />
        Achievements
      </h3>
      <div className="flex flex-wrap gap-8 mt-4">
        {achievements.map(({ icon, name, description }, i) => (
          <TooltipBadge key={i} icon={icon} name={name} description={description} />
        ))}
      </div>
    </section>
  );
}

function TooltipBadge({ icon, name, description }) {
  return (
    <div
      className="flex flex-col items-center gap-2 cursor-pointer group"
      data-tip={description}
      tabIndex={0}
      aria-label={`${name}: ${description}`}
    >
      <div className="w-16 h-16 flex items-center justify-center rounded-full bg-emerald-100 shadow transform transition-transform group-hover:scale-110 group-focus:scale-110 animate-pulse-slow">
        {icon}
      </div>
      <span className="text-slate-600 font-medium text-sm select-text">{name}</span>
    </div>
  );
}

// ---------------- Contest Performance ---------------------
function ContestPerformance({ onExportCSV }) {
  const [visibleCount, setVisibleCount] = useState(5);
  const [contests, setContests] = useState([]);

  const handleShowMore = () => setVisibleCount((prev) => prev + 5);

  useEffect(() => {
    async function fetchContests() {
      try {
        const res = await fetch(`${server}/api/submissions/contests`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setContests(data);
          toast.success("Contest data loaded ✅");
        } else {
          setContests([]);
          toast.error("Failed to load contest data ❌");
        }
      } catch {
        setContests([]);
        toast.error("Error loading contest data ❌");
      }
    }
    fetchContests();
  }, []);

  return (
    <ProfileCard title="Contest Rankings" icon={<FaTable />}>
      <div className="overflow-x-auto rounded-lg flex flex-col">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="px-6 py-2 text-left w-2/5">Contest</th>
              <th className="px-6 py-2 text-center w-1/6">Rank</th>
              <th className="px-6 py-2 text-center w-1/6">Trophy</th>
              <th className="px-6 py-2 text-right w-1/6">Score</th>
            </tr>
          </thead>
          <tbody>
            {contests.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center text-slate-400 py-4">
                  No contest records found.
                </td>
              </tr>
            ) : (
              contests.slice(0, visibleCount).map((c) => (
                <tr key={c.contestId}>
                  <td className="px-6 py-2 text-left">{c.title || "N/A"}</td>
                  <td className="px-6 py-2 text-center">{c.rank ?? "-"}</td>
                  <td className="px-6 py-2 text-center">{c.trophy || ""}</td>
                  <td className="px-6 py-2 text-right">{c.totalScore ?? "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {contests.length > visibleCount && (
          <div className="flex justify-center mt-3">
            <button
              className="px-4 py-1 border border-blue-500 rounded text-blue-500 hover:bg-blue-50"
              onClick={handleShowMore}
            >
              Show More
            </button>
          </div>
        )}

        <div className="flex justify-end mt-4">
          <button
            className="px-4 py-1 border border-green-600 rounded text-green-700 hover:bg-green-50"
            onClick={() => onExportCSV(contests)}
            disabled={!contests.length}
          >
            Download CSV
          </button>
        </div>
      </div>
    </ProfileCard>
  );
}

// ---------------- Security & Preferences ---------------------
function SecurityPreferences() {
  return (
    <section className="bg-white rounded-3xl shadow-xl p-8 space-y-4">
      <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
        <FaLock className="text-slate-600" /> Security & Preferences
      </h3>
      <button className="block w-full px-4 py-3 rounded bg-emerald-100 text-emerald-700 hover:bg-emerald-200 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition">
        Change Password
      </button>
      <button className="block w-full px-4 py-3 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
        Connect GitHub
      </button>
    </section>
  );
}

// ---------------- Edit Profile Modal -----------------
export function EditProfileModal({ user, setUser, onClose, saving, setSaving }) {
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio);
  const [college, setCollege] = useState(user.collegeName);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef();

  useEffect(() => {
    setAvatarUrl(user.avatarUrl);
  }, [user.avatarUrl]);

  function validate() {
    const errs = {};
    if (!name.trim()) errs.name = "Name is required";
    if (!college.trim()) errs.college = "College is required";
    return errs;
  }

  async function uploadImage(file) {
    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await fetch(`${server}/api/users/upload-image`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Image upload failed");
      const data = await res.json();
      toast.success("Image uploaded successfully 📷");
      return data.imageUrl || data.avatarUrl;
    } catch {
      toast.error("Failed to upload image ❌");
      return null;
    } finally {
      setUploading(false);
    }
  }

  async function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadImage(file);
    if (url) {
      setAvatarUrl(url);
    }
  }

  async function handleSave() {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.error("Please fix the form errors ❌");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${server}/api/users`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, bio, collegeName: college, avatarUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }
      const updatedUser = await response.json();
      setUser(updatedUser);
      onClose();
      toast.success("Profile updated successfully 🎉");
    } catch (error) {
      toast.error(error.message || "Failed to update profile ❌");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-[1000] backdrop-blur-sm px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-profile-title"
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-8 relative overflow-auto max-h-[90vh]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 focus:outline-none"
          aria-label="Close edit profile dialog"
          type="button"
        >
          <FaArrowLeft size={20} />
        </button>

        {/* Title */}
        <h2 id="edit-profile-title" className="text-2xl font-bold mb-8 select-text">
          Edit Profile
        </h2>

        {/* Avatar upload */}
        <div className="flex flex-col items-center gap-4 mb-8">
          <img
            src={avatarUrl || "/default-avatar.png"}
            alt="Avatar Preview"
            className="w-28 h-28 rounded-full object-cover border-2 border-emerald-400"
            draggable={false}
          />
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="hidden"
            aria-hidden="true"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className={classNames(
              "px-4 py-2 rounded bg-emerald-600 text-white transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400",
              { "opacity-70 cursor-not-allowed": uploading }
            )}
          >
            {uploading ? "Uploading..." : <> <FaCamera className="inline mr-1" /> Change Profile Photo</>}
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
          className="space-y-6"
          noValidate
        >
          {/* Name */}
          <div>
            <label htmlFor="name" className="block font-semibold mb-1">
              Name
            </label>
            <input
              id="name"
              type="text"
              className={classNames(
                "w-full rounded-lg border p-2 transition focus:ring-2 focus:outline-none",
                errors.name ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-emerald-400",
                "bg-white text-slate-900"
              )}
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-invalid={errors.name ? "true" : "false"}
              aria-describedby={errors.name ? "name-error" : undefined}
              autoFocus
            />
            {errors.name && (
              <p className="text-red-600 mt-1 text-sm" id="name-error">
                {errors.name}
              </p>
            )}
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block font-semibold mb-1">
              Bio
            </label>
            <textarea
              id="bio"
              rows={3}
              className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-emerald-400 transition bg-white text-slate-900"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          {/* College */}
          <div>
            <label htmlFor="college" className="block font-semibold mb-1">
              College
            </label>
            <input
              id="college"
              type="text"
              className={classNames(
                "w-full rounded-lg border p-2 transition focus:outline-none focus:ring-2",
                errors.college ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-emerald-400",
                "bg-white text-slate-900"
              )}
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              aria-invalid={errors.college ? "true" : "false"}
              aria-describedby={errors.college ? "college-error" : undefined}
            />
            {errors.college && (
              <p className="text-red-600 mt-1 text-sm" id="college-error">
                {errors.college}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              className="px-6 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-500 transition disabled:opacity-50"
              disabled={saving}
              aria-busy={saving}
              aria-live="polite"
            >
              {saving ? <FaTimes className="animate-spin mx-auto" /> : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------- ProfileCard (container) -----------
function ProfileCard({ icon, title, children }) {
  return (
    <section className="bg-white rounded-2xl shadow-lg p-6 transition-colors duration-300">
      <h3 className="font-bold text-xl flex items-center gap-3 mb-6 select-text">
        {icon} {title}
      </h3>
      {children}
    </section>
  );
}

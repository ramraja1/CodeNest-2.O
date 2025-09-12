import Batch from "../models/Batch.js";
import User from "../models/user.js";

// For dashboard top-bar stats
export const getCollegeAdminStats = async (req, res) => {
  try {
    const collegeId = req.user.collegeId;

    // 1. All batches of this college
    const batches = await Batch.find({ collegeId }).select("_id students").lean();
    const totalBatches = batches.length;

    // 2. Collect ALL unique students from all batches
    const studentSet = new Set();
    batches.forEach(batch => {
      (batch.students || []).forEach(studentId => {
        studentSet.add(String(studentId)); // always string for Set
      });
    });
    const totalStudents = studentSet.size;

    // 3. Performance: avg contest score for these students
    // If you want performance, you need to query these specific users
    let performance = "N/A";
    const studentIds = Array.from(studentSet);
    if (studentIds.length > 0) {
      const users = await User.find({ _id: { $in: studentIds } }, "contestStats");
      let totalScore = 0, contestCount = 0;
      users.forEach(user =>
        (user.contestStats || []).forEach(stat => {
          totalScore += stat.score || 0;
          contestCount += 1;
        })
      );
      performance = contestCount > 0 ? `${Math.round(totalScore / contestCount)} pts` : "0 pts";
    }

   

    res.json({
      batches: totalBatches,
      students: totalStudents,
      performance,
    });
  } catch (err) {
    console.error("Dashboard Stats Error:", err);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
};

// GET /api/collegeadmin/student-progress
export const getCollegeStudentsData = async (req, res) => {
  try {
    const collegeId = req.user.collegeId;

    // 1. Get all batches for this college
    const batches = await Batch.find({ collegeId })
      .select("_id name students")
      .lean();

    // 2. Gather all unique student ObjectIds
    const studentIdSet = new Set();
    batches.forEach(batch => {
      (batch.students || []).forEach(id => studentIdSet.add(String(id)));
    });
    const studentIds = Array.from(studentIdSet);

    // 3. Fetch student users and calculate progress metrics (**add avatarUrl**)
    const studentsRaw = studentIds.length
      ? await User.find({ _id: { $in: studentIds } })
          .select("_id name email avatarUrl batches solvedQuestions contestStats codingPoints")
          .lean()
      : [];

    // 4. Normalize student data for dashboard
    const students = studentsRaw.map(student => {
      const contests = Array.isArray(student.contestStats)
        ? student.contestStats.length
        : 0;
      const solved = Array.isArray(student.solvedQuestions)
        ? student.solvedQuestions.length
        : 0;
      const bestRank = Array.isArray(student.contestStats)
        ? student.contestStats.reduce(
            (minRank, st) => st.rank > 0 && st.rank < minRank ? st.rank : minRank,
            Number.POSITIVE_INFINITY
          )
        : "-";
      const target = 150;
      const percentage = target ? Math.round((solved / target) * 100) : 0;

      return {
        _id: student._id,
        name: student.name,
        email: student.email,
        avatarUrl: student.avatarUrl || "", // used for real profile pic
        batches: student.batches || [],
        contests,
        solved,
        rank: Number.isFinite(bestRank) ? bestRank : "-",
        percentage
      };
    });

    res.json({
      batches,
      students
    });
  } catch (err) {
    console.error("Student Progress Error:", err);
    res.status(500).json({ error: "Failed to fetch student progress" });
  }
};

import Activity from "../models/Activity.js";

// GET /api/collegeadmin/activities?limit=10
export const getCollegeActivities = async (req, res) => {
  try {
    const collegeId = req.user.collegeId;
    const limit = parseInt(req.query.limit) || 10;
    const activities = await Activity.find({ collegeId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    res.json(activities);
  } catch (err) {
    console.error("Activities Error:", err);
    res.status(500).json({ error: "Failed to fetch activity feed" });
  }
};

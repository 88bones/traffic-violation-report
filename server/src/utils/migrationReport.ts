import User from "../models/userModel.js";
import Report from "../models/reportModel.js";

export const syncExistingReportsToUsers = async (): Promise<void> => {
  try {
    // 1. Fetch all reports with user IDs
    const reports = await Report.find({}, "_id reportedBy").lean();

    // 2. Group report IDs by reportedBy userId
    const userReportsMapMap = new Map<string, Array<any>>();

    reports.forEach((report) => {
      const userId = report.reportedBy.toString();
      if (!userReportsMapMap.has(userId)) {
        userReportsMapMap.set(userId, []);
      }
      userReportsMapMap.get(userId)?.push(report._id);
    });

    // 3. Batch update each user's reports array
    for (const [userId, reportIds] of userReportsMapMap.entries()) {
      await User.findByIdAndUpdate(userId, {
        $addToSet: { reports: { $each: reportIds } },
      });
    }

    console.log("Successfully synced all existing reports to user schemas.");
  } catch (error) {
    console.error("Error syncing reports to users:", error);
  }
};

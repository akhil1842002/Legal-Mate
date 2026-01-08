import asyncHandler from 'express-async-handler';
import FIR from '../models/FIR.js';
import SearchLog from '../models/SearchLog.js';
import SavedQuery from '../models/SavedQuery.js';
import User from '../models/User.js';

// @desc    Get dashboard statistics
// @route   GET /api/stats/dashboard
// @access  Private
export const getDashboardStats = asyncHandler(async (req, res) => {
    const isAdmin = req.user.isAdmin;
    const userId = req.user._id;
    const role = req.user.role?.toLowerCase() || 'public';
    const isPowerUser = isAdmin; // Only Admin sees global platform stats

    let totalSearches, documentsDrafted, totalFiledDocs, totalAnalyzed, savedQueries, recentActivity, recentQueries;

    if (isPowerUser) {
        // GLOBAL STATS FOR ADMIN
        totalSearches = await SearchLog.countDocuments({});
        documentsDrafted = await FIR.countDocuments({ status: 'draft' });
        totalFiledDocs = await FIR.countDocuments({ status: { $ne: 'draft' } });
        totalAnalyzed = await SearchLog.countDocuments({ law: 'analysis' });
        savedQueries = await SavedQuery.countDocuments({});

        const platformRecentQueries = await SavedQuery.find({})
            .populate('user', 'name')
            .sort({ createdAt: -1 })
            .limit(10);

        recentQueries = platformRecentQueries;

        const totalUsers = await User.countDocuments({});

        const recentFIRs = await FIR.find({})
            .populate('createdBy', 'name')
            .sort({ updatedAt: -1 })
            .limit(10);

        recentActivity = recentFIRs.map(fir => ({
            type: 'FIR',
            action: fir.status === 'draft' ? 'User Updated Draft' : 'User Filed FIR',
            identifier: fir.firNumber || 'Draft',
            description: `${fir.incident?.natureOfOffence || 'New FIR'} - ${fir.createdBy?.name || 'Unknown User'}`,
            timestamp: fir.updatedAt
        }));

        res.json({
            totalSearches,
            documentsDrafted,
            totalFiledDocs,
            totalAnalyzed,
            savedQueries,
            totalUsers,
            recentActivity,
            recentQueries,
            global: true
        });
    } else {
        // INDIVIDUAL STATS FOR USERS
        const userId = req.user._id;
        totalSearches = await SearchLog.countDocuments({ user: userId });
        documentsDrafted = await FIR.countDocuments({ createdBy: userId, status: 'draft' });
        totalFiledDocs = await FIR.countDocuments({ createdBy: userId, status: { $ne: 'draft' } });
        totalAnalyzed = await SearchLog.countDocuments({ user: userId, law: 'analysis' });
        savedQueries = await SavedQuery.countDocuments({ user: userId });

        const recentFIRs = await FIR.find({ createdBy: userId })
            .sort({ updatedAt: -1 })
            .limit(5);

        recentActivity = recentFIRs.map(fir => ({
            type: 'FIR',
            action: fir.status === 'draft' ? 'Updated Draft' : 'Filed FIR',
            identifier: fir.firNumber || 'Draft',
            description: `${fir.incident?.natureOfOffence || 'New FIR'} - ${fir.complainant?.name || 'Unknown'}`,
            timestamp: fir.updatedAt
        }));

        res.json({
            totalSearches,
            documentsDrafted,
            totalFiledDocs,
            totalAnalyzed,
            savedQueries,
            recentActivity,
            global: false
        });
    }
});

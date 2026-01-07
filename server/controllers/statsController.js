import asyncHandler from 'express-async-handler';
import FIR from '../models/FIR.js';
import SearchLog from '../models/SearchLog.js';
import SavedQuery from '../models/SavedQuery.js';

// @desc    Get dashboard statistics
// @route   GET /api/stats/dashboard
// @access  Private
export const getDashboardStats = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // 1. Total Searches
    const totalSearches = await SearchLog.countDocuments({ user: userId });

    // 2. Documents Drafted (FIRs count as drafts)
    const documentsDrafted = await FIR.countDocuments({
        createdBy: userId,
        status: 'draft'
    });

    // 3. Filed FIRs (for recent activity or another stat)
    const totalFiledDocs = await FIR.countDocuments({
        createdBy: userId,
        status: { $ne: 'draft' }
    });

    const totalAnalyzed = await SearchLog.countDocuments({
        user: userId,
        law: 'analysis'
    });

    // 5. Saved Queries
    const savedQueries = await SavedQuery.countDocuments({ user: userId });

    // 5. Recent Activity (Latest 5 FIR updates)
    const recentFIRs = await FIR.find({ createdBy: userId })
        .sort({ updatedAt: -1 })
        .limit(5)
        .select('firNumber status updatedAt complainant incident');

    const recentActivity = recentFIRs.map(fir => ({
        type: 'FIR',
        action: fir.status === 'draft' ? 'Updated Draft' : 'Filed FIR',
        identifier: fir.firNumber || 'Draft',
        description: `${fir.incident?.natureOfOffence || 'New FIR'} - ${fir.complainant?.name || 'Unknown'}`,
        timestamp: fir.updatedAt
    }));

    // Chat sessions and Saved queries are placeholders for now or can be added if models exist
    // For now returning actual measured stats
    res.json({
        totalSearches,
        documentsDrafted,
        totalFiledDocs,
        totalAnalyzed,
        chatSessions: 0, // Placeholder
        savedQueries,
        recentActivity
    });
});

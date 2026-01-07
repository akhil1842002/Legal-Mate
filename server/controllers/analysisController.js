import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');
import asyncHandler from 'express-async-handler';
import searchService from '../services/searchService.js';
import SearchLog from '../models/SearchLog.js';

// @desc    Analyze legal document for mistakes and missing info
// @route   POST /api/analysis
// @access  Private
export const analyzeDocument = asyncHandler(async (req, res) => {
    let { text } = req.body;

    // Handle PDF file upload
    if (req.file) {
        try {
            const data = await pdf(req.file.buffer);
            text = data.text;
        } catch (pdfError) {
            console.error('PDF Parse Error:', pdfError);
            return res.status(400).json({ message: 'Failed to extract text from PDF' });
        }
    }

    if (!text || text.trim().length < 20) {
        return res.status(400).json({ message: 'Please provide more text or a valid PDF for analysis' });
    }

    // 1. Identify explicitly mentioned sections (Regex for "Section [0-9]+")
    const mentionedSections = text.match(/Section\s+\d+|u\/s\s+\d+/gi) || [];
    const citedNumbers = mentionedSections.map(s => s.match(/\d+/)[0]);

    // 2. Search for relevant legal sections based on the narrative
    // We search across all laws (BNS, IPC, etc.)
    const searchResults = await searchService.search('all', text, 5);

    const insights = [];
    let consistencyScore = 100;

    // 3. Compare cited sections vs suggested sections
    const suggestedSections = searchResults.map(r => r.section);

    // Check for cited sections not in top search results (Potential Mismatch)
    citedNumbers.forEach(cited => {
        const isHighlyRelevant = suggestedSections.some(s => s.toString().includes(cited));
        if (!isHighlyRelevant) {
            insights.push({
                type: 'warning',
                title: `Potential Mismatch: Section ${cited}`,
                description: `You cited Section ${cited}, but based on the narrative, other sections like ${suggestedSections.slice(0, 2).join(', ')} might be more relevant.`,
                impact: -15
            });
            consistencyScore -= 15;
        } else {
            insights.push({
                type: 'success',
                title: `Correct Citation: Section ${cited}`,
                description: `The narrative strongly supports the use of Section ${cited}.`,
                impact: 0
            });
        }
    });

    // 4. Check for missing information based on suggested sections
    searchResults.forEach(result => {
        const description = result.description?.toLowerCase() || '';
        const lowerText = text.toLowerCase();

        // Simple logic: if 'weapon' or 'violence' is in legal text but not in user text
        if (description.includes('weapon') && !lowerText.includes('weapon') && !lowerText.includes('gun') && !lowerText.includes('knife')) {
            insights.push({
                type: 'info',
                title: `Clarification Needed: ${result.law} Section ${result.section}`,
                description: `This section mentions use of weapons. If a weapon was involved, please specify the type in your narrative for stronger alignment.`,
                impact: -5
            });
        }
    });

    // 5. If no sections were cited, suggest some
    if (citedNumbers.length === 0) {
        insights.push({
            type: 'suggestion',
            title: 'No Sections Cited',
            description: `Based on your description, you might want to consider sections: ${suggestedSections.join(', ')}.`,
            impact: -10
        });
        consistencyScore -= 10;
    }

    // 6. Generate Case Summary
    let caseSummary = "Unable to generate summary.";
    if (searchResults.length > 0) {
        const topMatch = searchResults[0];
        const offenseTitle = topMatch.title || topMatch.description?.split('.')[0] || 'Unspecified Legal Procedure';

        caseSummary = `This document primarily concerns **${topMatch.law} Section ${topMatch.section}**, which pertains to **${offenseTitle}**. `;

        // Add more theme-specific context
        if (topMatch.description) {
            const keyTheme = topMatch.description.length > 150 ? topMatch.description.substring(0, 150) + '...' : topMatch.description;
            caseSummary += `\n\n**Main Theme:** The narrative describes a scenario involving ${keyTheme.toLowerCase()} `;
        }

        caseSummary += `\n\n**Legal Alignment:** `;
        if (consistencyScore > 75) {
            caseSummary += "The description provided shows a strong correlation with the legal elements required under this section. The citations (if any) are used correctly in the context of the reported incident.";
        } else if (consistencyScore > 40) {
            caseSummary += "The narrative has some alignment with this section, but certain key legal requirements might be missing or loosely described. Recommendation: Compare the specific actions in your text with the exact wording of the law.";
        } else {
            caseSummary += "There is a significant mismatch between the described events and the cited/suggested legal sections. This could lead to procedural errors or rejection during formal filing.";
        }
    }

    // Ensure score doesn't go below 0
    consistencyScore = Math.max(0, consistencyScore);

    // Log the analysis activity
    try {
        await SearchLog.create({
            query: `Analysis: ${text.substring(0, 50)}...`,
            law: 'analysis',
            user: req.user._id
        });
    } catch (logError) {
        console.error('Failed to log analysis:', logError);
    }

    res.json({
        text,
        score: consistencyScore,
        summary: caseSummary,
        insights,
        suggestedSections: searchResults
    });
});

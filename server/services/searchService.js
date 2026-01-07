import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import EmbeddingService from './embeddingService.js';
import similarity from 'compute-cosine-similarity';
import { mongoose } from 'mongoose';
import Section from '../models/Section.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../data');

class SearchService {
    constructor() {
        this.cache = {}; // { lawName: { embeddings: [], sectionIds: [] } }
    }

    async loadLaw(lawName) {
        if (this.cache[lawName]) return this.cache[lawName];

        const lawDir = path.join(DATA_DIR, lawName);
        const embPath = path.join(lawDir, 'embeddings.json');

        console.log(`Checking law: ${lawName}`);
        console.log(`Search path: ${embPath}`);

        if (!fs.existsSync(embPath)) {
            console.error(`Embeddings not found at: ${embPath}`);
            return null;
        }

        console.log(`Loading embeddings for ${lawName}...`);
        // Load embeddings from disk
        const embeddings = JSON.parse(fs.readFileSync(embPath, 'utf-8'));

        // Load section IDs from DB, sorted by order to match embeddings
        const sections = await Section.find({ law: lawName })
            .sort({ order: 1 })
            .select('_id title section description'); // We pull text now to return, OR pull just IDs if we want lazy load

        // Assuming the DB and FS are in sync (ensured by generation script)
        this.cache[lawName] = { sections, embeddings };
        console.log(`Loaded ${lawName} into memory.`);
        return this.cache[lawName];
    }

    async search(lawName, query, topK = 5) {
        if (lawName === 'all') {
            const allLaws = ['ipc', 'crpc', 'mv_act', 'iea', 'cpc', 'hma', 'ida', 'nia'];
            let allResults = [];

            for (const law of allLaws) {
                const results = await this.search(law, query, topK);
                if (results) {
                    allResults = [...allResults, ...results.map(r => ({ ...r, law }))];
                }
            }

            // Sort by score and take top K
            return allResults.sort((a, b) => b.score - a.score).slice(0, topK);
        }

        const lawData = await this.loadLaw(lawName);
        if (!lawData) return null;

        const { sections, embeddings } = lawData;
        const queryEmbedding = await EmbeddingService.getEmbedding(query);

        const scores = embeddings.map((emb, idx) => ({
            index: idx,
            score: similarity(queryEmbedding, emb)
        }));

        scores.sort((a, b) => b.score - a.score);
        const topIndices = scores.slice(0, topK);

        const results = topIndices.map(item => {
            if (item.index < sections.length) {
                const section = sections[item.index];
                return {
                    law: lawName,
                    section: section.section,
                    title: section.title,
                    description: section.description,
                    score: item.score
                };
            }
            return null;
        }).filter(r => r !== null);

        return results;
    }
}

export default new SearchService();

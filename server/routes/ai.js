import express from 'express';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Rules and keyword dictionaries for AI smart triage
const CATEGORY_KEYWORDS = {
  'Electrical': ['spark', 'shock', 'wire', 'cable', 'breaker', 'fuse', 'light', 'flicker', 'outlet', 'socket', 'switch', 'power', 'blackout', 'generator', 'bulb'],
  'Plumbing': ['leak', 'pipe', 'clog', 'sink', 'toilet', 'flush', 'drain', 'overflow', 'faucet', 'sewage', 'drip', 'restroom', 'bathroom'],
  'Water Supply': ['water filter', 'drinking water', 'tap dry', 'no water', 'water cooler', 'water pressure', 'muddy water'],
  'Internet/Wi-Fi': ['wifi', 'wi-fi', 'router', 'network', 'ethernet', 'disconnect', 'slow internet', 'ip address', 'lan', 'connection', 'signal', 'access point'],
  'Classroom Equipment': ['projector', 'smartboard', 'mic', 'microphone', 'speaker', 'podium', 'hdmi', 'screen', 'audio', 'visual', 'av', 'camera', 'display'],
  'Furniture': ['chair', 'desk', 'bench', 'table', 'whiteboard', 'door handle', 'hinge', 'cabinet', 'lock', 'window latch', 'blind', 'podium broken'],
  'Cleaning': ['trash', 'garbage', 'dirty', 'dust', 'spill', 'stain', 'mess', 'smell', 'odor', 'pest', 'cockroach', 'insects', 'litter'],
  'Safety': ['fire', 'extinguisher', 'smoke', 'exit door', 'hazard', 'slippery', 'glass broken', 'stairs', 'railing', 'emergency', 'gas leak', 'danger']
};

const URGENCY_TRIGGERS = {
  Urgent: ['fire', 'gas leak', 'sparking', 'electric shock', 'flooding', 'smoke', 'collapse', 'open wire', 'danger', 'emergency', 'hazard'],
  High: ['no power', 'broken glass', 'blackout', 'toilet overflow', 'projector dead', 'exam hall', 'lab offline', 'water shutdown', 'slippery stairs'],
  Medium: ['flickering', 'clogged drain', 'wifi weak', 'slow connection', 'air conditioning', 'faucet drip', 'broken chair', 'door creak'],
  Low: ['paint chip', 'scratched desk', 'bulletin board', 'cosmetic', 'minor stain', 'sign missing']
};

// POST /api/ai/triage - AI Smart Category & Urgency Suggestion
router.post('/triage', verifyToken, (req, res) => {
  try {
    const { title = '', description = '' } = req.body;
    const combinedText = `${title} ${description}`.toLowerCase();

    // 1. Category Detection
    let bestCategory = 'Other';
    let maxCategoryMatches = 0;
    const matchedCategoryTags = [];

    for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      let matches = 0;
      for (const kw of keywords) {
        if (combinedText.includes(kw)) {
          matches++;
          if (!matchedCategoryTags.includes(`#${cat.replace(/[^a-zA-Z]/g, '')}`)) {
            matchedCategoryTags.push(`#${cat.replace(/[^a-zA-Z]/g, '')}`);
          }
        }
      }
      if (matches > maxCategoryMatches) {
        maxCategoryMatches = matches;
        bestCategory = cat;
      }
    }

    // 2. Priority Recommendation
    let bestPriority = 'Medium';
    let matchedUrgentReason = '';

    for (const kw of URGENCY_TRIGGERS.Urgent) {
      if (combinedText.includes(kw)) {
        bestPriority = 'Urgent';
        matchedUrgentReason = `Triggered urgent alert keyword: "${kw}"`;
        break;
      }
    }

    if (bestPriority !== 'Urgent') {
      for (const kw of URGENCY_TRIGGERS.High) {
        if (combinedText.includes(kw)) {
          bestPriority = 'High';
          matchedUrgentReason = `High impact detected on campus operations: "${kw}"`;
          break;
        }
      }
    }

    if (bestPriority === 'Medium') {
      for (const kw of URGENCY_TRIGGERS.Low) {
        if (combinedText.includes(kw)) {
          bestPriority = 'Low';
          break;
        }
      }
    }

    // 3. Confidence Score calculation
    const confidence = Math.min(98, Math.max(68, 65 + maxCategoryMatches * 10 + (bestPriority === 'Urgent' ? 15 : 5)));

    // 4. Estimated repair hours
    const etaHoursMap = {
      'Urgent': 2,
      'High': 6,
      'Medium': 24,
      'Low': 48
    };

    const suggestedDepartment = {
      'Electrical': 'Electrical Maintenance Division',
      'Plumbing': 'Plumbing & Hydraulic Systems',
      'Water Supply': 'Plumbing & Hydraulic Systems',
      'Internet/Wi-Fi': 'Campus IT & Network Infrastructure',
      'Classroom Equipment': 'Audio-Visual & Smart Classroom Support',
      'Furniture': 'Carpentry & Estate Maintenance',
      'Cleaning': 'Housekeeping & Sanitation',
      'Safety': 'Campus Security & Environmental Safety',
      'Other': 'General Facility Operations'
    }[bestCategory] || 'General Maintenance';

    res.json({
      suggestedCategory: bestCategory,
      suggestedPriority: bestPriority,
      confidenceScore: confidence,
      estimatedResolutionHours: etaHoursMap[bestPriority],
      suggestedDepartment,
      reasoning: matchedUrgentReason || `Pattern matched ${maxCategoryMatches} campus facility indicators.`,
      tags: matchedCategoryTags.slice(0, 4)
    });
  } catch (err) {
    console.error('AI Triage error:', err);
    res.status(500).json({ error: 'AI Triage processing failed.' });
  }
});

export default router;

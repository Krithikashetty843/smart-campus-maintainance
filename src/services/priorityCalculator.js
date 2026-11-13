/**
 * Smart Priority Calculation Engine for Campus Maintenance
 * Evaluates category severity, location criticality, user role, and textual urgency keywords.
 */

export function calculatePriority({ category, room = '', description = '', title = '', role = 'Student' }) {
  const combinedText = `${title} ${description} ${room}`.toLowerCase();

  // Critical hazard keywords
  const criticalKeywords = [
    'fire', 'spark', 'smoke', 'short circuit', 'shock', 'flood', 'burst',
    'chemical leak', 'gas leak', 'burning', 'emergency', 'explosion', 'danger'
  ];

  // High priority keywords
  const highKeywords = [
    'leak', 'water leaking', 'no power', 'exam', 'blackout', 'jammed exit',
    'server down', 'outage', 'broken glass', 'severe', 'urgent', 'blocked'
  ];

  // Check critical text triggers first
  for (const kw of criticalKeywords) {
    if (combinedText.includes(kw)) {
      return 'Critical';
    }
  }

  // Check high priority text triggers
  for (const kw of highKeywords) {
    if (combinedText.includes(kw)) {
      return 'High';
    }
  }

  // Base score from category
  let score = 2; // Default Medium

  switch (category) {
    case 'Electrical':
    case 'Plumbing':
      score = 3; // Baseline High
      break;
    case 'Laboratory Equipment':
    case 'Classroom Maintenance':
    case 'Internet and Network':
      score = 2; // Baseline Medium
      break;
    case 'Furniture':
    case 'Cleaning':
    case 'Other':
      score = 1; // Baseline Low
      break;
    default:
      score = 2;
  }

  // Location sensitivity bonuses
  const highImpactLocations = ['server', 'examination', 'dean', 'hod', 'ai lab', 'vlsi', 'workshop', 'auditorium'];
  if (highImpactLocations.some(loc => combinedText.includes(loc))) {
    score += 1;
  }

  // Faculty endorsement/reporting slight bump
  if (role === 'Faculty') {
    score += 0.5;
  }

  if (score >= 3.5) return 'Critical';
  if (score >= 2.5) return 'High';
  if (score >= 1.5) return 'Medium';
  return 'Low';
}

import React from 'react';
import {
  Zap,
  Droplets,
  Armchair,
  Sparkles,
  FlaskConical,
  GraduationCap,
  Wifi,
  HelpCircle,
} from 'lucide-react';

export default function CategoryIcon({ category, className = 'w-4 h-4' }) {
  switch (category) {
    case 'Electrical':
      return <Zap className={`${className} text-amber-500`} />;
    case 'Plumbing':
      return <Droplets className={`${className} text-blue-500`} />;
    case 'Furniture':
      return <Armchair className={`${className} text-amber-700`} />;
    case 'Cleaning':
      return <Sparkles className={`${className} text-emerald-500`} />;
    case 'Laboratory Equipment':
      return <FlaskConical className={`${className} text-purple-500`} />;
    case 'Classroom Maintenance':
      return <GraduationCap className={`${className} text-indigo-500`} />;
    case 'Internet and Network':
      return <Wifi className={`${className} text-cyan-500`} />;
    case 'Other':
    default:
      return <HelpCircle className={`${className} text-slate-500`} />;
  }
}

import React from 'react';
import { getCreditScoreTier, getHealthScoreTier } from '../../utils/formatters.js';

interface ScoreMeterProps {
  score: number;
  type?: 'credit' | 'health';
  previousScore?: number;
  showDetails?: boolean;
}

export const ScoreMeter: React.FC<ScoreMeterProps> = ({
  score,
  type = 'credit',
  previousScore,
  showDetails = true,
}) => {
  const isCredit = type === 'credit';
  const min = isCredit ? 300 : 0;
  const max = isCredit ? 900 : 100;
  const clampedScore = Math.max(min, Math.min(max, score));
  const percentage = ((clampedScore - min) / (max - min)) * 100;

  const tier = isCredit ? getCreditScoreTier(clampedScore) : getHealthScoreTier(clampedScore);
  const scoreDiff = previousScore !== undefined ? clampedScore - previousScore : 0;

  // Semi-circle SVG calculation
  const radius = 80;
  const circumference = Math.PI * radius; // Half circle
  const strokeDashoffset = circumference - (circumference * percentage) / 100;

  return (
    <div id={`score-meter-${type}`} className="flex flex-col items-center">
      <div className="relative w-56 h-32 flex items-end justify-center overflow-hidden">
        <svg className="w-52 h-52 -mb-20 transform -rotate-90">
          {/* Background Track */}
          <circle
            cx="104"
            cy="104"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="14"
            strokeDasharray={circumference}
            strokeDashoffset="0"
            className="text-slate-100 dark:text-slate-800"
            strokeLinecap="round"
          />
          {/* Active Progress Arc */}
          <circle
            cx="104"
            cy="104"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="14"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={`transition-all duration-1000 ease-out ${
              tier.label === 'Excellent'
                ? 'text-emerald-500'
                : tier.label === 'Good' || tier.label === 'Healthy'
                ? 'text-teal-500'
                : tier.label === 'Fair' || tier.label === 'Moderate'
                ? 'text-amber-500'
                : 'text-rose-500'
            }`}
            strokeLinecap="round"
          />
        </svg>

        {/* Center Text */}
        <div className="absolute bottom-2 flex flex-col items-center">
          <span className="text-4xl font-extrabold tracking-tight font-display text-slate-900 dark:text-white">
            {score}
            {!isCredit && <span className="text-xl font-normal text-slate-400">/100</span>}
          </span>
          <span className={`text-xs font-semibold px-2.5 py-0.5 mt-1 rounded-full border ${tier.badgeBg} ${tier.badgeText || tier.color}`}>
            {tier.label}
          </span>
        </div>
      </div>

      {showDetails && (
        <div className="w-full mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-2">
          <span>{min} {isCredit ? 'Min' : ''}</span>
          {scoreDiff !== 0 && (
            <span className={`font-medium ${scoreDiff > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {scoreDiff > 0 ? `+${scoreDiff}` : scoreDiff} pts vs last cycle
            </span>
          )}
          <span>{max} {isCredit ? 'Max' : ''}</span>
        </div>
      )}
    </div>
  );
};

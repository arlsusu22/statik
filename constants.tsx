
import React from 'react';

export const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="17 8 12 3 7 8"></polyline>
    <line x1="12" y1="3" x2="12" y2="15"></line>
  </svg>
);

export const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
  </svg>
);

export const CameraIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
    <circle cx="12" cy="13" r="3"></circle>
  </svg>
);

export const StravaIcon = () => (
  <svg role="img" viewBox="0 0 24 24" fill="currentColor" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <title>Strava</title>
    <path d="M15.387 17.944l-2.089-4.116h-3.065l5.154 10.172 5.154-10.172h-3.066l-2.088 4.116zm-5.163-4.115l-6.81-13.529h4.679l2.13 4.217 2.131-4.217h4.678l-6.809 13.529h1e-3z"/>
  </svg>
);

export const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path>
    <path d="M21 3v5h-5"></path>
  </svg>
);

// Official Strava "Connect with Strava" button component
// Per Strava Brand Guidelines: https://developers.strava.com/guidelines/
// Uses official Strava button asset
export const ConnectWithStravaButton: React.FC<{ onClick: () => void; className?: string }> = ({ onClick, className = '' }) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center justify-center transition-all duration-200 hover:opacity-90 active:scale-[0.98] ${className}`}
  >
    <img 
      src="/assets/btn_strava_connect_with_orange.png" 
      alt="Connect with Strava"
      style={{ height: '48px', width: 'auto' }}
    />
  </button>
);

// "Powered by Strava" attribution component
// Required per Strava Brand Guidelines when displaying Strava data
export const PoweredByStrava: React.FC<{ variant?: 'light' | 'dark'; className?: string }> = ({ variant = 'light', className = '' }) => (
  <div className={`inline-flex items-center gap-1.5 ${className}`}>
    <span className={`text-xs ${variant === 'light' ? 'text-zinc-400' : 'text-zinc-600'}`}>
      Powered by
    </span>
    <svg 
      viewBox="0 0 24 24" 
      fill={variant === 'light' ? '#FC4C02' : '#FC4C02'} 
      width="14" 
      height="14"
    >
      <path d="M15.387 17.944l-2.089-4.116h-3.065l5.154 10.172 5.154-10.172h-3.066l-2.088 4.116zm-5.163-4.115l-6.81-13.529h4.679l2.13 4.217 2.131-4.217h4.678l-6.809 13.529h1e-3z"/>
    </svg>
    <span className={`text-xs font-semibold ${variant === 'light' ? 'text-white' : 'text-zinc-800'}`}>
      Strava
    </span>
  </div>
);

// "View on Strava" link component
// Per Strava Brand Guidelines: text should be bold, underlined, or orange (#FC5200)
export const ViewOnStravaLink: React.FC<{ activityId: string; className?: string }> = ({ activityId, className = '' }) => (
  <a
    href={`https://www.strava.com/activities/${activityId}`}
    target="_blank"
    rel="noopener noreferrer"
    className={`inline-flex items-center gap-1 text-[#FC4C02] hover:text-[#FF6B35] font-medium text-sm transition-colors ${className}`}
  >
    <span className="underline underline-offset-2">View on Strava</span>
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  </a>
);

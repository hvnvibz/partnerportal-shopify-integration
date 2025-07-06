import React from 'react';

interface VideoCardProps {
  videoId: string;
  title: string;
  kategorie?: string;
  dauer?: string;
  videoUrl?: string;
}

export const VideoCard: React.FC<VideoCardProps> = ({ videoId, title, kategorie, dauer, videoUrl }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col h-full border border-gray-100">
      <div className="relative">
        <img
          src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
          alt={title}
          className="w-full aspect-video object-cover"
        />
        <a
          href={videoUrl || `https://youtu.be/${videoId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 flex items-center justify-center group"
        >
          <span className="bg-white/80 rounded-full p-3 shadow-lg group-hover:scale-110 transition-transform">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="16" fill="#1e3a8a" />
              <polygon points="13,10 24,16 13,22" fill="white" />
            </svg>
          </span>
        </a>
      </div>
      <div className="flex-1 flex flex-col p-4">
        <div className="flex gap-2 mb-2">
          {kategorie && (
            <span className="bg-blue-900 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
              {kategorie}
            </span>
          )}
          {dauer && (
            <span className="bg-blue-900 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
              {dauer} Minuten
            </span>
          )}
        </div>
        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem]">{title}</h3>
        <div className="mt-auto">
          <a
            href={videoUrl || `https://youtu.be/${videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-900 font-semibold hover:underline text-base"
          >
            Jetzt ansehen
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path stroke="#1e3a8a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7l7 7-7 7"/></svg>
          </a>
        </div>
      </div>
    </div>
  );
}; 
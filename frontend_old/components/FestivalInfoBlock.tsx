import { useState } from 'react';
import { Alert } from 'react-bootstrap';

interface FestivalInfoBlockProps {
  imageUrl?: string;
  title: Record<string, string>;
  content: Record<string, string>;
  videoId?: Record<string, string>;
  currentLanguage: string;
  error?: string | null;
}

/**
 * Festival info block component displaying images and localized content
 * Renders content with fallback to English if translation unavailable
 */
export default function FestivalInfoBlock({
  imageUrl,
  title,
  content,
  videoId,
  currentLanguage,
  error,
}: FestivalInfoBlockProps) {
  const [hasVideoError, setHasVideoError] = useState(false);

  if (error) {
    return (
      <Alert variant="warning" className="mt-4">
        <Alert.Heading as="h6" className="mb-2">
          Unable to load additional information
        </Alert.Heading>
        <small className="text-muted">{error}</small>
      </Alert>
    );
  }

  const displayTitle = title[currentLanguage as keyof typeof title] || title.en;
  const displayContent = content[currentLanguage as keyof typeof content] || content.en;
  const displayVideoId = videoId?.[currentLanguage as keyof typeof videoId] || videoId?.en;

  return (
    <div className="mt-4">
      {imageUrl && (
        <img
          src={imageUrl}
          alt={displayTitle || 'Festival information'}
          className="img-fluid mb-3"
          style={{ maxHeight: '300px', objectFit: 'cover' }}
          onError={e => {
            // Remove image if loading fails
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      )}

      {displayVideoId && !hasVideoError && (
        <div className="ratio ratio-16x9 mb-4">
          <iframe
            src={`https://www.youtube.com/embed/${displayVideoId}`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            onError={() => setHasVideoError(true)}
          ></iframe>
        </div>
      )}

      {displayContent && (
        <div
          dangerouslySetInnerHTML={{
            __html: displayContent,
          }}
        />
      )}
    </div>
  );
}

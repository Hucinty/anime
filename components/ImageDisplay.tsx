import React, { useState } from 'react';

interface ImageDisplayProps {
  title: string;
  imageUrl: string | null;
  isLoading?: boolean;
  isDownloadable?: boolean;
  comparisonImageUrl?: string | null;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({ title, imageUrl, isLoading = false, isDownloadable = false, comparisonImageUrl = null }) => {
  const [sliderValue, setSliderValue] = useState(50);
  
  const handleDownload = () => {
    if (imageUrl) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `stylized-image-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const imageContainerContent = () => {
    if (isLoading) {
      return (
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
          <p className="loading-indicator">Generating...</p>
        </div>
      );
    }
    
    if (comparisonImageUrl && imageUrl) {
      return (
        <div className="relative w-full h-full group fade-in" key={imageUrl}>
          <img
            src={comparisonImageUrl}
            alt="Original for comparison"
            className="absolute inset-0 w-full h-full object-contain"
          />
          <div
            className="absolute inset-0 w-full h-full"
            style={{ clipPath: `polygon(0 0, ${sliderValue}% 0, ${sliderValue}% 100%, 0 100%)` }}
          >
            <img
              src={imageUrl}
              alt={title}
              className="absolute inset-0 w-full h-full object-contain"
            />
          </div>
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-black/70 cursor-ew-resize"
            style={{ left: `calc(${sliderValue}% - 1px)`, backgroundColor: 'rgba(0,0,0,0.7)' }}
          >
            <div className="bg-white rounded-full h-3 w-3 absolute top-1/2 -translate-y-1/2 -translate-x-[5px] border border-black"
                 style={{ backgroundColor: 'var(--bg-color)', borderColor: 'var(--text-color)' }}
            ></div>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={sliderValue}
            onChange={(e) => setSliderValue(Number(e.target.value))}
            className="absolute inset-0 w-full h-full cursor-ew-resize opacity-0"
            aria-label="Image comparison slider"
          />
        </div>
      );
    }

    if (imageUrl) {
      return <img src={imageUrl} alt={title} className="object-contain max-h-full max-w-full fade-in" key={imageUrl} />;
    }

    return (
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#888'}}>
        <p>Output will appear here</p>
      </div>
    );
  };

  return (
    <div style={{display: 'flex', flexDirection: 'column', width: '100%', height: '100%'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)'}}>
        <h3 style={{fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em'}}>{title}</h3>
        {isDownloadable && imageUrl && !isLoading && (
          <button
            onClick={handleDownload}
            className="btn-mono"
            style={{padding: '0.25rem 0.75rem', fontSize: '0.75rem', width: 'auto'}}
          >
            Download
          </button>
        )}
      </div>
      <div style={{aspectRatio: '1 / 1', width: '100%', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem' }}>
        {imageContainerContent()}
      </div>
    </div>
  );
};

export default ImageDisplay;
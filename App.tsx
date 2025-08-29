import React, { useState, useCallback, useEffect } from 'react';
import { STYLE_OPTIONS } from './constants';
import type { StyleOption } from './types';
import { generateImage } from './services/geminiService';
import ImageDisplay from './components/ImageDisplay';

const ASPECT_RATIOS = ["1:1", "16:9", "9:16", "4:3", "3:4"];

const App: React.FC = () => {
  const [originalImageFile, setOriginalImageFile] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<StyleOption>(STYLE_OPTIONS[0]);
  const [aspectRatio, setAspectRatio] = useState<string>(ASPECT_RATIOS[0]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setOriginalImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      setGeneratedImageUrl(null);
      setError(null);
    }
  };

  useEffect(() => {
    // Reset aspect ratio if Doodle is selected, as it doesn't support it.
    if (selectedStyle.id === 'doodle') {
      setAspectRatio('1:1');
    }
    
    // Dynamic Theming
    document.body.className = ''; // Clear previous themes
    if (selectedStyle.theme) {
      document.body.classList.add(`theme-${selectedStyle.theme}`);
    }

  }, [selectedStyle]);

  const handleGenerateClick = useCallback(async () => {
    if (!originalImageFile) {
      setError("Please upload an image first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImageUrl(null);

    try {
      const generatedImageBase64 = await generateImage(originalImageFile, selectedStyle.name, aspectRatio);
      setGeneratedImageUrl(`data:image/jpeg;base64,${generatedImageBase64}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during image generation.");
    } finally {
      setIsLoading(false);
    }
  }, [originalImageFile, selectedStyle, aspectRatio]);

  return (
    <div className="min-h-screen">
      <header className="py-3 px-4 border-b border-gray-300 w-full" style={{ borderColor: 'var(--border-color)'}}>
        <h1 className="text-lg font-bold tracking-wider">
          [*] AI STYLE CONVERTER
        </h1>
      </header>

      <main className="main-grid">
        {/* Controls Panel */}
        <aside className="controls-panel">
          <fieldset>
            <legend className="fieldset-legend">— UPLOAD IMAGE —</legend>
            <label
              htmlFor="image-upload"
              className="upload-label"
            >
              <span>{originalImageFile ? originalImageFile.name : 'Select an Image...'}</span>
            </label>
            <input
              id="image-upload"
              type="file"
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
              onChange={handleImageUpload}
            />
          </fieldset>

          <fieldset>
            <legend className="fieldset-legend">— EFFECTS —</legend>
            <div className="style-list">
              {STYLE_OPTIONS.map((style) => {
                  const isSelected = selectedStyle.id === style.id;
                  const IconComponent = style.icon;
                  return (
                    <button
                        key={style.id}
                        onClick={() => setSelectedStyle(style)}
                        className={`style-btn ${isSelected ? 'selected' : ''}`}
                        aria-pressed={isSelected}
                    >
                        <span className="style-marker">{isSelected ? '[*]' : '[ ]'}</span>
                        <IconComponent className="style-icon" aria-hidden="true" />
                        <span>{style.name.toUpperCase()}</span>
                    </button>
                  );
              })}
            </div>
          </fieldset>
          
          <fieldset>
            <legend className="fieldset-legend">— ASPECT RATIO —</legend>
            <div className="aspect-ratio-list">
                {ASPECT_RATIOS.map((ratio) => {
                    const isSelected = aspectRatio === ratio;
                    const isDisabled = selectedStyle.id === 'doodle';
                    return (
                        <button
                            key={ratio}
                            onClick={() => setAspectRatio(ratio)}
                            disabled={isDisabled}
                            className={`aspect-btn ${isSelected ? 'selected' : ''}`}
                        >
                            {ratio}
                        </button>
                    )
                })}
            </div>
            {selectedStyle.id === 'doodle' && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                    Not available for Doodle style.
                </p>
            )}
          </fieldset>

          <div className="mt-auto pt-6">
            <button
              onClick={handleGenerateClick}
              disabled={isLoading || !originalImageFile}
              className="btn-mono"
            >
              {isLoading ? 'Generating...' : 'Export Canvas'}
            </button>
            {error && <p className="error-message">{error}</p>}
          </div>

        </aside>

        {/* Image Display Area */}
        <section className="display-area">
          <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
            <ImageDisplay title="Original" imageUrl={originalImageUrl} />
            <ImageDisplay 
              title="Stylized" 
              imageUrl={generatedImageUrl} 
              comparisonImageUrl={originalImageUrl}
              isLoading={isLoading} 
              isDownloadable={true} 
            />
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;
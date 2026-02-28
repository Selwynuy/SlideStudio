interface InputTabProps {
  generateSlides: (isBatch: boolean) => Promise<void>;
  isLoading: boolean;
  settings: {
    rawText: string;
    tone: string;
    complexity: string;
    maxSlides: number;
    focus: string;
    hook: boolean;
  };
  setRawText: (value: string) => void;
  setTone: (value: string) => void;
  setComplexity: (value: string) => void;
  setMaxSlides: (value: number) => void;
  setFocus: (value: string) => void;
  setHook: (value: boolean) => void;
  sourceText: string;
  batchOffset: number;
}

export default function InputTab({
  generateSlides,
  isLoading,
  settings,
  setRawText,
  setTone,
  setComplexity,
  setMaxSlides,
  setFocus,
  setHook,
  sourceText,
  batchOffset,
}: InputTabProps) {
  const handleGenerate = (isBatch: boolean) => {
    generateSlides(isBatch);
  };

  return (
    <div className="tab-pane active" id="tab-input">
      <div className="ctrl-section">
        <div className="ctrl-label">
          Raw Content <span></span>
        </div>
        <textarea
          className="ctrl-textarea"
          placeholder="Paste blog post, HTB writeup, script, notes, transcript…

AI will intelligently split it into clean term-and-definition slides."
          rows={7}
          value={settings.rawText}
          onChange={(e) => setRawText(e.target.value)}
        ></textarea>
        <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
          {sourceText && (
            <div className="batch-info" style={{display: 'flex'}}>
              <span>
                Batch <strong>{Math.ceil(batchOffset / 4000)}</strong> ·{" "}
                <strong>
                  {Math.round((batchOffset / sourceText.length) * 100)}%
                </strong>{" "}
                processed
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="ctrl-section">
        <div className="ctrl-label">
          Generation Settings <span></span>
        </div>
        <div className="ctrl-grid">
          <div className="ctrl-item">
            <label>Tone</label>
            <select
              className="ctrl-select"
              value={settings.tone}
              onChange={(e) => setTone(e.target.value)}
            >
              <option value="educational">Educational</option>
              <option value="conversational">Conversational</option>
              <option value="motivational">Motivational</option>
              <option value="analytical">Analytical</option>
              <option value="casual">Casual</option>
            </select>
          </div>
          <div className="ctrl-item">
            <label>Complexity</label>
            <select
              className="ctrl-select"
              value={settings.complexity}
              onChange={(e) => setComplexity(e.target.value)}
            >
              <option value="simple">Simple</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div className="ctrl-item">
            <label>Slides per Batch</label>
            <input
              type="number"
              className="ctrl-select"
              min="1"
              max="20"
              value={settings.maxSlides}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (value >= 1 && value <= 20) {
                  setMaxSlides(value);
                }
              }}
            />
          </div>
          <div className="ctrl-item">
            <label>Focus</label>
            <select
              className="ctrl-select"
              value={settings.focus}
              onChange={(e) => setFocus(e.target.value)}
            >
              <option value="key_points">Key Points</option>
              <option value="tips">Tips & Advice</option>
              <option value="facts">Facts & Stats</option>
              <option value="steps">Steps / How-To</option>
              <option value="terms">Terms & Defs</option>
            </select>
          </div>
        </div>
      </div>
      <div className="ctrl-section">
        <div className="toggle-row">
          <div>
            <div className="toggle-label">Hook Slide</div>
            <div className="toggle-sub">
              Auto-generate attention-grabbing opener
            </div>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={settings.hook}
              onChange={(e) => setHook(e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>
      <div
        style={{
          padding: "12px 14px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        {isLoading && (
          <div className="ai-loading show" id="aiLoading">
            <div className="dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span id="loadingText">Generating slides…</span>
          </div>
        )}
        <button
          className="btn btn-cyan"
          onClick={() => handleGenerate(false)}
          disabled={isLoading}
          style={{
            justifyContent: "center",
            width: "100%",
            padding: "11px",
          }}
        >
          {isLoading ? "Generating..." : "✦ Generate Slides"}
        </button>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => handleGenerate(true)}
          disabled={isLoading || !sourceText}
          style={{ justifyContent: "center" }}
        >
          + Generate More from Same Content
        </button>
      </div>
    </div>
  );
}

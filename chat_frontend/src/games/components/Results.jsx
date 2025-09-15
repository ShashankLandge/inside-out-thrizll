import React from "react";
import Stat from "./Stat";

function normalize(v, min, max) {
  if (max === min) return 0.5;
  return Math.max(0, Math.min(1, (v - min) / (max - min)));
}

export default function Results({ data, onReset, onFinish }) {
  const computeProfile = (d) => {
    const avgCashed = d.balloon?.avgCashedPumps ?? 0;
    const popped = d.balloon?.poppedCount ?? 0;
    const arrowAcc = d.arrow?.accuracy ?? 0;
    const arrowRT = d.arrow?.meanRT ?? 1000;
    const facesAcc = d.faces?.accuracy ?? 0;
    const facesRT = d.faces?.meanRT ?? 1000;
    const humor = d.meme?.counts ?? {};

    const riskScore = normalize(avgCashed, 0, 12);
    const impulsivity = normalize(popped, 0, 6);
    const attention = arrowAcc;
    const speed = 1 - normalize(arrowRT, 200, 1000);
    const empathy = facesAcc;

    const personality = {
      riskTolerance: Math.round(riskScore * 100),
      impulsivity: Math.round(impulsivity * 100),
      attention: Math.round(attention * 100),
      speed: Math.round(speed * 100),
      empathy: Math.round(empathy * 100),
      humor: humor,
    };

    const compatibility = {
      intellectual: Math.round((personality.attention + personality.speed) / 2),
      emotional: Math.round(personality.empathy),
      adventurous: Math.round(
        Math.max(0, personality.riskTolerance - personality.impulsivity)
      ),
    };

    return { personality, compatibility };
  };

  const profile = computeProfile(data);

  const download = () => {
    const blob = new Blob([JSON.stringify({ raw: data, profile }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "matchplay_results.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFinish = () => {
    // store results in window var in case GamesPage wants to use it
    if (typeof window !== "undefined") {
      window.__GAMES_PROFILE__ = profile;
      window.__GAMES_RAW__ = data;
    }
    // call onFinish if parent injected it (GamesPage will do the save + redirect)
    if (typeof onFinish === "function") onFinish();
    else {
      // fallback behavior: store locally and show a link to the main app
      try {
        localStorage.setItem(
          "games:results:guest",
          JSON.stringify({ raw: data, profile })
        );
        alert("Results saved locally. Please go to the main app.");
      } catch (e) {
        console.warn(e);
      }
    }
  };

  return (
    <div className="py-8 animate-slide-in-left">
      <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-love">
        Your Match Profile
      </h2>
      <p className="mt-3 text-dark/80 max-w-2xl mx-auto">
        Based on your gameplay, we've created a personality profile that helps
        find compatible matches.
      </p>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="game-card">
          <h3 className="text-xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent mb-6">
            Personality Traits
          </h3>
          <div className="space-y-6">
            <Stat
              label="Risk Tolerance"
              value={profile.personality.riskTolerance}
              description="How comfortable you are with uncertainty and potential loss"
            />
            <Stat
              label="Impulsivity"
              value={profile.personality.impulsivity}
              description="How quickly you act without extensive deliberation"
            />
            <Stat
              label="Attention to Detail"
              value={profile.personality.attention}
              description="How precisely you notice and respond to specific cues"
            />
            <Stat
              label="Processing Speed"
              value={profile.personality.speed}
              description="How quickly you process and react to information"
            />
            <Stat
              label="Emotional Intelligence"
              value={profile.personality.empathy}
              description="How well you recognize and respond to emotions"
            />
          </div>
        </div>

        <div className="space-y-8">
          <div className="game-card">
            <h3 className="text-xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent mb-6">
              Compatibility Factors
            </h3>
            <div className="space-y-6">
              <Stat
                label="Intellectual Compatibility"
                value={profile.compatibility.intellectual}
                description="Shared cognitive styles and communication patterns"
              />
              <Stat
                label="Emotional Compatibility"
                value={profile.compatibility.emotional}
                description="Alignment in emotional expression and understanding"
              />
              <Stat
                label="Adventurous Compatibility"
                value={profile.compatibility.adventurous}
                description="Similar appetite for novelty and calculated risks"
              />
            </div>
          </div>

          <div className="game-card">
            <h3 className="text-xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent mb-4">
              Humor Profile
            </h3>
            <div className="text-sm text-dark/80">
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(profile.personality.humor || {}).map(
                  ([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between bg-neutral/30 p-3 rounded-lg"
                    >
                      <span className="font-medium">{key}:</span>
                      <span>{value}</span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 flex flex-wrap justify-center gap-4">
        <button
          onClick={onReset}
          className="game-btn-secondary px-6 py-3 flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span>Play Again</span>
        </button>
        <button
          onClick={handleFinish}
          className="game-btn px-8 py-3 flex items-center gap-2"
        >
          <span>Continue</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </button>
        <button
          onClick={download}
          className="game-btn-secondary px-6 py-3 flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          <span>Download Data</span>
        </button>
      </div>

      <div className="mt-6 text-sm text-gray-600">
        This is an MVP mapping — in a production system you'd calibrate these
        heuristics with labelled data, and consult privacy/consent guidelines
        before storing or sharing results.
      </div>
    </div>
  );
}

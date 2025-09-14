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
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 border rounded-xl">
          <h3 className="text-lg font-medium">Your Quick Profile</h3>
          <div className="mt-4 space-y-3">
            <Stat
              label="Risk tolerance"
              value={`${profile.personality.riskTolerance}%`}
            />
            <Stat
              label="Impulsivity"
              value={`${profile.personality.impulsivity}%`}
            />
            <Stat
              label="Attention"
              value={`${profile.personality.attention}%`}
            />
            <Stat
              label="Processing speed"
              value={`${profile.personality.speed}%`}
            />
            <Stat label="Empathy" value={`${profile.personality.empathy}%`} />
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={download}
              className="px-4 py-2 rounded-full bg-indigo-600 text-white"
            >
              Download results
            </button>
            <button onClick={onReset} className="px-4 py-2 rounded-full border">
              Start over
            </button>
            <button
              onClick={handleFinish}
              className="px-4 py-2 rounded-full bg-green-600 text-white"
            >
              Finish & Continue
            </button>
          </div>
        </div>

        <div className="p-6 border rounded-xl">
          <h3 className="text-lg font-medium">Compatibility Snapshot</h3>
          <div className="mt-4 space-y-3">
            <Stat
              label="Intellectual"
              value={`${profile.compatibility.intellectual}%`}
            />
            <Stat
              label="Emotional"
              value={`${profile.compatibility.emotional}%`}
            />
            <Stat
              label="Adventurous"
              value={`${profile.compatibility.adventurous}%`}
            />
          </div>

          <div className="mt-6">
            <h4 className="text-sm font-medium">Humour profile</h4>
            <div className="mt-2 text-sm text-gray-700">
              {Object.keys(profile.personality.humor).length ? (
                <div className="flex gap-2 flex-wrap mt-2">
                  {Object.entries(profile.personality.humor).map(([k, v]) => (
                    <div
                      key={k}
                      className="px-3 py-1 rounded-full border text-xs"
                    >
                      {k}: {v}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500">No humour data captured.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-600">
        This is an MVP mapping — in a production system you'd calibrate these
        heuristics with labelled data, and consult privacy/consent guidelines
        before storing or sharing results.
      </div>
    </div>
  );
}

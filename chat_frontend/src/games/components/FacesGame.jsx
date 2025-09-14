import React, { useEffect, useRef, useState } from "react";
import { randomInt, now } from "../utils/helpers";

export default function FacesGame({ onComplete }) {
  const TRIALS = 8;
  const pool = [
    { emoji: "😀", label: "Happy" },
    { emoji: "😢", label: "Sad" },
    { emoji: "😡", label: "Angry" },
    { emoji: "😲", label: "Surprised" },
    { emoji: "😐", label: "Neutral" },
    { emoji: "🤨", label: "Skeptical" },
    { emoji: "😊", label: "Warm" },
    { emoji: "😬", label: "Nervous" },
  ];

  const [trialIndex, setTrialIndex] = useState(0);
  const [current, setCurrent] = useState(null);
  const resultsRef = useRef([]);
  const startRef = useRef(null);

  useEffect(() => {
    next(0); // start at trial 0
  }, []);

  const next = (index) => {
    if (index >= TRIALS) {
      const res = resultsRef.current;
      const corrects = res.filter((r) => r.correct).length;
      const meanRT = res.length
        ? res.reduce((a, b) => a + b.rt, 0) / res.length
        : 0;
      onComplete({
        trials: TRIALS,
        accuracy: corrects / res.length,
        meanRT,
        raw: res,
      });
      return;
    }

    const candidate = pool[randomInt(0, pool.length - 1)];
    const distractors = pool
      .filter((p) => p.label !== candidate.label)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    const options = [candidate, ...distractors].sort(() => 0.5 - Math.random());
    setCurrent({ face: candidate, options });
    startRef.current = now();
  };

  const choose = (option) => {
    const rt = now() - startRef.current;
    const correct = option.label === current.face.label;

    resultsRef.current.push({
      trial: trialIndex,
      chosen: option.label,
      correct,
      rt,
      face: current.face.label,
    });

    setTrialIndex((t) => {
      const nextIndex = t + 1;
      setTimeout(() => next(nextIndex), 250); // use updated index
      return nextIndex;
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="p-6 border rounded-xl text-center">
        <h3 className="text-lg font-medium">Faces — Emotional Perception</h3>
        <p className="text-sm text-gray-600 mt-2">
          Pick the emotion that best matches the face. React quickly but
          thoughtfully.
        </p>

        <div className="mt-6 flex flex-col items-center gap-4">
          <div className="text-6xl p-8 rounded-xl border w-48 h-48 flex items-center justify-center bg-white">
            {current?.face?.emoji ?? "🙂"}
          </div>

          <div className="grid grid-cols-2 gap-3 w-full">
            {current?.options?.map((opt) => (
              <button
                key={opt.label}
                onClick={() => choose(opt)}
                className="py-2 px-3 rounded-lg border text-sm"
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="text-sm text-gray-600">
            Trial {Math.min(trialIndex + 1, TRIALS)} / {TRIALS}
          </div>
        </div>
      </div>

      <div className="p-6 border rounded-xl">
        <h4 className="text-md font-medium">Why it matters</h4>
        <p className="text-sm text-gray-600 mt-2">
          How well you read subtle facial cues tells us about empathy and social
          perceptiveness — traits that strongly affect interpersonal
          compatibility.
        </p>
      </div>
    </div>
  );
}

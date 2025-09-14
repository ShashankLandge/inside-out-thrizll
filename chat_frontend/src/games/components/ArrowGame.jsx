import React, { useEffect, useRef, useState } from "react";
import { randomInt, now } from "../utils/helpers";

export default function ArrowGame({ onComplete }) {
  const TRIALS = 12;
  const DIRECTIONS = ["left", "right", "up", "down"];
  const [trial, setTrial] = useState(0);
  const [stimulus, setStimulus] = useState(null);
  const [show, setShow] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const resultsRef = useRef([]);
  const stimTimeRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    startTrial();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      window.removeEventListener("keydown", handleKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trial]);

  const startTrial = () => {
    setShow(false);
    setWaiting(true);
    const delay = randomInt(600, 1400);
    timeoutRef.current = setTimeout(() => {
      const dir = DIRECTIONS[randomInt(0, DIRECTIONS.length - 1)];
      setStimulus({ dir });
      setShow(true);
      setWaiting(false);
      stimTimeRef.current = now();
      window.addEventListener("keydown", handleKey);
    }, delay);
  };

  const handleKey = (e) => {
    if (!show) return;
    const key = e.key;
    let response = null;
    if (key === "ArrowLeft") response = "left";
    if (key === "ArrowRight") response = "right";
    if (key === "ArrowUp") response = "up";
    if (key === "ArrowDown") response = "down";
    if (!response) return;
    recordResponse(response);
  };

  const clickResponse = (dir) => {
    if (!show) return;
    recordResponse(dir);
  };

  const recordResponse = (response) => {
    const rt = now() - stimTimeRef.current;
    const correct = response === stimulus.dir;
    resultsRef.current.push({ trial, response, correct, rt });
    window.removeEventListener("keydown", handleKey);
    setShow(false);
    setTimeout(() => setTrial((t) => t + 1), 350);
  };

  useEffect(() => {
    if (trial >= TRIALS) {
      const res = resultsRef.current;
      const corrects = res.filter((r) => r.correct).length;
      const correctRTs = res.filter((r) => r.correct).map((r) => r.rt);
      const meanRT = correctRTs.length
        ? correctRTs.reduce((a, b) => a + b, 0) / correctRTs.length
        : 0;
      const accuracy = res.length ? corrects / res.length : 0;
      onComplete({ trials: TRIALS, accuracy, meanRT, raw: res });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trial]);

  const arrowRotate = (dir) => {
    if (dir === "left") return "rotate(180deg)";
    if (dir === "right") return "rotate(0deg)";
    if (dir === "up") return "rotate(-90deg)";
    if (dir === "down") return "rotate(90deg)";
    return "rotate(0deg)";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="p-6 border rounded-xl flex flex-col items-center">
        <h3 className="text-lg font-medium">Arrow — Attention & Speed</h3>
        <p className="text-sm text-gray-600 mt-2">
          Press the LEFT / RIGHT / UP / DOWN arrow key (or click the buttons) as
          quickly and accurately as you can when the arrow appears.
        </p>

        <div className="mt-6 w-full flex flex-col items-center gap-4">
          <div className="h-40 w-full flex items-center justify-center">
            <div className="text-center">
              {waiting && <div className="text-gray-400">Get ready...</div>}
              {show && stimulus && (
                <div className="flex items-center gap-4">
                  <svg
                    width="100"
                    height="60"
                    viewBox="0 0 100 60"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                      transform: arrowRotate(stimulus.dir),
                      color: "currentColor",
                    }}
                  >
                    {/* Always draw a right-pointing arrow, rotate for direction */}
                    <polygon points="10,30 70,5 70,55" fill="currentColor" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 flex-wrap justify-center">
            <button
              onClick={() => clickResponse("up")}
              className="px-4 py-2 rounded-full border"
            >
              ↑ Up
            </button>
            <button
              onClick={() => clickResponse("left")}
              className="px-4 py-2 rounded-full border"
            >
              ← Left
            </button>
            <button
              onClick={() => clickResponse("right")}
              className="px-4 py-2 rounded-full border"
            >
              Right →
            </button>
            <button
              onClick={() => clickResponse("down")}
              className="px-4 py-2 rounded-full border"
            >
              ↓ Down
            </button>
          </div>

          <div className="text-sm text-gray-600">
            Trial {Math.min(trial + 1, TRIALS)} / {TRIALS}
          </div>
        </div>
      </div>

      <div className="p-6 border rounded-xl">
        <h4 className="text-md font-medium">What we measure</h4>
        <ul className="mt-3 text-sm text-gray-600 space-y-2 list-disc list-inside">
          <li>
            Accuracy and reaction time — proxies for attention and cognitive
            speed.
          </li>
          <li>Inconsistent, fast incorrect responses suggest impulsivity.</li>
          <li>
            We combine these signals with other games to estimate intellectual
            compatibility.
          </li>
        </ul>
      </div>
    </div>
  );
}

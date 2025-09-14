// src/games/Games.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import GamesHeader from "./components/Header";
import Intro from "./components/Intro";
import BalloonGame from "./components/BalloonGame";
import ArrowGame from "./components/ArrowGame";
import FacesGame from "./components/FacesGame";
import MemeCaptionGame from "./components/MemeCaptionGame";
import Results from "./components/Results";
import gamesStorage from "./services/storage";
import "./games.css"; // small scoped styles if you have any

// This is the integrated games page. It uses the logged-in user id to persist progress.
export default function GamesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0 intro, 1..4 games, 5 results
  const [data, setData] = useState({
    balloon: null,
    arrow: null,
    faces: null,
    meme: null,
  });

  useEffect(() => {
    // load per-user saved progress (if any)
    const uid = user?.id;
    if (!uid) return;
    const saved = gamesStorage.load(uid);
    if (saved) {
      setData(saved.data || saved);
      setStep(saved.step ?? 0);
    }
    // eslint-disable-next-line
  }, [user?.id]);

  const handleComplete = (key, report) => {
    const updated = { ...data, [key]: report };
    setData(updated);
    const next = (step || 0) + 1;
    setStep(next);
    if (user?.id) gamesStorage.save(user.id, { data: updated, step: next });
  };

  const resetAll = () => {
    if (user?.id) gamesStorage.clear(user.id);
    setData({ balloon: null, arrow: null, faces: null, meme: null });
    setStep(0);
  };

  // If the user is not logged in, maybe redirect to login (defensive)
  useEffect(() => {
    if (!user) navigate("/login");
    // eslint-disable-next-line
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-6">
        <GamesHeader step={step} />
        <div className="mt-6">
          {step === 0 && (
            <Intro
              onStart={() => setStep(1)}
              onReset={resetAll}
              existingData={data}
            />
          )}
          {step === 1 && (
            <BalloonGame onComplete={(r) => handleComplete("balloon", r)} />
          )}
          {step === 2 && (
            <ArrowGame onComplete={(r) => handleComplete("arrow", r)} />
          )}
          {step === 3 && (
            <FacesGame onComplete={(r) => handleComplete("faces", r)} />
          )}
          {step === 4 && (
            <MemeCaptionGame onComplete={(r) => handleComplete("meme", r)} />
          )}
          {step === 5 && (
            <Results
              data={data}
              onReset={resetAll}
              onFinish={() => {
                // Save final results and mark user onboarded, then navigate to /users
                if (user?.id) {
                  const payload = {
                    raw: data,
                    profile:
                      typeof window !== "undefined" && window?.__GAMES_PROFILE__
                        ? window.__GAMES_PROFILE__
                        : null,
                  };
                  // Save the raw data to games:results:<userId>
                  localStorage.setItem(
                    `games:results:${user.id}`,
                    JSON.stringify({
                      raw: data,
                      profile: payload?.profile ?? null,
                    })
                  );
                  localStorage.setItem(`onboarded:${user.id}`, "1");
                }
                navigate("/users");
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

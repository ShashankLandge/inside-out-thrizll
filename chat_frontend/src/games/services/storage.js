// const KEY = 'dating_app_playdata'
// export default {
//   save: (obj) => {
//     try { localStorage.setItem(KEY, JSON.stringify(obj)) } catch (e) { /* ignore */ }
//   },
//   load: () => {
//     try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : null } catch (e) { return null }
//   },
//   clear: () => {
//     try { localStorage.removeItem(KEY) } catch (e) {}
//   }
// }

// src/games/services/gamesStorage.js
const PREFIX = "games:onboard:";

function key(uid) {
  return PREFIX + uid;
}

export default {
  save: (uid, obj) => {
    try {
      localStorage.setItem(key(uid), JSON.stringify(obj));
    } catch (e) {
      console.warn("gamesStorage.save failed", e);
    }
  },
  load: (uid) => {
    try {
      const v = localStorage.getItem(key(uid));
      return v ? JSON.parse(v) : null;
    } catch (e) {
      console.warn("gamesStorage.load failed", e);
      return null;
    }
  },
  clear: (uid) => {
    try {
      localStorage.removeItem(key(uid));
    } catch (e) {}
  },
};

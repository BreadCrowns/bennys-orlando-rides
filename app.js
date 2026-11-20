// Benny's Orlando Ride Explorer & Fun/Scare Predictor
const STORAGE_KEY = "benny_orlando_quiz_v1";

const DEFAULT_STATE = {
  // rides[rideId] = { ridden: boolean, fun: 1-5|null, thrillFeel: 1-5|null, scareFeel: 1-5|null, gut: 'fun'|'boring'|'intense'|'scary'|null }
  rides: {},
  ui: {
    activeView: "explorer",
    resortFilter: "all",
    activeParkId: "magic-kingdom",
    statusFilter: "all",
    search: ""
  }
};

const THRILL_LABELS = [
  { val: 1, short: "Too Boring", emoji: "😴" },
  { val: 2, short: "Chill", emoji: "🙂" },
  { val: 3, short: "Just Right!", emoji: "🎯" },
  { val: 4, short: "Wild", emoji: "🤩" },
  { val: 5, short: "Too Much", emoji: "😵" }
];

const SCARE_LABELS = [
  { val: 1, short: "Not Scary", emoji: "☀️" },
  { val: 2, short: "Fun Spooky", emoji: "🎃" },
  { val: 3, short: "A Little", emoji: "😬" },
  { val: 4, short: "Pretty Scary", emoji: "😨" },
  { val: 5, short: "Too Scary!", emoji: "😱" }
];

const FUN_LABELS = [
  { val: 1, short: "Boring" },
  { val: 2, short: "Meh" },
  { val: 3, short: "Good" },
  { val: 4, short: "Really Fun" },
  { val: 5, short: "Best Ever!" }
];

let state = loadState();

function migrateEntry(raw) {
  if (!raw || typeof raw !== "object") {
    return { ridden: false, fun: null, thrillFeel: null, scareFeel: null, gut: null };
  }
  const entry = {
    ridden: Boolean(raw.ridden),
    fun: raw.fun ?? null,
    thrillFeel: raw.thrillFeel ?? null,
    scareFeel: raw.scareFeel ?? null,
    gut: raw.gut ?? null
  };
  // Migrate v1 enjoyment field if present
  if (entry.fun === null && raw.enjoy) {
    if (raw.enjoy === "love") entry.fun = 5;
    else if (raw.enjoy === "ok") entry.fun = 3;
    else if (raw.enjoy === "nope") entry.fun = 1;
  }
  return entry;
}

function migrateRidesMap(ridesObj) {
  const out = {};
  for (const [id, entry] of Object.entries(ridesObj || {})) {
    out[id] = migrateEntry(entry);
  }
  return out;
}

function loadState() {
  try {
    if (window.location.hash && window.location.hash.startsWith("#sync=")) {
      const encoded = window.location.hash.slice(6);
      const json = decodeURIComponent(escape(atob(encoded)));
      const synced = JSON.parse(json);
      const merged = {
        rides: migrateRidesMap(synced.rides),
        ui: { ...DEFAULT_STATE.ui, ...(synced.ui || {}) }
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      history.replaceState(null, "", window.location.pathname + window.location.search);
      return merged;
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_STATE);
    const parsed = JSON.parse(raw);
    return {
      rides: migrateRidesMap(parsed.rides),
      ui: { ...DEFAULT_STATE.ui, ...(parsed.ui || {}) }
    };
  } catch {
    return structuredClone(DEFAULT_STATE);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function buildSyncUrl() {
  const payload = { rides: state.rides };
  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  return `${window.location.origin}${window.location.pathname}#sync=${encoded}`;
}

function getAllRides() {
  const list = [];
  for (const park of PARKS_DATA) {
    for (const land of park.lands) {
      for (const ride of land.rides) {
        list.push({
          ...ride,
          parkId: park.id,
          parkName: park.name,
          parkIcon: park.icon,
          resort: park.resort,
          resortName: park.resortName,
          land: land.name
        });
      }
    }
  }
  return list;
}

const ALL_RIDES = getAllRides();

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

// Learn Benny's Thrill Sweet Spot, Boring Floor, Scare Comfort, and Tag Affinities
// directly from the rides he has ridden and rated.
function computeBennyProfile() {
  const riddenEntries = ALL_RIDES
    .map((ride) => ({ ride, entry: state.rides[ride.id] }))
    .filter((x) => x.entry && x.entry.ridden);

  const sweetThrills = [];
  const boringThrills = [];
  const tooMuchThrills = [];
  const comfyScares = [];
  const tooScaryScares = [];
  const tagScores = {};

  for (const { ride, entry } of riddenEntries) {
    const fun = entry.fun;
    const tFeel = entry.thrillFeel;
    const sFeel = entry.scareFeel;

    // Thrill learning
    if (tFeel === 1) {
      boringThrills.push(ride.thrillBase);
    } else if (tFeel === 5) {
      tooMuchThrills.push(ride.thrillBase);
    } else if (tFeel === 2 || tFeel === 3 || tFeel === 4) {
      const weight = tFeel === 3 ? 2 : 1;
      for (let i = 0; i < weight; i++) sweetThrills.push(ride.thrillBase);
    } else if (fun !== null) {
      if (fun >= 4) sweetThrills.push(ride.thrillBase);
      else if (fun <= 2 && ride.thrillBase <= 2) boringThrills.push(ride.thrillBase);
      else if (fun === 1 && ride.thrillBase >= 4) tooMuchThrills.push(ride.thrillBase);
    }

    // Scare learning
    if (sFeel !== null) {
      if (sFeel <= 3) {
        comfyScares.push(ride.scareBase);
      } else if (sFeel === 4) {
        comfyScares.push(ride.scareBase - 0.5);
      } else if (sFeel === 5) {
        tooScaryScares.push(ride.scareBase);
      }
    } else if (fun !== null) {
      if (fun >= 4) comfyScares.push(ride.scareBase);
    }

    // Tag affinity learning from Fun (1-5)
    if (fun !== null) {
      const delta = (fun - 3) / 2; // -1.0 to +1.0
      for (const tag of ride.tags || []) {
        if (!tagScores[tag]) tagScores[tag] = { sum: 0, count: 0 };
        tagScores[tag].sum += delta;
        tagScores[tag].count += 1;
      }
    }
  }

  // Compute Thrill Sweet Spot (default 3.0 for a 10yo until calibrated)
  let thrillSweetSpot = 3.0;
  if (sweetThrills.length > 0) {
    const avg = sweetThrills.reduce((a, b) => a + b, 0) / sweetThrills.length;
    const maxSweet = Math.max(...sweetThrills);
    const learned = avg * 0.6 + maxSweet * 0.4;
    const blend = Math.min(0.85, sweetThrills.length * 0.22);
    thrillSweetSpot = 3.0 * (1 - blend) + learned * blend;
  }

  let thrillCeiling = 5.0;
  if (tooMuchThrills.length > 0) {
    thrillCeiling = Math.min(...tooMuchThrills) - 0.4;
    thrillSweetSpot = Math.min(thrillSweetSpot, thrillCeiling);
  }

  // Compute Boring Floor (rides at or below this thrill level feel too tame)
  let boringFloor = 0.7;
  if (boringThrills.length > 0) {
    const maxBoring = Math.max(...boringThrills);
    boringFloor = Math.min(maxBoring + 0.15, thrillSweetSpot - 0.6);
  } else if (thrillSweetSpot >= 3.8) {
    // If Benny loves big thrills, gentle 1/5 rides naturally score a bit lower
    boringFloor = 1.1;
  }

  // Compute Scare Comfort (default 2.5 until calibrated)
  let scareComfort = 2.5;
  if (comfyScares.length > 0) {
    const avg = comfyScares.reduce((a, b) => a + b, 0) / comfyScares.length;
    const maxComfy = Math.max(...comfyScares);
    const learned = avg * 0.45 + maxComfy * 0.55;
    const blend = Math.min(0.85, comfyScares.length * 0.22);
    scareComfort = 2.5 * (1 - blend) + learned * blend;
  }
  if (tooScaryScares.length > 0) {
    const minTooScary = Math.min(...tooScaryScares);
    scareComfort = Math.min(scareComfort, minTooScary - 0.6);
  }

  return {
    thrillSweetSpot: clamp(thrillSweetSpot, 1, 5),
    thrillCeiling: clamp(thrillCeiling, 1, 5),
    boringFloor: clamp(boringFloor, 0.5, 3.5),
    scareComfort: clamp(scareComfort, 1, 5),
    tagScores,
    riddenCount: riddenEntries.length
  };
}

// Predict Fun (1-5), Scare Comfort (1-5), and Brave Nudge status for an un-ridden ride
function predictRide(ride, profile) {
  const entry = state.rides[ride.id] || {};

  // 1. Scare Comfort (1-5): 5 = totally comfortable, 1 = likely too scary
  const scareDiff = ride.scareBase - profile.scareComfort;
  let scareComfortScore = scareDiff <= 0 ? 5 : clamp(5 - scareDiff * 1.45, 1, 5);

  // 2. Fun Score (1-5): peaks at thrillSweetSpot, drops if too boring OR too intense/scary
  let funScore = 4.6;

  // Penalty if too boring
  if (ride.thrillBase <= profile.boringFloor) {
    const boringGap = profile.boringFloor - ride.thrillBase;
    funScore -= 1.8 + boringGap * 0.8;
  } else if (ride.thrillBase < profile.thrillSweetSpot - 1.2) {
    funScore -= (profile.thrillSweetSpot - 1.2 - ride.thrillBase) * 0.55;
  }

  // Penalty if above thrill sweet spot or ceiling
  if (ride.thrillBase > profile.thrillCeiling) {
    funScore -= (ride.thrillBase - profile.thrillCeiling) * 1.6;
  } else if (ride.thrillBase > profile.thrillSweetSpot + 0.6) {
    funScore -= (ride.thrillBase - (profile.thrillSweetSpot + 0.6)) * 0.9;
  }

  // Penalty if likely too scary
  if (scareDiff > 0.6) {
    funScore -= (scareDiff - 0.6) * 0.85;
  }

  // Tag affinity learned from his rated rides
  let tagBonus = 0;
  for (const tag of ride.tags || []) {
    const stat = profile.tagScores[tag];
    if (stat && stat.count >= 1) {
      const weight = Math.min(0.45, stat.count * 0.2);
      tagBonus += (stat.sum / stat.count) * weight;
    }
  }
  funScore += clamp(tagBonus, -0.9, 0.9);

  // Respect his gut reaction slightly if he tapped "Looks Super Fun" or "Looks Boring"
  if (entry.gut === "fun") funScore += 0.35;
  if (entry.gut === "boring") funScore -= 0.7;
  if (entry.gut === "intense") funScore -= 0.4;

  const predictedFun = Math.round(clamp(funScore, 1, 5));
  const predictedScareComfort = Math.round(clamp(scareComfortScore, 1, 5));

  // Brave Nudge detection:
  // Ride looks spooky/scary (or Benny tapped "Looks Too Scary!"),
  // BUT the actual ride motion is doable and should be fun!
  const motionIsDoable =
    ride.thrillBase <= profile.thrillSweetSpot + 0.7 &&
    ride.thrillBase > profile.boringFloor &&
    ride.thrillBase <= profile.thrillCeiling;
  const scareIsStretch = scareDiff > 0.2 && scareDiff <= 1.9;
  const isBraveNudge =
    !entry.ridden &&
    motionIsDoable &&
    (entry.gut === "scary" || scareIsStretch);

  let badgeText = "🤔 Might Be Okay";
  let boxClass = "match-low";
  if (isBraveNudge) {
    badgeText = "🚀 Brave Nudge!";
    boxClass = "match-nudge";
  } else if (ride.thrillBase <= profile.boringFloor || entry.gut === "boring") {
    badgeText = "😴 Might Feel Boring";
    boxClass = "match-low";
  } else if (predictedFun === 5) {
    badgeText = "🔥 5/5 Must-Ride!";
    boxClass = "match-5";
  } else if (predictedFun === 4) {
    badgeText = "👍 4/5 Really Fun!";
    boxClass = "match-4";
  } else if (ride.thrillBase > profile.thrillCeiling) {
    badgeText = "⚡ Probably Too Intense";
    boxClass = "match-low";
  } else if (predictedScareComfort <= 2) {
    badgeText = "👻 Might Be Too Scary";
    boxClass = "match-low";
  }

  return {
    predictedFun,
    predictedScareComfort,
    isBraveNudge,
    badgeText,
    boxClass
  };
}

// RENDERING
function renderAll() {
  const profile = computeBennyProfile();
  renderStatsBar(profile);
  renderParkTabs();
  renderExplorerRides(profile);
  renderPredictionsDashboard(profile);
  renderCheatSheet(profile);
}

function renderStatsBar(profile) {
  const total = ALL_RIDES.length;
  const nudges = ALL_RIDES.filter((r) => predictRide(r, profile).isBraveNudge).length;
  const topFun = ALL_RIDES.filter(
    (r) => !state.rides[r.id]?.ridden && predictRide(r, profile).predictedFun >= 4
  ).length;

  document.getElementById("stats-bar").innerHTML = `
    <div class="stat-box">
      <div class="stat-label">Rides Rated</div>
      <div class="stat-value">${profile.riddenCount} <span style="font-size:0.85rem;font-weight:500;">/ ${total}</span></div>
      <div class="stat-sub">${profile.riddenCount === 0 ? "Rate rides to calibrate!" : "Predictions calibrated"}</div>
    </div>
    <div class="stat-box">
      <div class="stat-label">🎯 Thrill Sweet Spot</div>
      <div class="stat-value">${profile.thrillSweetSpot.toFixed(1)} / 5</div>
      <div class="stat-sub">Ideal motion level</div>
    </div>
    <div class="stat-box">
      <div class="stat-label">👻 Scare Comfort</div>
      <div class="stat-value">${profile.scareComfort.toFixed(1)} / 5</div>
      <div class="stat-sub">Lighting &amp; spooky sets</div>
    </div>
    <div class="stat-box">
      <div class="stat-label">🚀 Brave Nudges</div>
      <div class="stat-value">${nudges}</div>
      <div class="stat-sub">${topFun} rides predicted 4–5/5 Fun</div>
    </div>
  `;
}

function renderParkTabs() {
  const container = document.getElementById("park-tabs");
  const visibleParks = PARKS_DATA.filter(
    (p) => state.ui.resortFilter === "all" || p.resort === state.ui.resortFilter
  );

  if (!visibleParks.some((p) => p.id === state.ui.activeParkId) && visibleParks.length > 0) {
    state.ui.activeParkId = visibleParks[0].id;
  }

  container.innerHTML = visibleParks
    .map((park) => {
      const totalInPark = park.lands.reduce((sum, l) => sum + l.rides.length, 0);
      const riddenInPark = park.lands.reduce(
        (sum, l) => sum + l.rides.filter((r) => state.rides[r.id]?.ridden).length,
        0
      );
      const active = park.id === state.ui.activeParkId ? "active" : "";
      return `
        <button type="button" class="park-tab ${active}" data-park="${park.id}" style="--park-color:${park.color}">
          <span>${park.icon} ${park.name}</span>
          <span class="park-count">${riddenInPark}/${totalInPark}</span>
        </button>
      `;
    })
    .join("");
}

function renderExplorerRides(profile) {
  const container = document.getElementById("rides-container");
  const search = state.ui.search.trim().toLowerCase();
  const statusFilter = state.ui.statusFilter;

  const parksToShow = search
    ? PARKS_DATA.filter(
        (p) => state.ui.resortFilter === "all" || p.resort === state.ui.resortFilter
      )
    : PARKS_DATA.filter((p) => p.id === state.ui.activeParkId);

  let html = "";

  for (const park of parksToShow) {
    let parkHasResults = false;
    let parkHtml = "";

    for (const land of park.lands) {
      const filteredRides = land.rides.filter((ride) => {
        const entry = state.rides[ride.id] || {};
        const pred = predictRide(ride, profile);

        if (search) {
          const hay = `${ride.name} ${land.name} ${park.name}`.toLowerCase();
          if (!hay.includes(search)) return false;
        }
        if (statusFilter === "ridden" && !entry.ridden) return false;
        if (statusFilter === "unridden" && entry.ridden) return false;
        if (statusFilter === "nudge" && !pred.isBraveNudge) return false;
        if (statusFilter === "top-match" && (entry.ridden || pred.predictedFun < 4)) return false;

        return true;
      });

      if (filteredRides.length === 0) continue;
      parkHasResults = true;

      parkHtml += `
        <div class="land-section">
          <div class="land-header">
            <h3 class="land-title">${search ? `${park.icon} ${park.name} — ` : ""}${land.name}</h3>
            <span class="land-badge">${filteredRides.length} ride${filteredRides.length === 1 ? "" : "s"}</span>
          </div>
          <div class="rides-grid">
            ${filteredRides.map((ride) => renderRideCard(ride, profile)).join("")}
          </div>
        </div>
      `;
    }

    if (parkHasResults) {
      html += parkHtml;
    }
  }

  if (!html) {
    html = `
      <div class="dash-card" style="text-align:center; padding:32px;">
        <h3>No rides match that filter</h3>
        <p style="color:var(--text-muted);">Try switching the filter back to <strong>All Rides</strong> or clearing your search.</p>
      </div>
    `;
  }

  container.innerHTML = html;
}

function renderRideCard(ride, profile) {
  const entry = state.rides[ride.id] || {
    ridden: false,
    fun: null,
    thrillFeel: null,
    scareFeel: null,
    gut: null
  };
  const pred = predictRide(ride, profile);

  const cardClasses = [
    "ride-card",
    entry.ridden ? "is-ridden" : "",
    pred.isBraveNudge ? "is-nudge" : ""
  ]
    .filter(Boolean)
    .join(" ");

  const thrillSelected = THRILL_LABELS.find((x) => x.val === entry.thrillFeel);
  const scareSelected = SCARE_LABELS.find((x) => x.val === entry.scareFeel);

  return `
    <article class="${cardClasses}" data-ride-id="${ride.id}">
      <div class="ride-top">
        <div>
          <h4 class="ride-name">${ride.name}</h4>
          <div class="ride-meta">
            <span class="meta-pill">📏 ${ride.height}</span>
            <span class="meta-pill">⚡ Motion: ${ride.thrillBase}/5</span>
            <span class="meta-pill">👻 Spook: ${ride.scareBase}/5</span>
          </div>
        </div>
      </div>

      <div class="ridden-toggle">
        <button type="button" class="ridden-btn ${!entry.ridden ? "active-no" : ""}" data-action="set-ridden" data-val="false">
          Not Ridden Yet
        </button>
        <button type="button" class="ridden-btn ${entry.ridden ? "active-yes" : ""}" data-action="set-ridden" data-val="true">
          ✓ Ridden Before!
        </button>
      </div>

      ${
        entry.ridden
          ? `
        <div class="rating-group">
          <div class="rating-box fun-box">
            <div class="rating-box-header">
              <span>🎉 How Fun Was It? (1–5)</span>
              <span>${entry.fun ? `${entry.fun}/5 · ${FUN_LABELS.find((f) => f.val === entry.fun)?.short}` : "—"}</span>
            </div>
            <div class="scale-1-5">
              ${FUN_LABELS.map(
                (f) => `
                <button type="button" class="scale-btn ${entry.fun === f.val ? "active" : ""}" data-action="set-fun" data-val="${f.val}" title="${f.short}">
                  ${f.val}<div style="font-size:0.65rem;font-weight:600;">${f.short}</div>
                </button>
              `
              ).join("")}
            </div>
          </div>

          <div class="rating-box thrill-box">
            <div class="rating-box-header">
              <span>⚡ How Did the Thrill Feel?</span>
              <span>${thrillSelected ? `${thrillSelected.emoji} ${thrillSelected.short}` : "—"}</span>
            </div>
            <p class="rating-desc">${ride.thrillDesc}</p>
            <div class="goldilocks-scale">
              ${THRILL_LABELS.map(
                (t) => `
                <button type="button" class="goldilocks-btn ${entry.thrillFeel === t.val ? "active" : ""}" data-action="set-thrill-feel" data-val="${t.val}">
                  ${t.emoji}<br/>${t.short}
                </button>
              `
              ).join("")}
            </div>
          </div>

          <div class="rating-box scare-box">
            <div class="rating-box-header">
              <span>👻 How Scary Were the Sets/Lights?</span>
              <span>${scareSelected ? `${scareSelected.emoji} ${scareSelected.short}` : "—"}</span>
            </div>
            <p class="rating-desc">${ride.scareDesc}</p>
            <div class="goldilocks-scale">
              ${SCARE_LABELS.map(
                (s) => `
                <button type="button" class="goldilocks-btn ${entry.scareFeel === s.val ? "active" : ""}" data-action="set-scare-feel" data-val="${s.val}">
                  ${s.emoji}<br/>${s.short}
                </button>
              `
              ).join("")}
            </div>
          </div>
        </div>
      `
          : `
        <div class="rating-group">
          <div class="gut-box">
            <div class="rating-box-header" style="margin-bottom:8px;">
              <span>💭 Benny's Gut Reaction (Optional)</span>
            </div>
            <p class="rating-desc"><strong>Motion:</strong> ${ride.thrillDesc}<br/><strong>Sets/Lights:</strong> ${ride.scareDesc}</p>
            <div class="gut-grid">
              <button type="button" class="gut-btn ${entry.gut === "fun" ? "active-fun" : ""}" data-action="set-gut" data-val="fun">🤩 Looks Super Fun!</button>
              <button type="button" class="gut-btn ${entry.gut === "boring" ? "active-boring" : ""}" data-action="set-gut" data-val="boring">😴 Looks Boring</button>
              <button type="button" class="gut-btn ${entry.gut === "intense" ? "active-intense" : ""}" data-action="set-gut" data-val="intense">⚡ Looks Too Intense</button>
              <button type="button" class="gut-btn ${entry.gut === "scary" ? "active-scary" : ""}" data-action="set-gut" data-val="scary">👻 Looks Too Scary!</button>
            </div>
          </div>

          <div class="prediction-box ${pred.boxClass}">
            <div class="prediction-header">
              <strong>Prediction</strong>
              <span class="pred-badge">${pred.badgeText}</span>
            </div>
            <div class="pred-scores">
              <span>🎉 Predicted Fun: <strong>${pred.predictedFun}/5</strong></span>
              <span>👻 Scare Comfort: <strong>${pred.predictedScareComfort}/5</strong></span>
            </div>
            <p class="nudge-tip">
              ${
                entry.gut === "scary" && pred.isBraveNudge
                  ? `<strong>You think it looks too scary—</strong>`
                  : ""
              }${ride.nudgeTip}
            </p>
          </div>
        </div>
      `
      }
    </article>
  `;
}

function renderPredictionsDashboard(profile) {
  const container = document.getElementById("predictions-container");
  const unridden = ALL_RIDES.filter((r) => !state.rides[r.id]?.ridden).map((r) => ({
    ride: r,
    pred: predictRide(r, profile)
  }));

  const nudgeRides = unridden.filter((x) => x.pred.isBraveNudge);
  const topRides = unridden
    .filter((x) => !x.pred.isBraveNudge && x.pred.predictedFun >= 4)
    .sort((a, b) => b.pred.predictedFun - a.pred.predictedFun);

  const thrillPct = (profile.thrillSweetSpot / 5) * 100;
  const scarePct = (profile.scareComfort / 5) * 100;

  container.innerHTML = `
    <div class="dashboard-grid">
      <div class="dash-card">
        <h3>🎯 Benny's Thrill Sweet Spot</h3>
        <div style="font-size:1.6rem;font-weight:800;color:var(--thrill);">${profile.thrillSweetSpot.toFixed(1)} / 5</div>
        <div class="meter-bar"><div class="meter-fill" style="width:${thrillPct}%;background:var(--thrill);"></div></div>
        <p style="font-size:0.86rem;color:var(--text-muted);margin:0;">
          Learned from ${profile.riddenCount} rated ride${profile.riddenCount === 1 ? "" : "s"}. Rides at or below ${profile.boringFloor.toFixed(1)}/5 may feel too boring.
        </p>
      </div>
      <div class="dash-card">
        <h3>👻 Benny's Scare Comfort</h3>
        <div style="font-size:1.6rem;font-weight:800;color:var(--scare);">${profile.scareComfort.toFixed(1)} / 5</div>
        <div class="meter-bar"><div class="meter-fill" style="width:${scarePct}%;background:var(--scare);"></div></div>
        <p style="font-size:0.86rem;color:var(--text-muted);margin:0;">
          Measures comfort with dark rooms, spooky set dressings, monsters, and sudden lighting effects.
        </p>
      </div>
      <div class="dash-card">
        <h3>🚀 Brave Nudge Zone</h3>
        <div style="font-size:1.6rem;font-weight:800;color:var(--nudge);">${nudgeRides.length} Rides</div>
        <p style="font-size:0.86rem;color:var(--text-muted);margin:6px 0 0;">
          Rides that <strong>look</strong> spooky (or Benny marked 👻 Looks Too Scary), but the actual ride motion is right in his fun zone!
        </p>
      </div>
    </div>

    <h2 class="section-heading">🚀 Brave Nudge Zone — Worth Pushing a Little For!</h2>
    ${
      nudgeRides.length > 0
        ? `<div class="rides-grid">
            ${nudgeRides
              .map(
                ({ ride, pred }) => `
              <div class="ride-card is-nudge">
                <div class="ride-top">
                  <div>
                    <div style="font-size:0.78rem;font-weight:700;color:var(--text-muted);">${ride.parkIcon} ${ride.parkName} · ${ride.land}</div>
                    <h4 class="ride-name">${ride.name}</h4>
                  </div>
                  <span class="pred-badge">🚀 Nudge</span>
                </div>
                <div class="pred-scores">
                  <span>🎉 Predicted Fun: ${pred.predictedFun}/5</span>
                  <span>👻 Scare Comfort: ${pred.predictedScareComfort}/5</span>
                </div>
                <p style="font-size:0.83rem;margin:0;color:var(--text-muted);">
                  <strong>Motion:</strong> ${ride.thrillDesc}<br/>
                  <strong>Sets/Lights:</strong> ${ride.scareDesc}
                </p>
                <p class="nudge-tip" style="background:var(--nudge-bg);padding:8px 10px;border-radius:8px;border:none;">
                  💡 <strong>Why Benny can handle this:</strong> ${ride.nudgeTip}
                </p>
              </div>
            `
              )
              .join("")}
          </div>`
        : `<div class="dash-card"><p style="margin:0;color:var(--text-muted);">No Brave Nudge rides flagged right now—rate more rides or tap 👻 Looks Too Scary on rides you're unsure about!</p></div>`
    }

    <h2 class="section-heading">🌟 Top Predicted Fun Rides (4–5 / 5)</h2>
    <div class="rides-grid">
      ${topRides
        .slice(0, 24)
        .map(
          ({ ride, pred }) => `
        <div class="ride-card">
          <div class="ride-top">
            <div>
              <div style="font-size:0.78rem;font-weight:700;color:var(--text-muted);">${ride.parkIcon} ${ride.parkName} · ${ride.land}</div>
              <h4 class="ride-name">${ride.name}</h4>
            </div>
            <span class="pred-badge">${pred.predictedFun}/5 Fun</span>
          </div>
          <div class="pred-scores">
            <span>🎉 Fun: ${pred.predictedFun}/5</span>
            <span>👻 Scare Comfort: ${pred.predictedScareComfort}/5</span>
          </div>
          <p style="font-size:0.82rem;margin:0;color:var(--text-muted);">${ride.thrillDesc}</p>
        </div>
      `
        )
        .join("")}
    </div>
  `;
}

function renderCheatSheet(profile) {
  const container = document.getElementById("cheatsheet-container");

  let tablesHtml = "";
  for (const park of PARKS_DATA) {
    const rows = [];
    for (const land of park.lands) {
      for (const ride of land.rides) {
        const entry = state.rides[ride.id] || {};
        const pred = predictRide(ride, profile);
        const thrillText = entry.ridden
          ? THRILL_LABELS.find((t) => t.val === entry.thrillFeel)?.short ?? "—"
          : `${ride.thrillBase}/5`;
        const scareText = entry.ridden
          ? SCARE_LABELS.find((s) => s.val === entry.scareFeel)?.short ?? "—"
          : `${pred.predictedScareComfort}/5`;
        const funText = entry.ridden
          ? entry.fun
            ? `<strong>${entry.fun}/5</strong>`
            : "—"
          : `<strong>${pred.predictedFun}/5</strong>`;
        const status = entry.ridden ? "✓ Ridden" : pred.badgeText;

        rows.push(`
          <tr>
            <td><strong>${ride.name}</strong></td>
            <td>${land.name}</td>
            <td>${ride.height}</td>
            <td>${funText}</td>
            <td>${thrillText}</td>
            <td>${scareText}</td>
            <td>${status}</td>
          </tr>
        `);
      }
    }

    tablesHtml += `
      <h3 class="section-heading">${park.icon} ${park.name}</h3>
      <div class="cheat-table-wrap">
        <table class="cheat-table">
          <thead>
            <tr>
              <th>Ride</th>
              <th>Land</th>
              <th>Height</th>
              <th>🎉 Fun</th>
              <th>⚡ Thrill</th>
              <th>👻 Scare Comfort</th>
              <th>Status / Advice</th>
            </tr>
          </thead>
          <tbody>${rows.join("")}</tbody>
        </table>
      </div>
    `;
  }

  container.innerHTML = `
    <div class="cheatsheet-actions">
      <button type="button" class="btn-primary" id="btn-sync-link">🔗 Copy Sync Link (Open on Another Device)</button>
      <button type="button" class="btn-secondary" id="btn-print">🖨️ Print Park Cheat Sheet</button>
      <button type="button" class="btn-secondary" id="btn-export">⬇️ Export Benny's Data (JSON)</button>
      <label class="btn-secondary" style="display:inline-flex;align-items:center;gap:6px;cursor:pointer;">
        ⬆️ Import Data
        <input type="file" id="input-import" accept="application/json" style="display:none;" />
      </label>
      <button type="button" class="btn-danger" id="btn-reset">🗑️ Reset All Answers</button>
    </div>
    ${tablesHtml}
  `;
}

let toastTimer = null;
function showToast(msg) {
  const el = document.getElementById("live-toast");
  if (!el) return;
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 3400);
}

// EVENT DELEGATION
document.addEventListener("click", (e) => {
  // View tabs
  const viewTab = e.target.closest(".view-tab");
  if (viewTab) {
    state.ui.activeView = viewTab.dataset.view;
    document.querySelectorAll(".view-tab").forEach((t) => t.classList.toggle("active", t === viewTab));
    document.querySelectorAll(".view-panel").forEach((p) => {
      p.classList.toggle("active", p.id === `view-${state.ui.activeView}`);
    });
    return;
  }

  // Resort filter
  const resortBtn = e.target.closest(".resort-filter .chip");
  if (resortBtn) {
    state.ui.resortFilter = resortBtn.dataset.resort;
    document.querySelectorAll(".resort-filter .chip").forEach((c) => c.classList.toggle("active", c === resortBtn));
    saveState();
    renderAll();
    return;
  }

  // Park tabs
  const parkBtn = e.target.closest(".park-tab");
  if (parkBtn) {
    state.ui.activeParkId = parkBtn.dataset.park;
    saveState();
    renderAll();
    return;
  }

  // Status filter
  const filterBtn = e.target.closest(".status-filters .filter-chip");
  if (filterBtn) {
    state.ui.statusFilter = filterBtn.dataset.filter;
    document.querySelectorAll(".status-filters .filter-chip").forEach((c) => c.classList.toggle("active", c === filterBtn));
    saveState();
    renderExplorerRides(computeBennyProfile());
    return;
  }

  // Ride card actions
  const actionBtn = e.target.closest("[data-action]");
  if (actionBtn) {
    const card = actionBtn.closest("[data-ride-id]");
    if (!card) return;
    const rideId = card.dataset.rideId;
    const current = migrateEntry(state.rides[rideId]);
    const action = actionBtn.dataset.action;
    const val = actionBtn.dataset.val;
    const prevProfile = computeBennyProfile();

    if (action === "set-ridden") {
      current.ridden = val === "true";
    } else if (action === "set-fun") {
      const n = Number(val);
      current.fun = current.fun === n ? null : n;
    } else if (action === "set-thrill-feel") {
      const n = Number(val);
      current.thrillFeel = current.thrillFeel === n ? null : n;
    } else if (action === "set-scare-feel") {
      const n = Number(val);
      current.scareFeel = current.scareFeel === n ? null : n;
    } else if (action === "set-gut") {
      current.gut = current.gut === val ? null : val;
    }

    state.rides[rideId] = current;
    saveState();
    renderAll();

    const nextProfile = computeBennyProfile();
    const tDelta = nextProfile.thrillSweetSpot - prevProfile.thrillSweetSpot;
    const sDelta = nextProfile.scareComfort - prevProfile.scareComfort;
    if (current.ridden && (Math.abs(tDelta) >= 0.05 || Math.abs(sDelta) >= 0.05)) {
      showToast(
        `Predictions updated! 🎯 Thrill Sweet Spot: ${nextProfile.thrillSweetSpot.toFixed(1)}/5 · 👻 Scare Comfort: ${nextProfile.scareComfort.toFixed(1)}/5`
      );
    } else if (current.ridden && (action === "set-fun" || action === "set-thrill-feel" || action === "set-scare-feel")) {
      showToast("Saved! Fun & Scare predictions updated across all 7 parks.");
    }
    return;
  }

  // Cheat sheet buttons
  if (e.target.id === "btn-sync-link") {
    const url = buildSyncUrl();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(
        () => showToast("Sync link copied! Open it on any phone or tablet to load Benny's data."),
        () => prompt("Copy this sync link:", url)
      );
    } else {
      prompt("Copy this sync link:", url);
    }
    return;
  }

  if (e.target.id === "btn-print") {
    window.print();
    return;
  }

  if (e.target.id === "btn-export") {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "benny-orlando-rides.json";
    a.click();
    URL.revokeObjectURL(url);
    return;
  }

  if (e.target.id === "btn-reset") {
    if (confirm("Reset all of Benny's ride ratings?")) {
      state = structuredClone(DEFAULT_STATE);
      saveState();
      renderAll();
    }
  }
});

document.getElementById("search-input").addEventListener("input", (e) => {
  state.ui.search = e.target.value;
  renderExplorerRides(computeBennyProfile());
});

document.addEventListener("change", (e) => {
  if (e.target.id === "input-import") {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target.result);
        state = {
          rides: migrateRidesMap(imported.rides),
          ui: { ...DEFAULT_STATE.ui, ...(imported.ui || {}) }
        };
        saveState();
        renderAll();
      } catch {
        alert("Could not read that JSON file.");
      }
    };
    reader.readAsText(file);
  }
});

// Initial render
renderAll();

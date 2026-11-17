// Benny's Orlando Ride Explorer & 1-5 Predictor
const STORAGE_KEY = "benny_orlando_quiz_v1";

const DEFAULT_STATE = {
  quiz: {
    thrillPref: 3,
    scarePref: 2,
    nudgeWillingness: 1,
    spinPref: 2
  },
  // rides[rideId] = { ridden: boolean, thrill: number|null, scare: number|null, enjoy: 'love'|'ok'|'nope'|null }
  rides: {},
  ui: {
    activeView: "explorer",
    resortFilter: "all",
    activeParkId: "magic-kingdom",
    statusFilter: "all",
    search: "",
    quizCollapsed: false
  }
};

let state = loadState();

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_STATE);
    const parsed = JSON.parse(raw);
    return {
      quiz: { ...DEFAULT_STATE.quiz, ...(parsed.quiz || {}) },
      rides: parsed.rides || {},
      ui: { ...DEFAULT_STATE.ui, ...(parsed.ui || {}) }
    };
  } catch {
    return structuredClone(DEFAULT_STATE);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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

// Compute Benny's calibrated Thrill & Scare profile from Quiz + Ridden Rides
function computeBennyProfile() {
  const { thrillPref, scarePref, nudgeWillingness, spinPref } = state.quiz;

  const riddenEntries = ALL_RIDES
    .map((ride) => ({ ride, entry: state.rides[ride.id] }))
    .filter((x) => x.entry && x.entry.ridden);

  let lovedThrills = [];
  let lovedScares = [];
  let nopeThrills = [];
  let nopeScares = [];
  let thrillDiffs = [];
  let scareDiffs = [];
  const tagScores = {}; // tag -> { sum, count }

  for (const { ride, entry } of riddenEntries) {
    // Use objective guide rating to know what intensity he actually conquered,
    // blended with his own rating if he felt it was even higher.
    const effectiveT = entry.thrill ? Math.max(ride.thrillBase, entry.thrill) : ride.thrillBase;
    const effectiveS = entry.scare ? Math.max(ride.scareBase, entry.scare) : ride.scareBase;

    if (entry.thrill != null) {
      thrillDiffs.push(entry.thrill - ride.thrillBase);
    }
    if (entry.scare != null) {
      scareDiffs.push(entry.scare - ride.scareBase);
    }

    if (entry.enjoy === "love") {
      lovedThrills.push(effectiveT);
      lovedScares.push(effectiveS);
    } else if (entry.enjoy === "ok") {
      lovedThrills.push(effectiveT * 0.92);
      lovedScares.push(effectiveS * 0.92);
    } else if (entry.enjoy === "nope") {
      // If he disliked it, use the rating (or guide rating) as an upper bound signal
      nopeThrills.push(entry.thrill ?? ride.thrillBase);
      nopeScares.push(entry.scare ?? ride.scareBase);
    }

    // Track tag-level learning (e.g., coasters, in-the-dark, drop, simulator, spinning, water)
    if (entry.enjoy) {
      const delta = entry.enjoy === "love" ? 1 : entry.enjoy === "ok" ? 0.25 : -1;
      for (const tag of ride.tags || []) {
        if (!tagScores[tag]) tagScores[tag] = { sum: 0, count: 0 };
        tagScores[tag].sum += delta;
        tagScores[tag].count += 1;
      }
    }
  }

  // Blend quiz preference with actual ridden feedback (more rides = stronger calibration)
  let thrillComfort = thrillPref;
  if (lovedThrills.length > 0) {
    const maxLovedT = Math.max(...lovedThrills);
    const avgLovedT = lovedThrills.reduce((a, b) => a + b, 0) / lovedThrills.length;
    const learnedT = avgLovedT * 0.45 + maxLovedT * 0.55;
    const weight = Math.min(0.75, lovedThrills.length * 0.14);
    thrillComfort = thrillPref * (1 - weight) + learnedT * weight;
  }
  if (nopeThrills.length > 0) {
    const minNopeT = Math.min(...nopeThrills);
    if (minNopeT <= thrillComfort) {
      thrillComfort = Math.max(1, minNopeT - 0.5);
    }
  }

  let scareComfort = scarePref;
  if (lovedScares.length > 0) {
    const maxLovedS = Math.max(...lovedScares);
    const avgLovedS = lovedScares.reduce((a, b) => a + b, 0) / lovedScares.length;
    const learnedS = avgLovedS * 0.4 + maxLovedS * 0.6;
    const weight = Math.min(0.75, lovedScares.length * 0.14);
    scareComfort = scarePref * (1 - weight) + learnedS * weight;
  }
  if (nopeScares.length > 0) {
    const minNopeS = Math.min(...nopeScares);
    if (minNopeS <= scareComfort) {
      scareComfort = Math.max(1, minNopeS - 0.5);
    }
  }

  const thrillBias =
    thrillDiffs.length >= 2
      ? clamp(thrillDiffs.reduce((a, b) => a + b, 0) / thrillDiffs.length, -1, 1)
      : 0;
  const scareBias =
    scareDiffs.length >= 2
      ? clamp(scareDiffs.reduce((a, b) => a + b, 0) / scareDiffs.length, -1, 1)
      : 0;

  return {
    thrillComfort: clamp(thrillComfort, 1, 5),
    scareComfort: clamp(scareComfort, 1, 5),
    thrillBias,
    scareBias,
    tagScores,
    nudgeWillingness,
    spinPref,
    riddenCount: riddenEntries.length
  };
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

// Predict 1-5 Thrill Match, 1-5 Scare Match, Overall Match (1-5), and Brave Nudge status
function predictRide(ride, profile) {
  const entry = state.rides[ride.id] || {};

  // Adjust expected perceived intensity slightly by Benny's personal rating bias
  const expectedThrill = clamp(ride.thrillBase + profile.thrillBias * 0.4, 1, 5);
  const expectedScare = clamp(ride.scareBase + profile.scareBias * 0.4, 1, 5);

  // Thrill Match (1-5): 5 means right in his sweet spot; drops if too intense or way too tame
  const thrillDiff = expectedThrill - profile.thrillComfort;
  let thrillMatch;
  if (thrillDiff <= 0) {
    thrillMatch = thrillDiff < -2.2 ? 3.5 : thrillDiff < -1.2 ? 4.3 : 5;
  } else {
    thrillMatch = clamp(5 - thrillDiff * 1.45, 1, 5);
  }

  // Spinning penalty if Benny dislikes spinning
  if (profile.spinPref === 1 && ride.tags.includes("spinning")) {
    thrillMatch = clamp(thrillMatch - 1.2, 1, 5);
  }

  // Scare Match (1-5): 5 means totally comfortable with atmosphere/lighting
  const scareDiff = expectedScare - profile.scareComfort;
  let scareMatch;
  if (scareDiff <= 0) {
    scareMatch = 5;
  } else {
    scareMatch = clamp(5 - scareDiff * 1.4, 1, 5);
  }

  // Tag affinity adjustment learned from rides Benny logged this week
  let tagBonus = 0;
  for (const tag of ride.tags || []) {
    const stat = profile.tagScores[tag];
    if (stat && stat.count >= 2) {
      tagBonus += (stat.sum / stat.count) * 0.35;
    }
  }
  tagBonus = clamp(tagBonus, -0.75, 0.75);

  // Check if Benny guessed a scare/thrill for this unridden ride
  const guessedScare = !entry.ridden ? entry.scare : null;
  const guessedTooScary = guessedScare !== null && guessedScare > ride.scareBase;

  // Brave Nudge detection:
  // Ride looks scarier than his comfort (or he guessed it's scarier than it is),
  // BUT the actual locomotion/thrill is doable for him!
  const thrillIsDoable = expectedThrill <= profile.thrillComfort + 0.6;
  const scareIsStretch =
    (scareDiff > 0.2 && scareDiff <= 2.1) || guessedTooScary;
  const isBraveNudge =
    !entry.ridden &&
    profile.nudgeWillingness > 0 &&
    thrillIsDoable &&
    scareIsStretch &&
    thrillMatch >= 3;

  // Overall 1-5 Match
  let overallRaw = thrillMatch * 0.55 + scareMatch * 0.45 + tagBonus;
  if (isBraveNudge && profile.nudgeWillingness === 2) {
    overallRaw = Math.max(overallRaw, 3.4);
  }

  const thrillScore = Math.round(clamp(thrillMatch, 1, 5));
  const scareScore = Math.round(clamp(scareMatch, 1, 5));
  const overallScore = Math.round(clamp(overallRaw, 1, 5));

  let badgeText = "⏳ Save for Later";
  let boxClass = "match-low";
  if (isBraveNudge && overallScore <= 4) {
    badgeText = "🚀 Brave Nudge!";
    boxClass = "match-nudge";
  } else if (overallScore === 5) {
    badgeText = "🔥 5/5 Slam Dunk!";
    boxClass = "match-5";
  } else if (overallScore === 4) {
    badgeText = "👍 4/5 Great Match!";
    boxClass = "match-4";
  } else if (overallScore === 3) {
    badgeText = "🤔 3/5 Maybe Try";
    boxClass = "match-low";
  }

  return {
    thrillScore,
    scareScore,
    overallScore,
    isBraveNudge,
    guessedTooScary,
    badgeText,
    boxClass
  };
}

// RENDERING
function renderAll() {
  const profile = computeBennyProfile();
  renderStatsBar(profile);
  renderQuizControls();
  renderParkTabs();
  renderExplorerRides(profile);
  renderPredictionsDashboard(profile);
  renderCheatSheet(profile);
}

function renderStatsBar(profile) {
  const total = ALL_RIDES.length;
  const nudges = ALL_RIDES.filter((r) => predictRide(r, profile).isBraveNudge).length;
  const topMatches = ALL_RIDES.filter(
    (r) => !state.rides[r.id]?.ridden && predictRide(r, profile).overallScore >= 4
  ).length;

  document.getElementById("stats-bar").innerHTML = `
    <div class="stat-box">
      <div class="stat-label">Rides Ridden</div>
      <div class="stat-value">${profile.riddenCount} <span style="font-size:0.85rem;font-weight:500;">/ ${total}</span></div>
      <div class="stat-sub">Across 7 parks</div>
    </div>
    <div class="stat-box">
      <div class="stat-label">⚡ Thrill Sweet Spot</div>
      <div class="stat-value">${profile.thrillComfort.toFixed(1)} / 5</div>
      <div class="stat-sub">Locomotion comfort</div>
    </div>
    <div class="stat-box">
      <div class="stat-label">👻 Scare Comfort</div>
      <div class="stat-value">${profile.scareComfort.toFixed(1)} / 5</div>
      <div class="stat-sub">Lighting &amp; theming</div>
    </div>
    <div class="stat-box">
      <div class="stat-label">🚀 Brave Nudges</div>
      <div class="stat-value">${nudges}</div>
      <div class="stat-sub">${topMatches} top 4–5/5 matches</div>
    </div>
  `;
}

function renderQuizControls() {
  const body = document.getElementById("calibration-body");
  const btn = document.getElementById("calibration-collapse-btn");
  if (state.ui.quizCollapsed) {
    body.classList.add("collapsed");
    btn.textContent = "Show Quiz";
  } else {
    body.classList.remove("collapsed");
    btn.textContent = "Hide Quiz";
  }

  document.querySelectorAll(".pill-scale").forEach((group) => {
    const key = group.dataset.quiz;
    const current = state.quiz[key];
    group.querySelectorAll("button").forEach((b) => {
      b.classList.toggle("active", Number(b.dataset.val) === current);
    });
  });
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

  // If searching across all parks, show matching parks; otherwise show active park
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
        if (statusFilter === "top-match" && (entry.ridden || pred.overallScore < 4)) return false;

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
  const entry = state.rides[ride.id] || { ridden: false, thrill: null, scare: null, enjoy: null };
  const pred = predictRide(ride, profile);

  const cardClasses = [
    "ride-card",
    entry.ridden ? "is-ridden" : "",
    pred.isBraveNudge ? "is-nudge" : ""
  ]
    .filter(Boolean)
    .join(" ");

  const thrillLabel = entry.ridden ? "Benny's Thrill Rating (1–5)" : "Benny's Thrill Guess (optional)";
  const scareLabel = entry.ridden ? "Benny's Scare Rating (1–5)" : "Benny's Scare Guess (optional)";

  return `
    <article class="${cardClasses}" data-ride-id="${ride.id}">
      <div class="ride-top">
        <div>
          <h4 class="ride-name">${ride.name}</h4>
          <div class="ride-meta">
            <span class="meta-pill">📏 ${ride.height}</span>
            <span class="meta-pill">⚡ Guide: ${ride.thrillBase}/5</span>
            <span class="meta-pill">👻 Guide: ${ride.scareBase}/5</span>
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
        <div class="enjoy-row">
          <button type="button" class="enjoy-btn ${entry.enjoy === "love" ? "active-love" : ""}" data-action="set-enjoy" data-val="love">😍 Loved It</button>
          <button type="button" class="enjoy-btn ${entry.enjoy === "ok" ? "active-ok" : ""}" data-action="set-enjoy" data-val="ok">😐 It Was Okay</button>
          <button type="button" class="enjoy-btn ${entry.enjoy === "nope" ? "active-nope" : ""}" data-action="set-enjoy" data-val="nope">😬 Too Much</button>
        </div>
      `
          : ""
      }

      <div class="rating-group">
        <div class="rating-box thrill-box">
          <div class="rating-box-header">
            <span>⚡ ${thrillLabel}</span>
            <span>${entry.thrill ? `${entry.thrill}/5` : "—"}</span>
          </div>
          <p class="rating-desc">${ride.thrillDesc}</p>
          <div class="scale-1-5">
            ${[1, 2, 3, 4, 5]
              .map(
                (n) => `
              <button type="button" class="scale-btn ${entry.thrill === n ? "active" : ""}" data-action="set-thrill" data-val="${n}">${n}</button>
            `
              )
              .join("")}
          </div>
        </div>

        <div class="rating-box scare-box">
          <div class="rating-box-header">
            <span>👻 ${scareLabel}</span>
            <span>${entry.scare ? `${entry.scare}/5` : "—"}</span>
          </div>
          <p class="rating-desc">${ride.scareDesc}</p>
          <div class="scale-1-5">
            ${[1, 2, 3, 4, 5]
              .map(
                (n) => `
              <button type="button" class="scale-btn ${entry.scare === n ? "active" : ""}" data-action="set-scare" data-val="${n}">${n}</button>
            `
              )
              .join("")}
          </div>
        </div>
      </div>

      ${
        !entry.ridden
          ? `
        <div class="prediction-box ${pred.boxClass}">
          <div class="prediction-header">
            <strong>1–5 Prediction</strong>
            <span class="pred-badge">${pred.badgeText}</span>
          </div>
          <div class="pred-scores">
            <span>⚡ Thrill Match: ${pred.thrillScore}/5</span>
            <span>👻 Scare Match: ${pred.scareScore}/5</span>
            <span>🎯 Overall: ${pred.overallScore}/5</span>
          </div>
          <p class="nudge-tip">
            ${
              pred.guessedTooScary
                ? `<strong>Good news!</strong> You guessed ${entry.scare}/5 scare, but it's really ~${ride.scareBase}/5. `
                : ""
            }${ride.nudgeTip}
          </p>
        </div>
      `
          : ""
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
    .filter((x) => !x.pred.isBraveNudge && x.pred.overallScore >= 4)
    .sort((a, b) => b.pred.overallScore - a.pred.overallScore);

  const thrillPct = (profile.thrillComfort / 5) * 100;
  const scarePct = (profile.scareComfort / 5) * 100;

  container.innerHTML = `
    <div class="dashboard-grid">
      <div class="dash-card">
        <h3>⚡ Benny's Thrill Sweet Spot</h3>
        <div style="font-size:1.6rem;font-weight:800;color:var(--thrill);">${profile.thrillComfort.toFixed(1)} / 5</div>
        <div class="meter-bar"><div class="meter-fill" style="width:${thrillPct}%;background:var(--thrill);"></div></div>
        <p style="font-size:0.86rem;color:var(--text-muted);margin:0;">
          Measures locomotion comfort (speed, drops, launches, loops). Learned from your quiz + ${profile.riddenCount} ridden rides.
        </p>
      </div>
      <div class="dash-card">
        <h3>👻 Benny's Scare Comfort</h3>
        <div style="font-size:1.6rem;font-weight:800;color:var(--scare);">${profile.scareComfort.toFixed(1)} / 5</div>
        <div class="meter-bar"><div class="meter-fill" style="width:${scarePct}%;background:var(--scare);"></div></div>
        <p style="font-size:0.86rem;color:var(--text-muted);margin:0;">
          Measures comfort with dark rooms, spooky set dressings, monsters, and loud lighting effects.
        </p>
      </div>
      <div class="dash-card">
        <h3>🚀 Brave Nudge Strategy</h3>
        <div style="font-size:1.6rem;font-weight:800;color:var(--nudge);">${nudgeRides.length} Rides</div>
        <p style="font-size:0.86rem;color:var(--text-muted);margin:6px 0 0;">
          These rides <strong>look</strong> spooky or intense from the outside, but the actual ride motion (Thrill) is totally in Benny's wheelhouse!
        </p>
      </div>
    </div>

    <h2 class="section-heading">🚀 Brave Nudge Zone — Rides Worth Pushing a Little For!</h2>
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
                  <span>⚡ Thrill Match: ${pred.thrillScore}/5</span>
                  <span>👻 Scare Match: ${pred.scareScore}/5</span>
                </div>
                <p style="font-size:0.83rem;margin:0;color:var(--text-muted);">
                  <strong>Motion:</strong> ${ride.thrillDesc}<br/>
                  <strong>Sets/Lighting:</strong> ${ride.scareDesc}
                </p>
                <p class="nudge-tip" style="background:var(--nudge-bg);padding:8px 10px;border-radius:8px;border:none;">
                  💡 <strong>Why Benny can handle this:</strong> ${ride.nudgeTip}
                </p>
              </div>
            `
              )
              .join("")}
          </div>`
        : `<div class="dash-card"><p style="margin:0;color:var(--text-muted);">No Brave Nudge rides right now (either Benny already loves spooky rides, or "Keep It Safe" is selected in the quiz!).</p></div>`
    }

    <h2 class="section-heading">🌟 Top Predicted Rides (4–5 / 5 Match)</h2>
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
            <span class="pred-badge">${pred.overallScore}/5</span>
          </div>
          <div class="pred-scores">
            <span>⚡ Thrill: ${pred.thrillScore}/5</span>
            <span>👻 Scare: ${pred.scareScore}/5</span>
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
        const status = entry.ridden
          ? `✓ Ridden (${entry.enjoy === "love" ? "😍 Loved" : entry.enjoy === "ok" ? "😐 Okay" : entry.enjoy === "nope" ? "😬 Too Much" : "Rated"})`
          : pred.badgeText;

        rows.push(`
          <tr>
            <td><strong>${ride.name}</strong></td>
            <td>${land.name}</td>
            <td>${ride.height}</td>
            <td>${entry.ridden ? (entry.thrill ?? "—") : `${pred.thrillScore}/5`}</td>
            <td>${entry.ridden ? (entry.scare ?? "—") : `${pred.scareScore}/5`}</td>
            <td>${entry.ridden ? "—" : `<strong>${pred.overallScore}/5</strong>`}</td>
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
              <th>⚡ Thrill</th>
              <th>👻 Scare</th>
              <th>🎯 Match</th>
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
      <button type="button" class="btn-primary" id="btn-print">🖨️ Print Park Cheat Sheet</button>
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
  // Collapse calibration quiz
  if (e.target.closest("#calibration-toggle")) {
    state.ui.quizCollapsed = !state.ui.quizCollapsed;
    saveState();
    renderQuizControls();
    return;
  }

  // Calibration quiz pills
  const quizBtn = e.target.closest(".pill-scale button");
  if (quizBtn) {
    const key = quizBtn.parentElement.dataset.quiz;
    state.quiz[key] = Number(quizBtn.dataset.val);
    saveState();
    renderAll();
    return;
  }

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
    const current = state.rides[rideId] || { ridden: false, thrill: null, scare: null, enjoy: null };
    const action = actionBtn.dataset.action;
    const val = actionBtn.dataset.val;

    const prevProfile = computeBennyProfile();

    if (action === "set-ridden") {
      current.ridden = val === "true";
    } else if (action === "set-thrill") {
      const n = Number(val);
      current.thrill = current.thrill === n ? null : n;
    } else if (action === "set-scare") {
      const n = Number(val);
      current.scare = current.scare === n ? null : n;
    } else if (action === "set-enjoy") {
      current.enjoy = current.enjoy === val ? null : val;
    }

    state.rides[rideId] = current;
    saveState();
    renderAll();

    if (current.ridden) {
      const nextProfile = computeBennyProfile();
      const tDelta = nextProfile.thrillComfort - prevProfile.thrillComfort;
      const sDelta = nextProfile.scareComfort - prevProfile.scareComfort;
      if (Math.abs(tDelta) >= 0.05 || Math.abs(sDelta) >= 0.05) {
        showToast(
          `Predictions updated! ⚡ Thrill: ${nextProfile.thrillComfort.toFixed(1)}/5 · 👻 Scare: ${nextProfile.scareComfort.toFixed(1)}/5`
        );
      } else if (action === "set-enjoy" || action === "set-ridden") {
        showToast("Saved! Predictions recalculated across all 7 parks.");
      }
    }
    return;
  }

  // Cheat sheet buttons
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
    if (confirm("Reset all of Benny's ride ratings and quiz answers?")) {
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
          quiz: { ...DEFAULT_STATE.quiz, ...(imported.quiz || {}) },
          rides: imported.rides || {},
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

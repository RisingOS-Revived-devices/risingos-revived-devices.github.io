/**
* Project: RisingOS Revived Official Website
* Updated: 28-Feb-2025
* Author: @skwel24
*/

const CHART_COLORS = [
  "#28a745",
  "#7dff7d",
  "#20c997",
  "#198754",
  "#6ee7b7",
  "#4ade80",
  "#34d399",
  "#10b981",
];

let pendingChartData = null;

document.addEventListener("DOMContentLoaded", function() {
    var carousel = document.querySelector("#carouselExampleIndicators");
    if (carousel) {
      var bsCarousel = new bootstrap.Carousel(carousel);
    }
});

document.addEventListener("DOMContentLoaded", async function () {
    const teamContainer = document.getElementById("team-container");
    const maintainersContainer = document.getElementById("maintainers-container");
    const coreCount = document.getElementById("core-team-count");
    const maintainerCount = document.getElementById("maintainer-count");
    if (!teamContainer && !maintainersContainer) return;

    const escapeHtml = (value = "") => String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character]));
    const safeUrl = (value) => {
      try { const url = new URL(value, window.location.origin); return ["http:", "https:"].includes(url.protocol) ? url.href : ""; } catch { return ""; }
    };
    const pluralize = (count, label) => `${count} ${label}${count === 1 ? "" : "s"}`;
    const socialLink = (href, icon, label) => href ? `<a href="${escapeHtml(href)}" class="team-social-link" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(label)}"><i class="bi bi-${icon}"></i></a>` : "";

    const renderCoreMember = (member) => {
      const name = escapeHtml(member.name || "RisingOS contributor");
      const avatar = safeUrl(member.avatar) || "assets/img/default-profile.png";
      const github = safeUrl(member.github);
      const username = String(member.telegram_username || "").replace(/^@+/, "");
      const telegram = username ? `https://t.me/${encodeURIComponent(username)}` : "";
      const socials = [socialLink(github, "github", `${member.name} on GitHub`), socialLink(telegram, "telegram", `${member.name} on Telegram`)].join("");
      return `<article class="team-card" data-aos="fade-up"><div class="team-avatar-wrap"><img src="${escapeHtml(avatar)}" class="team-avatar" width="88" height="88" alt="${name}" loading="lazy"></div><h3 class="team-name">${name}</h3><p class="team-role">${escapeHtml(member.position || "Core Team")}</p><div class="team-socials">${socials || `<span class="team-empty-state">No links listed</span>`}</div></article>`;
    };
    const renderMaintainer = (maintainer) => {
      const name = escapeHtml(maintainer.name);
      const avatar = safeUrl(maintainer.avatar) || "assets/img/default-profile.png";
      const devices = maintainer.devices.sort((a, b) => a.localeCompare(b));
      const deviceLabel = devices.length > 1 ? `${devices.length} devices` : devices[0] || "Official device";
      const telegram = safeUrl(maintainer.telegram);
      return `<article class="team-card team-card--maintainer" data-aos="fade-up"><div class="team-avatar-wrap"><img src="${escapeHtml(avatar)}" class="team-avatar" width="72" height="72" alt="${name}" loading="lazy"></div><div class="team-card-copy"><h3 class="team-name">${name}</h3><p class="team-role">Device Maintainer</p><p class="team-devices" title="${escapeHtml(devices.join(", "))}"><i class="bi bi-phone" aria-hidden="true"></i>${escapeHtml(deviceLabel)}</p></div><div class="team-socials">${socialLink(telegram, "telegram", `${maintainer.name} on Telegram`) || `<span class="team-empty-state">Official maintainer</span>`}</div></article>`;
    };

    try {
      const [teamResult, devicesResult] = await Promise.allSettled([
        fetch("core-team.json").then((response) => {
          if (!response.ok) throw new Error("Unable to load core team");
          return response.json();
        }),
        fetch("devices.json").then((response) => {
          if (!response.ok) throw new Error("Unable to load maintainers");
          return response.json();
        }),
      ]);

      if (teamContainer) {
        if (teamResult.status !== "fulfilled" || !Array.isArray(teamResult.value)) throw new Error("Unable to load core team");
        teamContainer.innerHTML = teamResult.value.map(renderCoreMember).join("");
        if (coreCount) coreCount.textContent = pluralize(teamResult.value.length, "member");
      }

      if (!maintainersContainer) return;
      if (devicesResult.status !== "fulfilled" || !Array.isArray(devicesResult.value)) throw new Error("Unable to load maintainers");
      const devicesData = devicesResult.value;
      const maintainers = new Map();
      Object.values(devicesData).forEach((device) => {
        if (!device?.maintainer) return;
        const key = device.maintainer.trim().toLowerCase();
        const existing = maintainers.get(key) || { name: device.maintainer.trim(), avatar: device.maintainer_avatar, telegram: device.telegram, devices: [] };
        if (device.device && !existing.devices.includes(device.device)) existing.devices.push(device.device);
        maintainers.set(key, existing);
      });
      const maintainerData = [...maintainers.values()].sort((a, b) => a.name.localeCompare(b.name));
      maintainersContainer.innerHTML = maintainerData.map(renderMaintainer).join("") || `<div class="team-error">No maintainers are listed yet.</div>`;
      if (maintainerCount) maintainerCount.textContent = pluralize(maintainerData.length, "maintainer");
    } catch (error) {
      console.error("Error fetching team data:", error);
      if (teamContainer && teamContainer.querySelector(".team-loading")) teamContainer.innerHTML = `<div class="team-error">Unable to load core team members right now.</div>`;
      if (maintainersContainer && maintainersContainer.querySelector(".team-loading")) maintainersContainer.innerHTML = `<div class="team-error">Unable to load maintainers right now.</div>`;
    }
});

function initScreenshotShowcase() {
  const showcase = document.getElementById("screenshotShowcase");
  const heroImage = document.getElementById("screenshotHeroImage");
  const heroLabel = document.getElementById("screenshotHeroLabel");
  const heroZoom = document.getElementById("screenshotHeroZoom");
  const heroFrame = showcase?.querySelector(".screenshot-hero-frame");
  const stage = showcase?.querySelector(".screenshot-stage");
  const tiles = showcase ? showcase.querySelectorAll(".screenshot-tile") : [];

  if (!showcase || !heroImage || tiles.length === 0) return;

  let activeIndex = 0;
  let isAnimating = false;

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          showcase.classList.add("is-visible");
          revealObserver.disconnect();
        }
      });
    },
    { threshold: 0.18 }
  );
  revealObserver.observe(showcase);

  function selectScreenshot(index) {
    if (isAnimating || index === activeIndex) return;

    const tile = tiles[index];
    if (!tile) return;

    isAnimating = true;
    heroImage.classList.remove("is-visible");

    window.setTimeout(() => {
      const src = tile.dataset.src;
      const label =
        tile.dataset.label ||
        tile.querySelector(".screenshot-tile-label")?.textContent ||
        "Screenshot";

      heroImage.src = src;
      heroImage.alt = `RisingOS Revived – ${label}`;

      if (heroLabel) heroLabel.textContent = label;
      if (heroZoom) {
        heroZoom.href = src;
        heroZoom.setAttribute("aria-label", `View ${label} full size`);
      }

      tiles.forEach((item, itemIndex) => {
        item.classList.toggle("is-active", itemIndex === index);
      });

      activeIndex = index;
      heroImage.classList.add("is-visible");
      isAnimating = false;
    }, 220);
  }

  tiles.forEach((tile, index) => {
    tile.addEventListener("click", () => selectScreenshot(index));
  });

  if (heroFrame && stage && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    stage.addEventListener("mousemove", (event) => {
      const rect = heroFrame.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      heroFrame.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
    });

    stage.addEventListener("mouseleave", () => {
      heroFrame.style.transform = "";
    });
  }
}

function initLatestBanner() {
  const showcase = document.querySelector(".latest-banner-showcase");
  const image = showcase?.querySelector(".latest-banner-image");

  if (!showcase || !image || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    return;
  }

  showcase.addEventListener("mouseenter", () => {
    image.style.animationPlayState = "paused";
  });

  showcase.addEventListener("mousemove", (event) => {
    const rect = showcase.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    image.style.transform = `scale(1.04) translate(${x * -12}px, ${y * -8}px)`;
  });

  showcase.addEventListener("mouseleave", () => {
    image.style.transform = "";
    image.style.animationPlayState = "";
  });
}

function initHeroScrollEffects() {
  const hero = document.getElementById("hero");
  if (!hero) return;

  let scrollProgress = 0;
  let scrollRaf = null;

  function updateScrollProgress() {
    const rect = hero.getBoundingClientRect();
    const next = Math.min(1, Math.max(0, -rect.top / Math.max(rect.height * 0.9, 1)));
    if (Math.abs(next - scrollProgress) < 0.002) return;
    scrollProgress = next;
    hero.style.setProperty("--hero-scroll", scrollProgress.toFixed(3));
  }

  function scheduleScrollUpdate() {
    if (scrollRaf) return;
    scrollRaf = requestAnimationFrame(() => {
      scrollRaf = null;
      updateScrollProgress();
    });
  }

  window.addEventListener("scroll", scheduleScrollUpdate, { passive: true });
  window.addEventListener("resize", scheduleScrollUpdate, { passive: true });
  scheduleScrollUpdate();
}

function initHeroTitleAnimation() {
  const heroTitle = document.querySelector(".hero-title");
  const heroContent = document.querySelector(".hero-content");
  const tagline = document.querySelector(".hero-tagline");
  const downloadBtn = document.querySelector(".hero-download-btn");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!heroTitle) return;

  if (reducedMotion) {
    heroTitle.classList.add("hero-title--ready");
    heroContent?.classList.add("hero-content--ready");
    tagline?.classList.add("hero-tagline--visible");
    return;
  }

  requestAnimationFrame(() => {
    heroTitle.classList.add("hero-title--ready");
    heroContent?.classList.add("hero-content--ready");
    if (tagline) {
      tagline.style.animationDelay = "1.2s";
      tagline.classList.add("hero-tagline--visible");
    }
    if (downloadBtn) {
      downloadBtn.style.animationDelay = "1.55s";
    }
  });
}

function initOffscreenAnimationPause() {
  const targets = document.querySelectorAll(".latest-banner-showcase, .screenshot-stage");

  if (targets.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("is-offscreen", !entry.isIntersecting);
      });
    },
    { rootMargin: "80px 0px", threshold: 0 }
  );

  targets.forEach((target) => observer.observe(target));
}

function chartTheme() {
  return {
    font: { family: "'Poppins', sans-serif", size: 11 },
    tick: "rgba(255, 255, 255, 0.55)",
    grid: "rgba(255, 255, 255, 0.08)",
    tooltipBg: "rgba(12, 12, 12, 0.92)",
    tooltipBorder: "rgba(40, 167, 69, 0.45)",
  };
}

function formatMonthLabel(value) {
  const date = new Date(String(value).replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: "short", year: "numeric" });
}

async function fetchVersionStats(version, startDate, endDate) {
  const url =
    `https://sourceforge.net/projects/risingos-revived/files/${version}/stats/json` +
    `?start_date=${startDate}&end_date=${endDate}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${version} stats (${response.status})`);
  }
  return response.json();
}

function destroyChart(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;
  const existing = typeof Chart !== "undefined" ? Chart.getChart(canvas) : null;
  if (existing) existing.destroy();
  return canvas;
}

function baseChartOptions(theme) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: theme.tick,
          font: theme.font,
          boxWidth: 12,
          padding: 14,
        },
      },
      tooltip: {
        backgroundColor: theme.tooltipBg,
        borderColor: theme.tooltipBorder,
        borderWidth: 1,
        titleColor: "#fff",
        bodyColor: "rgba(255, 255, 255, 0.85)",
        padding: 10,
      },
    },
  };
}

function renderCharts(data) {
  if (typeof Chart === "undefined" || !data?.downloads) return;

  const theme = chartTheme();
  const baseOptions = baseChartOptions(theme);

  const lineCanvas = destroyChart("lineChart");
  const pieCanvas = destroyChart("pieChart");
  const barCanvas = destroyChart("barChart");
  if (!lineCanvas || !pieCanvas || !barCanvas) return;

  const lineCtx = lineCanvas.getContext("2d");
  const lineGradient = lineCtx.createLinearGradient(0, 0, 0, 300);
  lineGradient.addColorStop(0, "rgba(40, 167, 69, 0.35)");
  lineGradient.addColorStop(1, "rgba(40, 167, 69, 0)");

  new Chart(lineCtx, {
    type: "line",
    data: {
      labels: data.downloads.map((entry) => formatMonthLabel(entry[0])),
      datasets: [{
        label: "Downloads",
        data: data.downloads.map((entry) => entry[1]),
        borderColor: "#7dff7d",
        backgroundColor: lineGradient,
        pointBackgroundColor: "#28a745",
        pointBorderColor: "#fff",
        pointRadius: 3,
        pointHoverRadius: 5,
        borderWidth: 2,
        fill: true,
        tension: 0.35,
      }],
    },
    options: {
      ...baseOptions,
      scales: {
        x: {
          ticks: { color: theme.tick, font: theme.font, maxRotation: 0, autoSkip: true },
          grid: { color: theme.grid },
          border: { display: false },
        },
        y: {
          beginAtZero: true,
          ticks: { color: theme.tick, font: theme.font, precision: 0 },
          grid: { color: theme.grid },
          border: { display: false },
        },
      },
    },
  });

  const osDownloads = Object.fromEntries(data.oses || []);
  new Chart(pieCanvas.getContext("2d"), {
    type: "doughnut",
    data: {
      labels: Object.keys(osDownloads),
      datasets: [{
        data: Object.values(osDownloads),
        backgroundColor: CHART_COLORS,
        borderColor: "rgba(0, 0, 0, 0.35)",
        borderWidth: 2,
        hoverOffset: 6,
      }],
    },
    options: {
      ...baseOptions,
      cutout: "62%",
      plugins: {
        ...baseOptions.plugins,
        legend: {
          ...baseOptions.plugins.legend,
          position: "bottom",
        },
      },
    },
  });

  const countryEntries = Object.entries(Object.fromEntries(data.countries || []))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
  const countryLabels = countryEntries.map(([country]) => country);
  const countryValues = countryEntries.map(([, count]) => count);

  new Chart(barCanvas.getContext("2d"), {
    type: "bar",
    data: {
      labels: countryLabels,
      datasets: [{
        label: "Downloads",
        data: countryValues,
        backgroundColor: countryValues.map((_, index) => CHART_COLORS[index % CHART_COLORS.length]),
        borderRadius: 8,
        borderSkipped: false,
      }],
    },
    options: {
      ...baseOptions,
      indexAxis: "y",
      plugins: {
        ...baseOptions.plugins,
        legend: { display: false },
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: { color: theme.tick, font: theme.font, precision: 0 },
          grid: { color: theme.grid },
          border: { display: false },
        },
        y: {
          ticks: { color: theme.tick, font: theme.font },
          grid: { display: false },
          border: { display: false },
        },
      },
    },
  });
}

function renderDownloadStats(totalsByVersion, overallTotal) {
  const container = document.getElementById("downloadStatsContent");
  if (!container) return;

  const versions = ["6.x", "7.x", "8.x", "9.x"];
  const versionCards = versions
    .map((version) => {
      const count = totalsByVersion[version] ?? 0;
      const share = overallTotal > 0 ? (count / overallTotal) * 100 : 0;
      const isLatest = version === "9.x";

      return `
        <article class="download-stats-card${isLatest ? " is-latest" : ""}">
          <div class="download-stats-card-top">
            <span class="download-stats-version">${version}</span>
            ${isLatest ? `<span class="download-stats-badge">Latest</span>` : ""}
          </div>
          <span class="download-stats-card-value">${count.toLocaleString()}</span>
          <div class="download-stats-card-share" aria-hidden="true">
            <span class="download-stats-card-share-bar" style="width: ${share.toFixed(1)}%;"></span>
          </div>
          <span class="download-stats-card-percent">${share.toFixed(1)}% of overall</span>
        </article>
      `;
    })
    .join("");

  container.innerHTML = `
    <div class="download-stats-overall">
      <span class="download-stats-overall-label">Overall Downloads</span>
      <span class="download-stats-overall-value">${overallTotal.toLocaleString()}</span>
    </div>
    <div class="download-stats-grid">
      ${versionCards}
    </div>
  `;
}

function showDownloadStatsError(message) {
  const container = document.getElementById("downloadStatsContent");
  if (!container) return;
  container.innerHTML = `<div class="download-stats-error">${message}</div>`;
}

function graphsAreOpen() {
  return document.getElementById("graphCollapse")?.classList.contains("show");
}

function renderChartsIfVisible() {
  if (pendingChartData && graphsAreOpen()) {
    requestAnimationFrame(() => renderCharts(pendingChartData));
  }
}

function initGraphToggle() {
  const graphCollapse = document.getElementById("graphCollapse");
  const toggleButton = document.getElementById("toggleGraphs");
  if (!graphCollapse || !toggleButton) return;

  const toggleLabel = toggleButton.querySelector("span");

  toggleButton.addEventListener("click", () => {
    const isOpen = !graphCollapse.classList.contains("show");
    graphCollapse.classList.toggle("show", isOpen);
    graphCollapse.setAttribute("aria-hidden", String(!isOpen));
    toggleButton.setAttribute("aria-expanded", String(isOpen));

    if (toggleLabel) {
      toggleLabel.textContent = isOpen ? "Hide 9.x Analytics" : "Show 9.x Analytics";
    }

    if (isOpen) {
      renderChartsIfVisible();
    }
  });
}

async function fetchData() {
  const startDate = "2025-02-01";
  const endDate = new Date().toISOString().split("T")[0];
  const versions = ["6.x", "7.x", "8.x", "9.x"];

  try {
    const results = await Promise.allSettled(
      versions.map((version) => fetchVersionStats(version, startDate, endDate))
    );

    const totalsByVersion = {};
    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        totalsByVersion[versions[index]] = result.value.total ?? 0;
      } else {
        console.error(`Failed to load ${versions[index]} stats:`, result.reason);
        totalsByVersion[versions[index]] = 0;
      }
    });

    const overallTotal = Object.values(totalsByVersion).reduce((sum, count) => sum + count, 0);
    const allFailed = results.every((result) => result.status === "rejected");

    if (allFailed) {
      showDownloadStatsError("Unable to load download statistics right now.");
    } else {
      renderDownloadStats(totalsByVersion, overallTotal);
    }

    const nineXResult = results[versions.indexOf("9.x")];
    if (nineXResult?.status === "fulfilled") {
      pendingChartData = nineXResult.value;
      renderChartsIfVisible();
    }
  } catch (error) {
    console.error("Error fetching statistics:", error);
    showDownloadStatsError("Unable to load download statistics right now.");
  }
}

function initWhatsNewModal() {
  const whatsNewLink = document.getElementById("whats-new");
  const modal = document.getElementById("whats-new-modal");
  const closeBtn = document.getElementById("close-modal");
  const content = document.getElementById("changelog-content");
  const changelogUrl =
    "https://raw.githubusercontent.com/RisingOS-Revived/risingOS_changelogs/refs/heads/fifteen/README.md";

  if (!whatsNewLink || !modal || !closeBtn || !content) return;

  let isLoaded = false;
  let isLoading = false;

  function openModal() {
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("whats-new-open");

    if (!isLoaded && !isLoading) {
      loadChangelog();
    }
  }

  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("whats-new-open");
  }

  function setLoadingState() {
    content.innerHTML = `
      <div class="whats-new-modal__loading">
        <span class="whats-new-modal__spinner" aria-hidden="true"></span>
        <p>Loading changelogs…</p>
      </div>
    `;
  }

  function setErrorState(message) {
    content.innerHTML = `<div class="whats-new-modal__error">${message}</div>`;
  }

  async function loadChangelog() {
    isLoading = true;
    setLoadingState();

    try {
      const response = await fetch(changelogUrl);
      if (!response.ok) throw new Error("Failed to fetch changelogs");
      const text = await response.text();
      content.innerHTML = formatChangelogMarkdown(text);
      isLoaded = true;
    } catch (error) {
      console.error("Error fetching changelogs:", error);
      setErrorState("Unable to load changelogs right now. Please try again later.");
    } finally {
      isLoading = false;
    }
  }

  whatsNewLink.addEventListener("click", (event) => {
    event.preventDefault();
    openModal();
  });

  closeBtn.addEventListener("click", closeModal);
  modal.querySelectorAll("[data-whats-new-close]").forEach((el) => {
    el.addEventListener("click", closeModal);
  });

  modal.addEventListener("click", (event) => {
    if (event.target === modal || event.target.classList.contains("whats-new-modal__backdrop")) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      closeModal();
    }
  });
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function stripEmojis(text) {
  return text
    .replace(/[\u{1F000}-\u{1FAFF}]/gu, "")
    .replace(/[\u{2600}-\u{27BF}]/gu, "")
    .replace(/\uFE0F/g, "")
    .replace(/\u200D/g, "");
}

function cleanChangelogText(text) {
  return stripEmojis(text)
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`(.*?)`/g, "$1")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/#{1,6}/g, "")
    .replace(/^[-*–—]\s+/gm, "")
    .replace(/-{3,}/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function isSkippableChangelogLine(line) {
  const trimmed = line.trim();
  if (!trimmed) return true;
  if (/^-{3,}\s*$/.test(trimmed)) return true;
  if (/^#{1,6}\s*$/.test(trimmed)) return true;
  return false;
}

function parseChangelogSections(raw) {
  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  const sections = [];
  let current = null;

  lines.forEach((rawLine) => {
    const line = rawLine.trim();
    if (isSkippableChangelogLine(line)) return;

    if (/^##\s+/.test(line)) {
      if (current) sections.push(current);
      current = {
        title: cleanChangelogText(line.replace(/^##\s+/, "")),
        lines: [],
      };
      return;
    }

    if (/^#\s+/.test(line)) {
      const intro = cleanChangelogText(line.replace(/^#\s+/, ""));
      if (intro) {
        if (!current) {
          current = { title: "Changelog", lines: [] };
        }
        current.lines.push(intro);
      }
      return;
    }

    if (!current) {
      current = { title: "Changelog", lines: [] };
    }

    const subsection = line.match(/^#{3,6}\s+(.*)$/);
    if (subsection) {
      const text = cleanChangelogText(subsection[1]);
      if (text) current.lines.push(text);
      return;
    }

    const listItem = line.match(/^[-*–—]\s+(.*)$/);
    if (listItem) {
      const text = cleanChangelogText(listItem[1]);
      if (text) current.lines.push(text);
      return;
    }

    const text = cleanChangelogText(line);
    if (text) current.lines.push(text);
  });

  if (current) sections.push(current);

  return sections
    .map((section) => ({
      title: section.title,
      lines: section.lines.filter(Boolean),
    }))
    .filter((section) => section.title || section.lines.length > 0);
}

function formatChangelogMarkdown(raw) {
  const sections = parseChangelogSections(raw);

  if (sections.length === 0) {
    const fallback = cleanChangelogText(raw);
    if (!fallback) {
      return `<div class="whats-new-entry"><p>No changelog content available.</p></div>`;
    }
    return `<div class="whats-new-entry"><p>${escapeHtml(fallback)}</p></div>`;
  }

  return sections
    .map((section, index) => {
      const body = section.lines
        .map((line) => `<p>${escapeHtml(line)}</p>`)
        .join("");

      return `
        <article class="whats-new-entry" style="animation-delay: ${Math.min(index * 0.06, 0.36)}s">
          <div class="whats-new-entry__badge">Update</div>
          <h3 class="whats-new-entry__title">${escapeHtml(section.title)}</h3>
          <div class="whats-new-entry__body">${body}</div>
        </article>
      `;
    })
    .join("");
}

document.addEventListener("DOMContentLoaded", function () {
  initHeroScrollEffects();
  initHeroTitleAnimation();
  initOffscreenAnimationPause();
  initScreenshotShowcase();
  initLatestBanner();
  initGraphToggle();
  initWhatsNewModal();
  fetchData();
});

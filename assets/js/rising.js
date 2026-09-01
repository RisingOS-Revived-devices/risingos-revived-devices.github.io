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
    if (!teamContainer) return;

    try {
      const response = await fetch("https://raw.githubusercontent.com/RisingOS-Revived-devices/RisingOS_Web/main/core-team.json");
      const teamData = await response.json();

      teamContainer.innerHTML = teamData.map((member) => {
        const socialLinks = [
          member.github
            ? `<a href="${member.github}" class="team-social-link" target="_blank" rel="noopener noreferrer" aria-label="${member.name} on GitHub"><i class="bi bi-github"></i></a>`
            : "",
          member.telegram_username
            ? `<a href="https://t.me/${member.telegram_username.replace("@", "")}" class="team-social-link" target="_blank" rel="noopener noreferrer" aria-label="${member.name} on Telegram"><i class="bi bi-telegram"></i></a>`
            : "",
        ].join("");

        return `
          <article class="team-card" data-aos="fade-up">
            <div class="team-avatar-wrap">
              <img src="${member.avatar}" class="team-avatar" width="88" height="88" alt="${member.name}">
            </div>
            <h3 class="team-name">${member.name}</h3>
            <p class="team-role">${member.position || "Core Team"}</p>
            <div class="team-socials">${socialLinks || `<span class="team-role">No links listed</span>`}</div>
          </article>
        `;
      }).join("");
    } catch (error) {
      console.error("Error fetching team data:", error);
      teamContainer.innerHTML = `<div class="team-error">Unable to load core team members right now.</div>`;
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

document.addEventListener("DOMContentLoaded", function () {
  initScreenshotShowcase();
  initLatestBanner();
  initGraphToggle();
  fetchData();
  AOS.init();
});

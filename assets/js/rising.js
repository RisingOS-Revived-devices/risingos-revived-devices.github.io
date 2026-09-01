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

function initHeroInteractiveBackground() {
  const hero = document.getElementById("hero");
  const canvas = document.getElementById("heroInteractiveCanvas");

  if (!hero || !canvas) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const logo = new Image();
  logo.src = "assets/img/risingOS_logo.png";

  let width = 0;
  let height = 0;
  let scrollProgress = 0;
  let time = 0;
  let isVisible = true;
  let animationId = null;

  const mouse = { x: 0.5, y: 0.5, active: false };
  const logoParticles = [];
  const networkNodes = [];

  const LOGO_COUNT = 12;
  const NODE_COUNT = 26;
  const CONNECTION_DISTANCE = 120;

  function initParticles() {
    logoParticles.length = 0;
    networkNodes.length = 0;

    for (let i = 0; i < LOGO_COUNT; i += 1) {
      logoParticles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 16 + Math.random() * 26,
        speed: 0.12 + Math.random() * 0.22,
        drift: Math.random() * Math.PI * 2,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.01,
        opacity: 0.05 + Math.random() * 0.1,
        depth: 0.35 + Math.random() * 0.65,
      });
    }

    for (let i = 0; i < NODE_COUNT; i += 1) {
      networkNodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 1.5 + Math.random() * 2.5,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        depth: 0.25 + Math.random() * 0.75,
        isAndroid: Math.random() > 0.78,
      });
    }
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = hero.clientWidth;
    height = hero.clientHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    initParticles();
  }

  function updateScrollProgress() {
    const rect = hero.getBoundingClientRect();
    scrollProgress = Math.min(1, Math.max(0, -rect.top / Math.max(rect.height * 0.9, 1)));
    hero.style.setProperty("--hero-scroll", scrollProgress.toFixed(3));
  }

  function drawBackground() {
    const gradient = ctx.createRadialGradient(
      width * 0.5,
      height * (0.42 - scrollProgress * 0.12),
      0,
      width * 0.5,
      height * 0.55,
      Math.max(width, height) * 0.8
    );
    gradient.addColorStop(0, `rgba(61, 220, 132, ${0.1 - scrollProgress * 0.05})`);
    gradient.addColorStop(0.35, `rgba(40, 167, 69, ${0.08 - scrollProgress * 0.03})`);
    gradient.addColorStop(1, "#020202");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  function drawGrid() {
    const spacing = 52;
    const offsetX = scrollProgress * 48 + Math.sin(time * 0.35) * 6;
    const offsetY = scrollProgress * 90 + time * 10;

    ctx.strokeStyle = `rgba(61, 220, 132, ${0.055 - scrollProgress * 0.02})`;
    ctx.lineWidth = 1;

    for (let x = -spacing; x < width + spacing; x += spacing) {
      ctx.beginPath();
      ctx.moveTo(x + offsetX, 0);
      ctx.lineTo(x + offsetX, height);
      ctx.stroke();
    }

    for (let y = -spacing; y < height + spacing; y += spacing) {
      ctx.beginPath();
      ctx.moveTo(0, y + offsetY);
      ctx.lineTo(width, y + offsetY);
      ctx.stroke();
    }
  }

  function drawAndroidMark(x, y, size, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "#3DDC84";

    ctx.beginPath();
    ctx.arc(x, y - size * 0.15, size * 0.52, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.roundRect(x - size * 0.62, y + size * 0.18, size * 1.24, size * 0.92, size * 0.22);
    ctx.fill();

    ctx.fillStyle = "#042812";
    ctx.beginPath();
    ctx.arc(x - size * 0.18, y - size * 0.18, size * 0.07, 0, Math.PI * 2);
    ctx.arc(x + size * 0.18, y - size * 0.18, size * 0.07, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#3DDC84";
    ctx.lineWidth = size * 0.11;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x - size * 0.22, y - size * 0.52);
    ctx.lineTo(x - size * 0.36, y - size * 0.82);
    ctx.moveTo(x + size * 0.22, y - size * 0.52);
    ctx.lineTo(x + size * 0.36, y - size * 0.82);
    ctx.stroke();
    ctx.restore();
  }

  function drawCentralLogoWatermark() {
    if (!logo.complete) return;

    const scale = 1 - scrollProgress * 0.35;
    const size = Math.min(width, height) * 0.4 * scale;
    const centerX = width * 0.5 + (mouse.active ? (mouse.x - 0.5) * 20 : 0);
    const centerY = height * 0.46 + scrollProgress * 36 + (mouse.active ? (mouse.y - 0.5) * 14 : 0);

    ctx.save();
    ctx.globalAlpha = 0.035 + (1 - scrollProgress) * 0.05;
    ctx.translate(centerX, centerY);
    ctx.rotate(scrollProgress * 0.12 + Math.sin(time * 0.25) * 0.02);
    ctx.drawImage(logo, -size / 2, -size / 2, size, size);
    ctx.restore();
  }

  function updateNetworkNodes() {
    networkNodes.forEach((node) => {
      node.x += node.vx * node.depth;
      node.y += node.vy * node.depth - scrollProgress * 0.9 * node.depth;

      if (mouse.active) {
        const dx = node.x - mouse.x * width;
        const dy = node.y - mouse.y * height;
        const distance = Math.hypot(dx, dy);
        if (distance > 0 && distance < 130) {
          const force = (130 - distance) / 130;
          node.x += (dx / distance) * force * 1.4;
          node.y += (dy / distance) * force * 1.4;
        }
      }

      if (node.x < -24) node.x = width + 24;
      if (node.x > width + 24) node.x = -24;
      if (node.y < -24) node.y = height + 24;
      if (node.y > height + 24) node.y = -24;
    });
  }

  function drawNetwork() {
    for (let i = 0; i < networkNodes.length; i += 1) {
      for (let j = i + 1; j < networkNodes.length; j += 1) {
        const dx = networkNodes[i].x - networkNodes[j].x;
        const dy = networkNodes[i].y - networkNodes[j].y;
        const distance = Math.hypot(dx, dy);
        if (distance < CONNECTION_DISTANCE) {
          ctx.strokeStyle = `rgba(61, 220, 132, ${(1 - distance / CONNECTION_DISTANCE) * 0.16})`;
          ctx.beginPath();
          ctx.moveTo(networkNodes[i].x, networkNodes[i].y);
          ctx.lineTo(networkNodes[j].x, networkNodes[j].y);
          ctx.stroke();
        }
      }
    }

    networkNodes.forEach((node) => {
      if (node.isAndroid) {
        drawAndroidMark(node.x, node.y, 7 + node.depth * 5, 0.18 + node.depth * 0.22);
        return;
      }

      ctx.beginPath();
      ctx.fillStyle = `rgba(125, 255, 125, ${0.18 + node.depth * 0.28})`;
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawLogoParticles() {
    if (!logo.complete) return;

    logoParticles.forEach((particle) => {
      particle.drift += 0.0035 * particle.depth;
      particle.x += Math.cos(particle.drift) * particle.speed * particle.depth;
      particle.y += Math.sin(particle.drift) * particle.speed * particle.depth - scrollProgress * 1.1 * particle.depth;
      particle.rotation += particle.rotSpeed;

      if (particle.x < -40) particle.x = width + 40;
      if (particle.x > width + 40) particle.x = -40;
      if (particle.y < -40) particle.y = height + 40;
      if (particle.y > height + 40) particle.y = -40;

      ctx.save();
      ctx.translate(particle.x, particle.y);
      ctx.rotate(particle.rotation + scrollProgress * 0.45);
      ctx.globalAlpha = particle.opacity * (1 - scrollProgress * 0.55);
      ctx.drawImage(logo, -particle.size / 2, -particle.size / 2, particle.size, particle.size);
      ctx.restore();
    });
  }

  function drawVignette() {
    const vignette = ctx.createRadialGradient(
      width / 2,
      height / 2,
      height * 0.18,
      width / 2,
      height / 2,
      height * 0.88
    );
    vignette.addColorStop(0, "transparent");
    vignette.addColorStop(1, `rgba(0, 0, 0, ${0.42 + scrollProgress * 0.28})`);
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);
  }

  function render() {
    drawBackground();
    drawGrid();
    drawCentralLogoWatermark();
    updateNetworkNodes();
    drawNetwork();
    drawLogoParticles();
    drawVignette();
  }

  function loop() {
    if (isVisible) {
      time += 0.016;
      updateScrollProgress();
      render();
    }
    animationId = requestAnimationFrame(loop);
  }

  window.addEventListener("resize", resize);
  window.addEventListener("scroll", updateScrollProgress, { passive: true });

  hero.addEventListener("mousemove", (event) => {
    const rect = hero.getBoundingClientRect();
    mouse.x = (event.clientX - rect.left) / rect.width;
    mouse.y = (event.clientY - rect.top) / rect.height;
    mouse.active = true;
  });

  hero.addEventListener("mouseleave", () => {
    mouse.active = false;
  });

  const visibilityObserver = new IntersectionObserver(
    (entries) => {
      isVisible = entries[0]?.isIntersecting ?? true;
    },
    { threshold: 0.05 }
  );
  visibilityObserver.observe(hero);

  resize();
  updateScrollProgress();
  loop();
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
  initHeroInteractiveBackground();
  initScreenshotShowcase();
  initLatestBanner();
  initGraphToggle();
  fetchData();
  AOS.init();
});

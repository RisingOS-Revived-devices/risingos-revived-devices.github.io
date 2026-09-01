/**
 * Project: RisingOS Revived Official Website
 * Devices page
 */

const DEVICES_JSON_URL =
  "https://raw.githubusercontent.com/RisingOS-Revived-devices/RisingOS_Web/refs/heads/main/devices.json";

let groupedDevicesCache = [];
let selectedBrand = "";

function versionPrefixFrom(version) {
  const match = String(version || "").match(/^(\d+)/);
  return match ? `${match[1]}.x` : null;
}

function groupDevices(deviceData) {
  const groupedDevices = {};

  deviceData.forEach((device) => {
    if (!groupedDevices[device.codename]) {
      groupedDevices[device.codename] = {
        ...device,
        variants: [],
      };
    }

    groupedDevices[device.codename].variants.push({
      variant: device.variant,
      download: device.download,
      filesize: device.filesize,
      version: device.version,
      versionPrefix: versionPrefixFrom(device.version),
    });
  });

  return Object.values(groupedDevices);
}

function getActiveFilters() {
  return {
    search: (document.getElementById("search-input")?.value || "").toLowerCase().trim(),
    oem: selectedBrand,
  };
}

function matchesFilters(device, filters) {
  const matchesSearch =
    !filters.search ||
    device.device.toLowerCase().includes(filters.search) ||
    device.oem.toLowerCase().includes(filters.search) ||
    device.maintainer.toLowerCase().includes(filters.search) ||
    device.codename.toLowerCase().includes(filters.search);

  const matchesOem = !filters.oem || device.oem === filters.oem;

  return matchesSearch && matchesOem;
}

function updateBrandTileStates() {
  document.querySelectorAll(".brand-tile").forEach((tile) => {
    const brand = tile.dataset.brand || "";
    const isActive = selectedBrand === brand;
    tile.classList.toggle("is-active", isActive);
    tile.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
}

function renderBrandTiles(devices) {
  const tilesContainer = document.getElementById("brand-tiles");
  if (!tilesContainer) return;

  const brandCounts = devices.reduce((counts, device) => {
    counts[device.oem] = (counts[device.oem] || 0) + 1;
    return counts;
  }, {});

  const brands = Object.keys(brandCounts).sort();
  const tiles = [
    { name: "", label: "All Brands", count: devices.length },
    ...brands.map((brand) => ({ name: brand, label: brand, count: brandCounts[brand] })),
  ];

  tilesContainer.innerHTML = tiles
    .map(
      (tile) => `
        <button
          type="button"
          class="brand-tile${selectedBrand === tile.name ? " is-active" : ""}"
          data-brand="${tile.name}"
          aria-pressed="${selectedBrand === tile.name ? "true" : "false"}"
        >
          <span class="brand-tile-name">${tile.label}</span>
          <span class="brand-tile-count">${tile.count} device${tile.count === 1 ? "" : "s"}</span>
        </button>
      `
    )
    .join("");

  tilesContainer.querySelectorAll(".brand-tile").forEach((tile) => {
    tile.addEventListener("click", () => {
      const brand = tile.dataset.brand || "";
      selectedBrand = selectedBrand === brand && brand !== "" ? "" : brand;
      updateBrandTileStates();
      renderDevicesList();
    });
  });
}

function renderDeviceCard(device) {
  const isActive = device.status === "active";
  const variantPills = device.variants
    .map(
      (variant) =>
        `<span class="device-variant-pill">${variant.variant}${variant.version ? ` · ${variant.version.split("-")[0]}` : ""}</span>`
    )
    .join("");

  const card = document.createElement("article");
  card.className = "device-card";
  card.innerHTML = `
    <div class="device-card-top">
      <span class="device-status ${isActive ? "is-active" : "is-inactive"}">
        <i class="bi ${isActive ? "bi-check-circle-fill" : "bi-x-circle-fill"}"></i>
        ${device.status}
      </span>
      <span class="device-codename-badge">${device.codename}</span>
    </div>
    <div class="device-avatar-wrap">
      <img src="${device.device_avatar}" alt="${device.device}" class="device-avatar" loading="lazy">
    </div>
    <h2 class="device-title">${device.oem} ${device.device}</h2>
    <p class="device-meta-line"><strong>Maintainer:</strong> ${device.maintainer}</p>
    <div class="device-variant-list">${variantPills}</div>
    <div class="device-card-actions">
      ${
        device.device_changelog
          ? `<a href="downloads.html?codename=${encodeURIComponent(device.codename)}" class="device-build-btn">
              <i class="bi bi-download"></i>
              Get Builds
            </a>`
          : `<span class="device-meta-line">No builds listed</span>`
      }
    </div>
  `;
  return card;
}

function renderDevicesList() {
  const devicesContainer = document.getElementById("device-list");
  const resultCount = document.getElementById("device-result-count");
  if (!devicesContainer) return;

  const filters = getActiveFilters();
  const filteredDevices = groupedDevicesCache.filter((device) => matchesFilters(device, filters));

  devicesContainer.innerHTML = "";

  if (filteredDevices.length === 0) {
    devicesContainer.innerHTML =
      `<div class="devices-empty">No devices matched your search or filters.</div>`;
  } else {
    filteredDevices.forEach((device) => {
      devicesContainer.appendChild(renderDeviceCard(device));
    });
  }

  if (resultCount) {
    resultCount.textContent = `${filteredDevices.length} of ${groupedDevicesCache.length} device${groupedDevicesCache.length === 1 ? "" : "s"} shown`;
  }
}

function renderDevices() {
  renderBrandTiles(groupedDevicesCache);
  renderDevicesList();
}

async function loadDevices() {
  const devicesContainer = document.getElementById("device-list");
  const resultCount = document.getElementById("device-result-count");
  if (!devicesContainer) return;

  try {
    const response = await fetch(DEVICES_JSON_URL);
    if (!response.ok) throw new Error("Failed to fetch data");

    const deviceData = await response.json();
    groupedDevicesCache = groupDevices(deviceData);
    selectedBrand = "";
    renderDevices();
  } catch (error) {
    console.error("Error fetching devices:", error);
    devicesContainer.innerHTML =
      `<div class="devices-error">Unable to load devices right now. Please try again later.</div>`;
    if (resultCount) resultCount.textContent = "Failed to load devices";
  }
}

window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("search-input")?.addEventListener("input", renderDevicesList);
  loadDevices();

  if (typeof AOS !== "undefined") {
    AOS.init();
  }
});

window.addEventListener("scroll", () => {
  const header = document.getElementById("header");
  if (!header) return;
  header.classList.toggle("scrolled", window.scrollY > 50);
});

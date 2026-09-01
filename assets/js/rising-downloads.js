const DEVICES_JSON_URL =
  "https://raw.githubusercontent.com/RisingOS-Revived-devices/RisingOS_Web/refs/heads/main/devices.json";

function formatFileSize(bytes) {
  if (!bytes) return "-";
  if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(2)} GB`;
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(2)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${bytes} B`;
}

function versionPrefixFrom(version) {
  const match = String(version || "").match(/^(\d+)/);
  return match ? `${match[1]}.x` : "6.x";
}

function showError(message) {
  const errorContainer = document.getElementById("error-container");
  if (!errorContainer) return;
  errorContainer.innerHTML = `<div class="downloads-error">${message}</div>`;
}

function setHidden(element, hidden) {
  if (!element) return;
  element.classList.toggle("is-hidden", hidden);
}

async function fetchDeviceDownloads(codename, variant, version) {
  const startDate = "2025-02-01";
  const endDate = new Date().toISOString().split("T")[0];
  const versionPrefix = versionPrefixFrom(version);
  const url =
    `https://sourceforge.net/projects/risingos-revived/files/${versionPrefix}/${variant.toUpperCase()}/${codename}/stats/json` +
    `?start_date=${startDate}&end_date=${endDate}`;

  try {
    const response = await fetch(url);
    if (!response.ok) return 0;
    const data = await response.json();
    return data.total ?? 0;
  } catch (error) {
    console.error(`Error fetching downloads for ${codename}:`, error);
    return 0;
  }
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value ?? "-";
}

function setHash(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value || "Not available";
}

function setLink(id, href, disabled = false) {
  const element = document.getElementById(id);
  if (!element) return;
  if (href) {
    element.href = href;
    element.classList.remove("is-disabled");
  } else {
    element.href = "#";
    element.classList.add("is-disabled");
  }
  if (disabled) element.classList.add("is-disabled");
}

async function updateDeviceInfo(device) {
  const downloadCount = await fetchDeviceDownloads(
    device.codename,
    device.variant,
    device.version
  );

  setText("device-brand", device.oem);
  setText("device-name", device.device);
  setText("device-codename", device.codename);
  setText("android-version", device.version);
  setText("build-type", `${device.buildtype || "-"} · ${device.build || "-"}`);
  setText(
    "build-date",
    device.timestamp
      ? new Date(device.timestamp * 1000).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "-"
  );
  setText("file-size", formatFileSize(device.filesize));
  setText("download-count", downloadCount.toLocaleString());
  setText("maintainer", device.maintainer);

  const maintainerImage = document.getElementById("maintainer-image");
  if (maintainerImage) {
    maintainerImage.src = device.maintainer_avatar || "";
    maintainerImage.alt = device.maintainer || "Maintainer";
  }

  setHash("md5-hash", device.md5);
  setHash("sha256-hash", device.sha256);

  const versionPrefix = versionPrefixFrom(device.version);
  setLink("download-link", device.download || "", !device.download);
  setLink(
    "guide-link",
    `https://github.com/RisingOS-Revived/official_devices/tree/fifteen/OTA/guide/${device.codename}.md`
  );
  setLink(
    "device-changelog",
    device.device_changelog ||
      `https://raw.githubusercontent.com/RisingOS-Revived/official_devices/refs/heads/fifteen/OTA/changelogs/${device.codename}.txt`
  );
  setLink(
    "previous-builds",
    `https://sourceforge.net/projects/risingos-revived/files/${versionPrefix}/${device.variant.toUpperCase()}/${device.codename}`
  );
  setLink("recovery-link", device.recovery || "", !device.recovery);
  setLink("paypal-link", device.paypal || "", !device.paypal);
  setLink("telegram-link", device.telegram || "", !device.telegram);
}

function showVariantSelector(variants) {
  const variantPanel = document.getElementById("variant-selector");
  const variantButtons = document.getElementById("variant-buttons");
  if (!variantPanel || !variantButtons) return;

  variantButtons.innerHTML = "";
  variants.forEach((device, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `downloads-variant-btn${index === 0 ? " is-active" : ""}`;
    button.textContent = device.variant.toUpperCase();
    button.addEventListener("click", () => {
      document.querySelectorAll(".downloads-variant-btn").forEach((btn) => {
        btn.classList.remove("is-active");
      });
      button.classList.add("is-active");
      updateDeviceInfo(device);
    });
    variantButtons.appendChild(button);
  });

  setHidden(variantPanel, false);
  updateDeviceInfo(variants[0]);
}

async function loadDeviceData() {
  const card = document.getElementById("card");
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const codename = urlParams.get("codename");

    if (!codename) {
      showError("No device codename provided. Open this page from the Devices list or use ?codename=yourdevice.");
      setHidden(card, true);
      return;
    }

    const response = await fetch(DEVICES_JSON_URL);
    if (!response.ok) throw new Error("Failed to fetch devices.json");

    const devices = await response.json();
    const deviceVariants = devices.filter(
      (device) => device.codename.toLowerCase() === codename.toLowerCase()
    );

    if (deviceVariants.length === 0) {
      showError(`Device "${codename}" was not found.`);
      setHidden(card, true);
      return;
    }

    setHidden(card, false);
    if (deviceVariants.length > 1) {
      showVariantSelector(deviceVariants);
    } else {
      setHidden(document.getElementById("variant-selector"), true);
      await updateDeviceInfo(deviceVariants[0]);
    }
  } catch (error) {
    console.error("Error loading device data:", error);
    showError("Failed to load device data. Please try again later.");
    setHidden(card, true);
  }
}

function initCopyButtons() {
  document.querySelectorAll("[data-copy-target]").forEach((button) => {
    button.addEventListener("click", async () => {
      const targetId = button.getAttribute("data-copy-target");
      const target = document.getElementById(targetId);
      if (!target || !target.textContent || target.textContent === "Not available") return;

      try {
        await navigator.clipboard.writeText(target.textContent.trim());
        button.textContent = "Copied";
        button.classList.add("is-copied");
        setTimeout(() => {
          button.textContent = "Copy";
          button.classList.remove("is-copied");
        }, 1600);
      } catch (error) {
        console.error("Copy failed:", error);
      }
    });
  });
}

function initDisclaimerModal() {
  const modal = document.getElementById("disclaimerModal");
  const understandButton = document.querySelector(".downloads-modal-btn");
  if (!modal) return;

  modal.classList.add("is-open");
  understandButton?.addEventListener("click", () => modal.classList.remove("is-open"));
  modal.addEventListener("click", (event) => {
    if (event.target === modal) modal.classList.remove("is-open");
  });
}

function initWhatsNewModal() {
  const whatsNewLink = document.getElementById("whats-new");
  const whatsNewModal = document.getElementById("whats-new-modal");
  const closeModal = document.getElementById("close-modal");
  const changelogContent = document.getElementById("changelog-content");
  if (!whatsNewLink || !whatsNewModal || !closeModal) return;

  whatsNewLink.addEventListener("click", async (event) => {
    event.preventDefault();
    whatsNewModal.classList.add("is-open");

    if (changelogContent && !changelogContent.dataset.loaded) {
      try {
        const response = await fetch(
          "https://raw.githubusercontent.com/RisingOS-Revived/risingOS_changelogs/refs/heads/fifteen/README.md"
        );
        const text = await response.text();
        changelogContent.textContent = text
          .replace(/##/g, "")
          .replace(/\-\*\*/g, "")
          .replace(/\-\-\-/g, "")
          .replace(/\#/g, "")
          .replace(/\*(.*?)\*/g, "$1")
          .trim();
        changelogContent.dataset.loaded = "true";
      } catch (error) {
        changelogContent.textContent = "Unable to load changelogs right now.";
      }
    }
  });

  closeModal.addEventListener("click", () => whatsNewModal.classList.remove("is-open"));
  whatsNewModal.addEventListener("click", (event) => {
    if (event.target === whatsNewModal) whatsNewModal.classList.remove("is-open");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initCopyButtons();
  initDisclaimerModal();
  initWhatsNewModal();
  loadDeviceData();
});

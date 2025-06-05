/**
* Project: RisingOS Revived Official Website
* Updated: 28-Feb-2025
* Author: @skwel24
*/
  function formatFileSize(bytes) {
    if (bytes >= 1e9) return (bytes / 1e9).toFixed(1) + " GB";
    if (bytes >= 1e6) return (bytes / 1e6).toFixed(1) + " MB";
    if (bytes >= 1e3) return (bytes / 1e3).toFixed(1) + " KB";
    return bytes + " B";
  }

  async function fetchAllDevices() {
    const devicesContainer = document.getElementById('device-list');
    const searchQuery = document.getElementById('search-input').value.toLowerCase();
    devicesContainer.innerHTML = '';

    try {
      const response = await fetch("https://raw.githubusercontent.com/RisingOS-Revived-devices/RisingOS_Web/refs/heads/main/devices.json");
      if (!response.ok) throw new Error("Failed to fetch data");

      const deviceData = await response.json();
      const groupedDevices = {};

      deviceData.forEach(device => {
        if (!groupedDevices[device.codename]) {
          groupedDevices[device.codename] = { ...device, variants: [], paypal: device.paypal };
        }
        groupedDevices[device.codename].variants.push({
          variant: device.variant,
          download: device.download,
          filesize: device.filesize
        });
      });

      const filteredDevices = Object.values(groupedDevices).filter(device =>
        (device.device.toLowerCase().includes(searchQuery) ||
        device.oem.toLowerCase().includes(searchQuery) ||
        device.maintainer.toLowerCase().includes(searchQuery) ||
        device.codename.toLowerCase().includes(searchQuery))
      );

      for (const device of filteredDevices) {
        const card = document.createElement('div');
        card.className = 'col-lg-4 col-md-6';

        let variantButtons = '';
        if (device.variants.length > 1) {
          variantButtons = `
            <div class="dropdown">
              <button class="btn btn-success btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                <i class="bi bi-download"></i>
              </button>
              <ul class="dropdown-menu">
                ${device.variants.map(v => `
                  <li><a class="dropdown-item" href="${v.download}" target="_blank">
                    ${v.variant} (${formatFileSize(v.filesize)})
                  </a></li>
                `).join('')}
              </ul>
            </div>`;
        } else {
          const singleVariant = device.variants[0];
          variantButtons = `<a href="${singleVariant.download}" class="btn btn-success btn-sm" target="_blank">
            <i class="bi bi-download"></i>(${formatFileSize(singleVariant.filesize)})
          </a>`;
        }

        let donationButton = device.paypal ? `
            <a href="${device.paypal}" target="_blank" class="donation-btn">
              Donate<i class="bi bi-heart-fill"></i>
            </a>` : '';

        let recoveryButton = device.recovery ? `
            <a href="${device.recovery}" target="_blank" class="btn btn-danger">
              <i class="bi bi-tools"></i>
            </a>` : '';

        let downloadButton = device.device_changelog ? `
            <a href="downloads.html?codename=${device.codename}" class="btn btn-success">
              Get Builds</i>
            </a>` : '';

        let statusText = device.status.toUpperCase();
        let statusIcon = device.status === "active"
          ? `<i class="bi bi-check-circle-fill text-success"></i>`
          : `<i class="bi bi-x-circle-fill text-danger"></i>`;

  card.innerHTML = `
    <div class="device-card text-center">
      <span class="status">${statusIcon} ${statusText}</span>
      <span class="codename">${device.codename}</span>
      <img src="${device.device_avatar}" alt="${device.device}" class="device-avatar">
      <h3>${device.oem} ${device.device}</h3>
      <p><strong>Maintainer:</strong> ${device.maintainer}</p>
      <div class="btn-container">
        ${downloadButton}
      </div>
    </div>`;



        devicesContainer.appendChild(card);
      }
    } catch (error) {
      console.error("Error fetching devices:", error);
    }
  }

  window.onload = fetchAllDevices;

  // Header blur on scroll
  window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

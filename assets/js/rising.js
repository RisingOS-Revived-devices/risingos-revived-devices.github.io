/**
* Project: RisingOS Revived Official Website
* Updated: 28-Feb-2025
* Author: @skwel24
*/


document.addEventListener("DOMContentLoaded", function() {
    var carousel = document.querySelector("#carouselExampleIndicators");
    if (carousel) {
      var bsCarousel = new bootstrap.Carousel(carousel);
    } });
  document.addEventListener("DOMContentLoaded", async function () {
    try {
      const response = await fetch("https://raw.githubusercontent.com/RisingOS-Revived-devices/RisingOS_Web/main/core-team.json");
      const teamData = await response.json();

      const teamContainer = document.getElementById("team-container");
      teamData.forEach(member => {
        const memberCard = `
          <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
            <div class="card text-center p-3 shadow-lg">
              <img src="${member.avatar}" class="rounded-circle mx-auto" width="80" height="80" alt="${member.name}">
              <h5 class="mt-3">${member.name}</h5>
              <p class="text-muted">${member.position || "No role specified"}</p>
              <div>
                ${member.github ? `<a href="${member.github}" target="_blank"><i class="bi bi-github"></i></a>` : ""}
                ${member.telegram_username ? `<a href="https://t.me/${member.telegram_username.replace('@', '')}" target="_blank"><i class="bi bi-telegram"></i></a>` : ""}
              </div>
            </div>
          </div>
        `;
        teamContainer.innerHTML += memberCard;
      });
    } catch (error) {
      console.error("Error fetching team data:", error);
    }
  });

  async function fetchData() {
    const today = new Date().toISOString().split('T')[0];
    //const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    const url = `https://sourceforge.net/projects/risingos-revived/files/6.x/stats/json?start_date=2025-02-01&end_date=${today}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      console.log("API Response:", data);  // Debugging

      const totalDownloadsElement = document.getElementById('totalDownloads');
      totalDownloadsElement.innerHTML = `Total Downloads <br><span style="font-weight: bold; color: green;">${data.total}</span>`;

      // Extract downloads per day
      const lineChartData = {
        labels: data.downloads.map(entry => entry[0]),  // Dates
        datasets: [{
          label: 'Downloads per Day',
          data: data.downloads.map(entry => entry[1]),  // Download counts
          borderColor: 'white',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          fill: true
        }]
      };

      // Extract OS download stats
      const osDownloads = Object.fromEntries(data.oses);  // Convert [[OS, count], ...] to object
      const pieChartData = {
        labels: Object.keys(osDownloads),
        datasets: [{
          data: Object.values(osDownloads),
          backgroundColor: ['red', 'green', 'blue', 'yellow', 'purple']
        }]
      };

      // Extract country download stats
      const countryDownloads = Object.fromEntries(data.countries);  // Convert [[Country, count], ...] to object
      const barChartData = {
        labels: Object.keys(countryDownloads),
        datasets: [{
          label: 'Downloads by Country',
          data: Object.values(countryDownloads),
          backgroundColor: 'purple'
        }]
      };

      // Draw charts
      new Chart(document.getElementById('lineChart').getContext('2d'), { type: 'line', data: lineChartData });
      new Chart(document.getElementById('pieChart').getContext('2d'), { type: 'pie', data: pieChartData });
      new Chart(document.getElementById('barChart').getContext('2d'), { type: 'bar', data: barChartData });

    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  }

  // Run the function
  fetchData();

  document.addEventListener("DOMContentLoaded", function() {
    AOS.init();
  });
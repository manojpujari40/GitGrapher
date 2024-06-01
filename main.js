const usernameInput = document.getElementById('username');
const themeSelect = document.getElementById('theme-select');

let currentTheme = 'light';
let languagesChart;
let statsChart;
let commitsChart;

async function fetchData() {
  const username = usernameInput.value;
  if (!username) {
    alert('Please enter a GitHub username.');
    return;
  }

  try {
    const [reposResponse, followersResponse, followingResponse] = await Promise.all([
      fetch(`https://api.github.com/users/${username}/repos`),
      fetch(`https://api.github.com/users/${username}/followers`),
      fetch(`https://api.github.com/users/${username}/following`)
    ]);

    const reposRateLimit = parseInt(reposResponse.headers.get('X-RateLimit-Remaining'));
    const followersRateLimit = parseInt(followersResponse.headers.get('X-RateLimit-Remaining'));
    const followingRateLimit = parseInt(followingResponse.headers.get('X-RateLimit-Remaining'));

    if (reposRateLimit === 0 || followersRateLimit === 0 || followingRateLimit === 0) {
      alert('GitHub API rate limit exceeded. Please try again later.');
      return;
    }

    if (!reposResponse.ok) {
      throw new Error(`Error fetching repositories: ${reposResponse.statusText}`);
    }
    if (!followersResponse.ok) {
      throw new Error(`Error fetching followers: ${followersResponse.statusText}`);
    }
    if (!followingResponse.ok) {
      throw new Error(`Error fetching following: ${followingResponse.statusText}`);
    }

    const reposData = await reposResponse.json();
    const followersData = await followersResponse.json();
    const followingData = await followingResponse.json();

  } catch (error) {
    console.error('Error fetching data:', error);
    alert(error.message);
  }
}

function renderCharts(languages, stats, commitsPerRepo) {
    if (languagesChart) {
        languagesChart.destroy();
    }
    if (statsChart) {
        statsChart.destroy();
    }
    if (commitsChart) {
        commitsChart.destroy();
    }

    const languagesCtx = document.getElementById('languagesChart').getContext('2d');
    languagesChart = new Chart(languagesCtx, {
        type: 'pie',
        data: {
            labels: Object.keys(languages),
            datasets: [{
                data: Object.values(languages),
                backgroundColor: Object.keys(languages).map(() => `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.2)`),
                borderColor: Object.keys(languages).map(() => `rgba(0, 0, 0, 1)`),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    const statsCtx = document.getElementById('statsChart').getContext('2d');
    statsChart = new Chart(statsCtx, {
        type: 'bar',
        data: {
            labels: ['Forks', 'Stars'],
            datasets: [{
                data: [stats.forks, stats.stars],
                backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)'],
                borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    const commitsCtx = document.getElementById('commitsChart').getContext('2d');
    commitsChart = new Chart(commitsCtx, {
        type: 'bar',
        data: {
            labels: commitsPerRepo.map(repo => repo.repo),
            datasets: [{
                label: 'Commits',
                data: commitsPerRepo.map(repo => repo.commits),
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Repositories'
                    }
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Commits'
                    }
                }]
            }
        }
    });
}

themeSelect.addEventListener('change', function () {
    currentTheme = themeSelect.value;
    document.body.className = currentTheme === 'dark' ? 'dark-theme' : '';
});

function downloadChart(chart, filename) {
  const url = chart.toBase64Image();
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function renderCharts(languages, stats, commitsPerRepo) {
  const languagesDownloadBtn = document.getElementById('languagesDownloadBtn');
  languagesDownloadBtn.addEventListener('click', () => {
    downloadChart(languagesChart, 'languages_chart');
  });

  const statsDownloadBtn = document.getElementById('statsDownloadBtn');
  statsDownloadBtn.addEventListener('click', () => {
    downloadChart(statsChart, 'stats_chart');
  });

  const commitsDownloadBtn = document.getElementById('commitsDownloadBtn');
  commitsDownloadBtn.addEventListener('click', () => {
    downloadChart(commitsChart, 'commits_chart');
  });
}

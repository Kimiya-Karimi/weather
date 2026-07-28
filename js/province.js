const provinceCapitals = {
    "Tehran": "Tehran",
    "Gilan": "Rasht",
    "Guilan": "Rasht",
    "Isfahan": "Isfahan",
    "Fars": "Shiraz",
    "Mazandaran": "Sari",
    "Razavi Khorasan": "Mashhad",
    "East Azerbaijan": "Tabriz",
    "West Azerbaijan": "Urmia",
    "West Azerbaijan": "Orumiyeh",
    "Ardabil": "Ardabil",
    "Golestan": "Gorgan",
    "North Khorasan": "Bojnurd",
    "South Khorasan": "Birjand",
    "Semnan": "Semnan",
    "Qom": "Qom",
    "Markazi": "Arak",
    "Qazvin": "Qazvin",
    "Zanjan": "Zanjan",
    "Kurdistan": "Sanandaj",
    "Kermanshah": "Kermanshah",
    "Hamadan": "Hamedan",
    "Lorestan": "Khorramabad",
    "Ilam": "Ilam",
    "Khuzestan": "Ahvaz",
    "Chaharmahal and Bakhtiari": "Shahr-e Kord",
    "Kohgiluyeh and Boyer-Ahmad": "Yasuj",
    "Bushehr": "Bushehr",
    "Yazd": "Yazd",
    "Kerman": "Kerman",
    "Hormozgan": "Bandar Abbas",
    "Sistan and Baluchestan": "Zahedan",
    "Alborz": "Karaj"
};

const provinceCities = {
    "Alborz": ["Karaj", "Hashtgerd"],
    "Ardabil": ["Ardabil", "Sareyn", "Parsabad"],
    "Bushehr": ["Bushehr", "Borazjan"],
    "Chaharmahal and Bakhtiari": ["Shahrekord", "Borujen"],
    "East Azerbaijan": ["Tabriz", "Maragheh", "Jolfa"],
    "Fars": ["Shiraz", "Marvdasht", "Kazerun"],
    "Gilan": ["Rasht", "Lahijan", "Bandar-e Anzali"],
    "Guilan":["Rasht", "Lahijan", "Bandar-e Anzali","Langerud"],
    "Golestan": ["Gorgan", "Gonbad-e Kavus"],
    "Hamadan": ["Hamadan", "Malayer"],
    "Hormozgan": ["Bandar Abbas", "Kish"],
    "Ilam": ["Ilam", "Mehran"],
    "Isfahan": ["Isfahan", "Kashan", "Natanz"],
    "Kerman": ["Kerman", "Sirjan", "Bam"],
    "Kermanshah": ["Kermanshah", "Paveh"],
    "Khuzestan": ["Ahvaz", "Abadan", "Dezful"],
    "Kohgiluyeh and Boyer-Ahmad": ["Yasuj", "Dogonbadan"],
    "Kurdistan": ["Sanandaj", "Saqqez", "Marivan"],
    "Lorestan": ["Khorramabad", "Borujerd"],
    "Markazi": ["Arak", "Saveh"],
    "Mazandaran": ["Sari", "Amol", "Ramsar"],
    "North Khorasan": ["Bojnurd", "Shirvan"],
    "Qazvin": ["Qazvin", "Takestan"],
    "Qom": ["Qom", "Kahak"],
    "Razavi Khorasan": ["Mashhad", "Neyshabur"],
    "Semnan": ["Semnan", "Shahrud"],
    "Sistan and Baluchestan": ["Zahedan", "Chabahar"],
    "South Khorasan": ["Birjand", "Tabas"],
    "Tehran": ["Tehran", "Damavand", "Firoozkooh"],
    "West Azerbaijan": ["Urmia", "Khoy", "Mahabad"],
    "Yazd": ["Yazd", "Meybod"],
    "Zanjan": ["Zanjan", "Abhar"]
};

const urlParams = new URLSearchParams(window.location.search);
const provinceName = urlParams.get('name');

const provinceTitleElement = document.getElementById('provinceName');
const tempElement = document.getElementById('temp-val');
const descElement = document.getElementById('weather-desc');
const humidityElement = document.getElementById('humidity-val');
const windElement = document.getElementById('wind-val');
const iconElement = document.getElementById('weather-icon');
const mainPageTitle = document.getElementById('main-page-title');

if (provinceName) {
    if (mainPageTitle) {
        mainPageTitle.textContent = `${provinceName} Overview`;
    }
    provinceTitleElement.textContent = provinceName;
    document.title = `${provinceName} Weather`;
    
    tempElement.textContent = "...";
    descElement.textContent = "Loading...";
    
    getWeatherData(provinceName);
    getForecastData(provinceName);
    loadImportantCitiesWeather(provinceName);
    
} else {
    provinceTitleElement.textContent = "Unknown Location";
}

function getWeatherData(city) {
    let capitalCity = provinceCapitals[city];

    if (!capitalCity) {
        capitalCity = city;
    }

    const apiUrl = `/.netlify/functions/fetch-weather?endpoint=weather&q=${capitalCity}`;
    
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) throw new Error("Network response was not ok");
            return response.json();
        })
        .then(data => {
            const temp = Math.round(data.main.temp);
            const currentTemp = Math.round(data.main.temp);
            changeProvinceBackground(currentTemp); 
            const humidity = data.main.humidity;
            const windSpeed = Math.round(data.wind.speed * 3.6); 
            const weatherMain = data.weather[0].main; 
    
            const feelsLike = Math.round(data.main.feels_like);
            const pressure = data.main.pressure;
            const visibilityKm = (data.visibility / 1000).toFixed(1); 
            
            const sunriseTime = new Date(data.sys.sunrise * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
            const sunsetTime = new Date(data.sys.sunset * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

            const cityNameElement = document.getElementById('provinceName'); 
            if (cityNameElement) cityNameElement.textContent = capitalCity;
            
            tempElement.textContent = temp + "°";
            descElement.textContent = weatherMain;
            humidityElement.textContent = humidity + "%";
            windElement.textContent = windSpeed + " km/h";
            
            const hlFeels = document.getElementById('hl-feels');
            const hlPressure = document.getElementById('hl-pressure');
            const hlVisibility = document.getElementById('hl-visibility');
            const hlSun = document.getElementById('hl-sun');

            const lat = data.coord.lat;
            const lon = data.coord.lon;
            getAirQualityData(lat, lon);
            
            if (hlFeels) hlFeels.textContent = feelsLike + "°";
            if (hlPressure) hlPressure.textContent = pressure + " hPa";
            if (hlVisibility) hlVisibility.textContent = visibilityKm + " km";
            if (hlSun) hlSun.textContent = `${sunriseTime} / ${sunsetTime}`;
            
            const country = data.sys.country;
            const timezoneOffset = data.timezone / 3600; 
            const timezoneStr = timezoneOffset >= 0 ? `UTC +${timezoneOffset}` : `UTC ${timezoneOffset}`;

            const locCountry = document.getElementById('loc-country');
            const locLat = document.getElementById('loc-lat');
            const locLon = document.getElementById('loc-lon');
            const locTimezone = document.getElementById('loc-timezone');

            if (locCountry) locCountry.textContent = country;
            if (locLat) locLat.textContent = lat.toFixed(2); 
            if (locLon) locLon.textContent = lon.toFixed(2);
            if (locTimezone) locTimezone.textContent = timezoneStr;

            updateWeatherIcon(weatherMain);
            changeProvinceBackground(currentTemp);
            updateWeatherAdvice(temp, weatherMain);
        })
}

function updateWeatherIcon(weather) {
    if (weather === "Clear") iconElement.textContent = "☀️";
    else if (weather === "Rain" || weather === "Drizzle") iconElement.textContent = "🌧️";
    else if (weather === "Clouds") iconElement.textContent = "☁️";
    else if (weather === "Snow") iconElement.textContent = "❄️";
    else if (weather === "Thunderstorm") iconElement.textContent = "⛈️";
    else iconElement.textContent = "🌫️"; 
}

function changeProvinceBackground(temp) {
    let bgGradient = "";

    if (temp < 10) {
        bgGradient = "linear-gradient(180deg, #4facfe, #00f2fe)"; 
    } 
    else if (temp >= 10 && temp < 25) {
        bgGradient = "linear-gradient(180deg, #38ef7d, #11998e)"; 
    } 
    else if (temp >= 25 && temp < 35) {
        bgGradient = "linear-gradient(180deg, #f6d365, #fda085)"; 
    } 
    else {
        bgGradient = "linear-gradient(180deg, #ff0844, #ffb199)"; 
    }

    document.body.style.background = bgGradient;
}

function updateWeatherAnimation(weather) {
    const animLayer = document.querySelector('.weather-animation');
    
    animLayer.className = 'weather-animation'; 
    
    if (weather === "Clear") {
        animLayer.classList.add('anim-clear');
    } else if (weather === "Rain" || weather === "Drizzle") {
        animLayer.classList.add('anim-rain');
    } else if (weather === "Clouds") {
        animLayer.classList.add('anim-clouds');
    } else {
        animLayer.style.background = "linear-gradient(180deg, #89f7fe, #66a6ff)";
    }
}

let weatherChart = null;

function renderChart(times, temperatures) {
    const ctx = document.getElementById('hourlyChart').getContext('2d');
    
    if (weatherChart) {
        weatherChart.destroy();
    }

    const temperatureLabelsPlugin = {
        id: 'temperatureLabels',
        afterDatasetsDraw(chart) {
            const { ctx, data } = chart;
            ctx.save();
            ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
            ctx.fillStyle = '#021133'; 
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            
            chart.getDatasetMeta(0).data.forEach((datapoint, index) => {
                const value = data.datasets[0].data[index];
                ctx.fillText(value + '°', datapoint.x, datapoint.y - 12);
            });
            ctx.restore();
        }
    };
    
    weatherChart = new Chart(ctx, { 
        type: 'line',
        data: {
            labels: times,
            datasets: [{
                label: 'Temperature (°C)',
                data: temperatures,
                borderColor: '#2a5298',
                backgroundColor: 'rgba(42, 82, 152, 0.2)',
                borderWidth: 3,
                tension: 0.2,
                fill: 'origin',
                
                pointBackgroundColor: temperatures.map((_, i) => i === 0 ? '#021133' : '#ffffff'),
                pointBorderColor: '#2a5298',
                pointBorderWidth: 2,
                pointRadius: temperatures.map((_, i) => i === 0 ? 6 : 4), 
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    top: 25 
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(2, 17, 51, 0.85)', 
                    titleFont: { family: 'Plus Jakarta Sans', size: 13 },
                    bodyFont: { family: 'Plus Jakarta Sans', size: 15, weight: 'bold' },
                    displayColors: false,
                    padding: 12,
                    cornerRadius: 12
                }
            },
            scales: {
                y: { display: false, beginAtZero: false },
                x: {
                    grid: { display: false },
                    ticks: {
                        color: '#021133',
                        font: { family: 'Plus Jakarta Sans', weight: '600', size: 11 }
                    },
                    border: { display: false }
                }
            }
        },
        plugins: [temperatureLabelsPlugin] 
    });
}

function getForecastData(city) {
    const queryCity = provinceCapitals[city] || city;
    const forecastUrl = `/.netlify/functions/fetch-weather?endpoint=forecast&q=${queryCity}`;

    fetch(forecastUrl)
        .then(response => {
            if (!response.ok) throw new Error("Network response was not ok");
            return response.json();
        })
        .then(data => {
            const next24Hours = data.list.slice(0, 8);
            const times = next24Hours.map((item, index) => {
                if (index === 0) return 'Now'; 
                const date = new Date(item.dt * 1000);
                return `${date.getHours().toString().padStart(2, '0')}:00`;
            });
            const temperatures = next24Hours.map(item => Math.round(item.main.temp));
            
            renderChart(times, temperatures);

            const dailyData = data.list.filter(item => item.dt_txt.includes('12:00:00'));
            
            const forecastContainer = document.getElementById('forecast-days');
            if (forecastContainer) {
                forecastContainer.innerHTML = ''; 
            }
            
            dailyData.forEach(day => {
                const date = new Date(day.dt * 1000);
                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }); 
                const temp = Math.round(day.main.temp);
                const weatherMain = day.weather[0].main;
                
                let icon = "☀️";
                if (weatherMain === "Rain" || weatherMain === "Drizzle") icon = "🌧️";
                else if (weatherMain === "Clouds") icon = "☁️";
                else if (weatherMain === "Snow") icon = "❄️";
                else if (weatherMain === "Thunderstorm") icon = "⛈️";
                
                const pill = document.createElement('div');
                pill.className = 'forecast-pill';
                pill.innerHTML = `<span>${icon}</span> <span>${dayName} ${temp}°</span>`;
                
                if (forecastContainer) {
                    forecastContainer.appendChild(pill);
                }
            });
        })
        .catch(error => {
            console.error("Error fetching forecast:", error);
        });
}

function updateWeatherAdvice(temp, weather) {
    const adviceElement = document.getElementById('advice-text');
    let advice = "";

    if (weather === "Rain" || weather === "Drizzle") {
        advice = "Don't forget your umbrella! The roads might be slippery. ☔";
    } 
    else if (weather === "Snow") {
        advice = "It's freezing outside! Bundle up and drive safely. ⛄";
    } 
    else if (weather === "Thunderstorm") {
        advice = "Strong storms ahead! Better to stay indoors. ⛈️";
    } 
    else if (temp >= 32) {
        advice = "It's really hot out there! Stay hydrated and wear sunscreen. 🌡️💧";
    } 
    else if (temp <= 10) {
        advice = "It's quite chilly today! A warm jacket is a great idea. 🧥☕";
    } 
    else if (weather === "Clear") {
        advice = "The weather is beautiful and clear! Perfect time for outdoor activities. ☀️🕶️";
    } 
    else if (weather === "Clouds") {
        advice = "It's a bit cloudy today. A nice, cozy weather for a walk. ☁️🚶‍♀️";
    } 
    else {
        advice = "Have a great day ahead and enjoy the weather! 🌤️";
    }

    if (adviceElement) {
        adviceElement.textContent = advice;
    }
}

let currentGaugeAngle = -90; 

function getUS_AQI(pm25) {
    if (pm25 <= 12.0) return Math.round((50 / 12.0) * pm25);
    if (pm25 <= 35.4) return Math.round(((100 - 51) / (35.4 - 12.1)) * (pm25 - 12.1) + 51);
    if (pm25 <= 55.4) return Math.round(((150 - 101) / (55.4 - 35.5)) * (pm25 - 35.5) + 101);
    if (pm25 <= 150.4) return Math.round(((200 - 151) / (150.4 - 55.5)) * (pm25 - 55.5) + 151);
    if (pm25 <= 250.4) return Math.round(((300 - 201) / (250.4 - 150.5)) * (pm25 - 150.5) + 201);
    if (pm25 <= 350.4) return Math.round(((400 - 301) / (350.4 - 250.5)) * (pm25 - 250.5) + 301);
    return Math.round(((500 - 401) / (500.4 - 350.5)) * (pm25 - 350.5) + 401);
}

function calculateGaugeAngle(aqi) {
    if (aqi <= 50) return (aqi / 50) * 30; 
    if (aqi <= 100) return 30 + ((aqi - 50) / 50) * 30; 
    if (aqi <= 200) return 60 + ((aqi - 100) / 100) * 30; 
    if (aqi <= 300) return 90 + ((aqi - 200) / 100) * 30; 
    if (aqi <= 400) return 120 + ((aqi - 300) / 100) * 30; 
    if (aqi <= 500) return 150 + ((aqi - 400) / 100) * 30; 
    return 180; 
}

let isAqiVisible = false;

function getAirQualityData(lat, lon) {
    const url = `/.netlify/functions/fetch-weather?endpoint=air_pollution&lat=${lat}&lon=${lon}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const pm25 = data.list[0].components.pm2_5;
            const aqi = getUS_AQI(pm25); 
            
            document.getElementById('aqi-value').textContent = aqi;
            
            const statusEl = document.getElementById('aqi-status');
            if (aqi <= 50) { statusEl.textContent = "Good"; statusEl.style.color = "#34a12b"; }
            else if (aqi <= 100) { statusEl.textContent = "Moderate"; statusEl.style.color = "#d4cc0f"; }
            else if (aqi <= 200) { statusEl.textContent = "Unhealthy"; statusEl.style.color = "#e99e2b"; }
            else if (aqi <= 300) { statusEl.textContent = "Very Unhealthy"; statusEl.style.color = "#e23c27"; }
            else { statusEl.textContent = "Hazardous"; statusEl.style.color = "#6b0b0b"; }

            currentGaugeAngle = calculateGaugeAngle(aqi) - 90;
            
            if (isAqiVisible) {
                const needle = document.getElementById('gauge-needle');
                if (needle) needle.style.transform = `translateX(-50%) rotate(${currentGaugeAngle}deg)`;
            }
        })
        .catch(error => console.error("Error fetching AQI:", error));
}

const aqiObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        isAqiVisible = entry.isIntersecting;
        const needle = document.getElementById('gauge-needle');
        
        if (!needle) return;

        if (isAqiVisible) {
            needle.style.transform = `translateX(-50%) rotate(${currentGaugeAngle}deg)`;
        } else {
            needle.style.transform = `translateX(-50%) rotate(-90deg)`;
        }
    });
}, { threshold: 0.3 }); 

setTimeout(() => {
    const aqiSection = document.getElementById('aqi-section');
    if (aqiSection) aqiObserver.observe(aqiSection);
}, 300);

function loadImportantCitiesWeather(province) {
    const container = document.getElementById('cities-list-container');
    const citiesToLoad = provinceCities[province];

    if (!citiesToLoad || citiesToLoad.length === 0) {
        if (container) container.innerHTML = "<p style='text-align: center; color: #64748b;'>No extra cities data available.</p>";
        return;
    }

    if (container) container.innerHTML = ""; 

    citiesToLoad.forEach(city => {
        const url = `/.netlify/functions/fetch-weather?endpoint=weather&q=${encodeURIComponent(city)}`;
        
        fetch(url)
            .then(res => {
                if (!res.ok) throw new Error("City not found");
                return res.json();
            })
            .then(data => {
                const temp = Math.round(data.main.temp);
                const weatherMain = data.weather[0].main;
                
                let icon = "☀️";
                if (weatherMain === "Rain" || weatherMain === "Drizzle") icon = "🌧️";
                else if (weatherMain === "Clouds") icon = "☁️";
                else if (weatherMain === "Snow") icon = "❄️";
                else if (weatherMain === "Thunderstorm") icon = "⛈️";
                else icon = "🌫️";
                if (weatherMain === "Clear") icon = "☀️";

                const cityRow = document.createElement('div');
                cityRow.className = 'city-row';
                cityRow.innerHTML = `
                    <span class="city-name">${city.replace("-", " ")}</span>
                    <div class="city-info-group">
                        <span class="city-cond-icon">${icon}</span>
                        <span class="city-temp-badge">${temp}°C</span>
                    </div>
                `;
                container.appendChild(cityRow);
            })
            .catch(err => console.error(`Error loading weather for ${city}:`, err));
    });
}
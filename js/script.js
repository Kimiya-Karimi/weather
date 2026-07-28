// ۱. توابع تغییر پس‌زمینه
function changeBackground(weather) {
    if (weather === "Clear") {
        document.body.style.background = "linear-gradient(180deg, #4facfe, #00f2fe)";
    } else if (weather === "Rain") {
        document.body.style.background = "linear-gradient(180deg, #314755, #26a0da)";
    } else if (weather === "Clouds") {
        document.body.style.background = "linear-gradient(180deg, #d7d2cc, #304352)";
    } else if (weather === "Snow") {
        document.body.style.background = "linear-gradient(180deg, #e6dada, #274046)";
    }
}

// ۲. انتخاب المان‌ها
const tooltip = document.getElementById("tooltip");

// ۳. لیست نام استان‌ها (برای نمایش به کاربر و سرچ)
const provinceNames = {
    28: "East Azerbaijan", 17: "West Azerbaijan", 24: "Ardabil", 15: "Isfahan",
    6 : "Alborz", 20: "Ilam", 12: "Bushehr", 21: "Tehran", 16: "Chaharmahal and Bakhtiari",
    10: "South Khorasan", 14: "Razavi Khorasan", 0 : "North Khorasan", 11: "Khuzestan",
    7 : "Zanjan", 26: "Semnan", 3 : "Sistan and Baluchestan", 27: "Fars", 5 : "Qazvin",
    22: "Qom", 18: "Kurdistan", 25: "Kerman", 19: "Kermanshah", 30: "Kohgiluyeh and Boyer-Ahmad",
    2 : "Golestan", 23: "Guilan", 8 : "Lorestan", 4 : "Mazandaran", 13: "Markazi",
    9 : "Hormozgan", 1 : "Hamadan", 29: "Yazd"
};

// ۴. لیست مراکز استان‌ها (فقط برای ارسال به سرور API تا خطای 404 ندهد)
const apiCityNames = {
    28: "Tabriz", 17: "Urmia", 24: "Ardabil", 15: "Isfahan",
    6 : "Karaj", 20: "Ilam", 12: "Bushehr", 21: "Tehran", 16: "Shahr-e Kord",
    10: "Birjand", 14: "Mashhad", 0 : "Bojnurd", 11: "Ahvaz",
    7 : "Zanjan", 26: "Semnan", 3 : "Zahedan", 27: "Shiraz", 5 : "Qazvin",
    22: "Qom", 18: "Sanandaj", 25: "Kerman", 19: "Kermanshah", 30: "Yasuj",
    2 : "Gorgan", 23: "Rasht", 8 : "Khorramabad", 4 : "Sari", 13: "Arak",
    9 : "Bandar Abbas", 1 : "Hamadan", 29: "Yazd"
};

// ۵. تابع تعیین رنگ نقشه
function getGlowColor(temp) {
    if (temp < 10) return "#3b959a";       
    if (temp >= 10 && temp < 25) return "#407053"; 
    if (temp >= 25 && temp < 35) return "#f2cd48"; 
    return "#af3d33";                      
}

const paths = document.querySelectorAll("path");
const tempCache = {}; 

// ۶. تابع اصلی دریافت اطلاعات
async function loadMapData() {
    const cacheKey = 'iranWeatherData';
    const cacheTimeKey = 'iranWeatherTime';
    const cacheDuration = 15 * 60 * 1000; 

    const statusText = document.getElementById('update-status');
    const refreshWrapper = document.getElementById('refresh-wrapper');
    const refreshIcon = document.getElementById('refresh-icon');

    if (statusText) statusText.style.display = 'inline';
    if (refreshWrapper) refreshWrapper.style.display = 'none';

    const cachedData = sessionStorage.getItem(cacheKey);
    const cachedTime = sessionStorage.getItem(cacheTimeKey);
    const now = new Date().getTime();

    if (cachedData && cachedTime && (now - parseInt(cachedTime) < cacheDuration)) {
        Object.assign(tempCache, JSON.parse(cachedData));
        applyInitialColors(); 
        
        if (statusText) statusText.style.display = 'none';
        if (refreshWrapper) refreshWrapper.style.display = 'flex';
        if (refreshIcon) refreshIcon.classList.remove('spin');
        updateTimeAgo();
        return;
    }

    const keys = Object.keys(apiCityNames);
    const chunkSize = 5;

    for (let i = 0; i < keys.length; i += chunkSize) {
        const chunk = keys.slice(i, i + chunkSize);
        
        const promises = chunk.map(async (index) => {
            const queryName = apiCityNames[index];
            try {
                const response = await fetch(`/.netlify/functions/fetch-weather?endpoint=weather&q=${queryName}`);
                if (response.ok) {
                    const data = await response.json();
                    tempCache[index] = Math.round(data.main.temp);
                }
            } catch (error) {
                console.error(`Error fetching data for ${queryName}:`, error);
            }
        });

        await Promise.all(promises);
        applyInitialColors();
    }

    sessionStorage.setItem(cacheKey, JSON.stringify(tempCache));
    sessionStorage.setItem(cacheTimeKey, now.toString());

    if (statusText) statusText.style.display = 'none';
    if (refreshWrapper) refreshWrapper.style.display = 'flex';
    if (refreshIcon) refreshIcon.classList.remove('spin');
    updateTimeAgo();
}

// ۷. تابع رنگ‌آمیزی اولیه
function applyInitialColors() {
    paths.forEach((province, index) => {
        const temp = tempCache[index];
        if (temp !== undefined) {
            const color = getGlowColor(temp);
            province.style.fill = color;
            province.style.opacity = "0.9"; 
            province.style.transition = "all 0.3s ease";
            province.dataset.baseColor = color; 
        }
    });
}

// ۸. رویدادهای موس روی نقشه
paths.forEach((province, index) => {
    
    if (!provinceNames[index]) return;

    province.addEventListener("mousemove", function(e) {
        tooltip.style.left = e.clientX + 20 + "px";
        tooltip.style.top = e.clientY + 20 + "px";
    });

    province.addEventListener("mouseenter", function(e) {
        const displayName = provinceNames[index];
        tooltip.style.opacity = 1;

        paths.forEach(p => {
            if(p !== this) p.style.opacity = "0.7";
        });

        this.style.opacity = "1.1";
        
        if (tempCache[index] !== undefined) {
            const temp = tempCache[index];
            const glowColor = getGlowColor(temp);

            tooltip.innerHTML = `
                <b>${displayName}</b><br>
                <span style="color: ${glowColor}; font-weight: bold;">🌡 ${temp}°C</span>
            `;
            
            this.style.filter = `drop-shadow(0 0 12px ${glowColor})`;
            this.style.stroke = "#ffffff"; 
            this.style.strokeWidth = "1.5px";
        } else {
            tooltip.innerHTML = `<b>${displayName}</b><br><span>⏳ ...</span>`;
        }
    });

    province.addEventListener("mouseleave", function() {
        tooltip.style.opacity = "0";
        this.style.filter = ""; 
        this.style.stroke = ""; 
        this.style.strokeWidth = ""; 
        
        paths.forEach(p => {
            if (p.dataset.baseColor) {
                p.style.opacity = "0.9";
            }
        });
    });

    province.addEventListener("click", function() {
        const name = provinceNames[index];
        window.location.href = "province.html?name=" + name;
    });
});

// ۱۰. آپدیت زمان و دکمه رفرش
function updateTimeAgo() {
    const cacheTimeKey = 'iranWeatherTime';
    const cachedTime = sessionStorage.getItem(cacheTimeKey);
    const timeTextElement = document.getElementById('last-update-text');
    
    if (!cachedTime || !timeTextElement) return;

    const now = new Date().getTime();
    const diffMinutes = Math.floor((now - parseInt(cachedTime)) / (1000 * 60));

    if (diffMinutes < 1) {
        timeTextElement.textContent = "Updated just now";
    } else {
        timeTextElement.textContent = `Updated ${diffMinutes} min ago`;
    }
}

setInterval(updateTimeAgo, 60000);

const refreshBtnElement = document.getElementById('refresh-btn');
if (refreshBtnElement) {
    refreshBtnElement.addEventListener('click', () => {
        document.getElementById('refresh-icon').classList.add('spin');
        sessionStorage.removeItem('iranWeatherData');
        sessionStorage.removeItem('iranWeatherTime');
        for (let key in tempCache) delete tempCache[key];
        loadMapData();
    });
}

// ۱۱. فراخوانی تابع برای اولین بار (روشن کردن سایت)
loadMapData();

// ۱. دیکشنری شهرها
const allCitiesData = {
    "Alborz": ["Karaj", "Hashtgerd"],
    "Ardabil": ["Ardabil", "Sareyn", "Parsabad"],
    "Bushehr": ["Bushehr", "Borazjan"],
    "Chaharmahal and Bakhtiari": ["Shahrekord", "Borujen"],
    "East Azerbaijan": ["Tabriz", "Maragheh", "Jolfa"],
    "Fars": ["Shiraz", "Marvdasht", "Kazerun"],
    "Gilan": ["Rasht", "Lahijan", "Bandar-e Anzali"],
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

const searchList = [];
for (const [province, cities] of Object.entries(allCitiesData)) {
    cities.forEach(city => {
        searchList.push({ cityName: city, provName: province });
    });
}

const searchInput = document.getElementById('search-input') || document.getElementById('searchInput'); 
const suggestionsList = document.getElementById('suggestions-list');
const searchBtn = document.getElementById('search-btn') || document.getElementById('searchBtn');

function executeSearch(query) {
    query = query.toLowerCase().trim();
    if (!query) return;

    let foundMatch = searchList.find(item => item.cityName.toLowerCase() === query);
    
    if (!foundMatch) {
        const isProv = Object.keys(allCitiesData).find(prov => prov.toLowerCase() === query);
        if (isProv) {
            window.location.href = `province.html?name=${isProv}`;
            return;
        }
    }

    if (!foundMatch) {
        foundMatch = searchList.find(item => 
            item.cityName.toLowerCase().includes(query) || 
            item.provName.toLowerCase().includes(query)
        );
    }

    if (foundMatch) {
        window.location.href = `province.html?name=${foundMatch.provName}`;
    } else {
        alert("Location not found! Please try another name.");
    }
}

if (searchInput && suggestionsList) {
    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        suggestionsList.innerHTML = ''; 

        if (query === '') {
            suggestionsList.classList.remove('show');
            return;
        }

        const filtered = searchList.filter(item => 
            item.cityName.toLowerCase().includes(query) || item.provName.toLowerCase().includes(query)
        );

        if (filtered.length > 0) {
            suggestionsList.classList.add('show');
            
            filtered.forEach(item => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span class="s-city">${item.cityName.replace("-", " ")}</span> 
                    <span class="s-prov">${item.provName}</span>
                `;
                
                li.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation(); 
                    window.location.href = `province.html?name=${item.provName}`;
                });
                
                suggestionsList.appendChild(li);
            });
        } else {
            suggestionsList.classList.remove('show');
        }
    });

    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            executeSearch(this.value);
        }
    });
}

if (searchBtn) {
    searchBtn.addEventListener('click', function() {
        if(searchInput) executeSearch(searchInput.value);
    });
}

document.addEventListener('click', function(e) {
    if (searchInput && suggestionsList && !searchInput.contains(e.target) && !suggestionsList.contains(e.target)) {
        suggestionsList.classList.remove('show');
    }
});
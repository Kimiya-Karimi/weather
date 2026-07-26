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

// ۵. تابع تعیین رنگ نقشه با رنگ‌های خالص و درخشان
function getGlowColor(temp) {
    if (temp < 10) return "#3b959a";       // آبی (سرد)
    if (temp >= 10 && temp < 25) return "#407053"; // سبز (معتدل)
    if (temp >= 25 && temp < 35) return "#f2cd48"; // زرد (گرم)
    return "#af3d33";                      // قرمز (خیلی گرم)
}

// ==========================================
// ۶. تنظیمات نقشه، کَش کردن و دریافت همزمان دیتا
// ==========================================

const paths = document.querySelectorAll("path");
const tempCache = {}; 

async function loadMapData() {
    const cacheKey = 'iranWeatherData';
    const cacheTimeKey = 'iranWeatherTime';
    const cacheDuration = 15 * 60 * 1000; 

    const cachedData = sessionStorage.getItem(cacheKey);
    const cachedTime = sessionStorage.getItem(cacheTimeKey);
    const now = new Date().getTime();

    if (cachedData && cachedTime && (now - parseInt(cachedTime) < cacheDuration)) {
        Object.assign(tempCache, JSON.parse(cachedData));
        applyInitialColors(); 
        return;
    }

    const apiKey = "be19ea3bdb73fda4db896dcf5aa1e82f";
    const keys = Object.keys(apiCityNames);

    // گرفتن دیتا به صورت دونه‌دونه و امن برای جلوگیری از بلاک شدن API
    for (const index of keys) {
        const queryName = apiCityNames[index];
        try {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${queryName},IR&units=metric&appid=${apiKey}`);
            if (response.ok) {
                const data = await response.json();
                tempCache[index] = Math.round(data.main.temp);
            }
        } catch (error) {
            console.error(`Error fetching data for ${queryName}:`, error);
        }
    }

    sessionStorage.setItem(cacheKey, JSON.stringify(tempCache));
    sessionStorage.setItem(cacheTimeKey, now.toString());

    applyInitialColors();
}

// تابع رنگ‌آمیزی اولیه با حالت مات
function applyInitialColors() {
    paths.forEach((province, index) => {
        const temp = tempCache[index];
        if (temp !== undefined) {
            const color = getGlowColor(temp);
            province.style.fill = color;
            province.style.opacity = "0.9"; // حالت مات پیش‌فرض
            province.style.transition = "all 0.3s ease";
            province.dataset.baseColor = color; 
        }
    });
}

// رویدادهای موس (تولتیپ، افکت فوکوس و کلیک)
paths.forEach((province, index) => {
    
    province.addEventListener("mousemove", function(e) {
        tooltip.style.left = e.clientX + 20 + "px";
        tooltip.style.top = e.clientY + 20 + "px";
    });

    province.addEventListener("mouseenter", function(e) {
        const displayName = provinceNames[index];
        tooltip.style.opacity = 1;

        // ترفند حرفه‌ای: بقیه استان‌ها رو محو می‌کنیم
        paths.forEach(p => {
            if(p !== this) p.style.opacity = "0.7";
        });

        // استان فعلی رو کاملا روشن می‌کنیم
        this.style.opacity = "1.1";
        

        

        if (tempCache[index] !== undefined) {
            const temp = tempCache[index];
            const glowColor = getGlowColor(temp);

            tooltip.innerHTML = `
                <b>${displayName}</b><br>
                <span style="color: ${glowColor}; font-weight: bold;">🌡 ${temp}°C</span>
            `;
            
            this.style.filter = `drop-shadow(0 0 12px ${glowColor})`;
            this.style.stroke = "#ffffff"; // یک حاشیه سفید نازک به استانی که روش هستیم میدیم
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
        
        // برگرداندن همه استان‌ها به حالت اولیه (مات)
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

loadMapData();

// ==========================================
// ۷. بخش فعال‌سازی باکس جستجو (سرچ هوشمند)
// ==========================================

const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");

function searchProvince() {
    const query = searchInput.value.toLowerCase().trim();
    if (!query) return;

    let foundIndex = -1;

    for (let index in provinceNames) {
        if (provinceNames[index].toLowerCase().includes(query)) {
            foundIndex = index;
            break;
        }
    }

    if (foundIndex !== -1) {
        const name = provinceNames[foundIndex];
        window.location.href = "province.html?name=" + name;
    } else {
        alert("Province not found!");
    }
}

searchBtn.addEventListener("click", searchProvince);

searchInput.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        searchProvince();
    }
});
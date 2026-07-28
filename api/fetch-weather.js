export default async function handler(req, res) {
    // ۱. گرفتن اطلاعاتی که سایت تو (فرانت‌اند) به سرور می‌فرسته
    const { endpoint, q, lat, lon } = req.query;

    // ۲. برداشتن کلیدِ امنیتی از گاوصندوقِ مخفی (بعداً این رو تو سرور تنظیم می‌کنیم)
    const apiKey = process.env.WEATHER_API_KEY;

    // ۳. ساختن آدرس پایه‌ی آشپزخونه (OpenWeather)
    let apiUrl = `https://api.openweathermap.org/data/2.5/${endpoint}?appid=${apiKey}`;

    // اگه درخواست برای شهر خاصی بود:
    if (q) apiUrl += `&q=${encodeURIComponent(q)},IR&units=metric`;
    
    // اگه درخواست برای کیفیت هوا (مختصات) بود:
    if (lat && lon) apiUrl += `&lat=${lat}&lon=${lon}`;

    try {
        // ۴. درخواست زدن به OpenWeather در یک محیط کاملاً امن و دور از چشم کاربر
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        // ۵. تحویل دادنِ دیتا به سایت تو
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: "Error fetching weather data" });
    }
}
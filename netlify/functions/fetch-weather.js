exports.handler = async function(event, context) {
    // ۱. گرفتن اطلاعاتی که سایت تو به سرور می‌فرسته
    const { endpoint, q, lat, lon } = event.queryStringParameters;

    // ۲. خواندن کلید مخفی از گاوصندوق Netlify
    const apiKey = process.env.WEATHER_API_KEY;

    // ۳. ساختن آدرس OpenWeather
    let apiUrl = `https://api.openweathermap.org/data/2.5/${endpoint}?appid=${apiKey}`;

    // اضافه کردن نام شهر یا مختصات به آدرس
    if (q) apiUrl += `&q=${encodeURIComponent(q)},IR&units=metric`;
    if (lat && lon) apiUrl += `&lat=${lat}&lon=${lon}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        // ۴. برگرداندن اطلاعات به سایت تو
        return {
            statusCode: 200,
            body: JSON.stringify(data)
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Error fetching weather data" })
        };
    }
};
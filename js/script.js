
function changeBackground(weather) {

    if (weather === "Clear") {
        document.body.style.background =
        "linear-gradient(180deg, #4facfe, #00f2fe)";
    }

    else if (weather === "Rain") {
        document.body.style.background =
        "linear-gradient(180deg, #314755, #26a0da)";
    }

    else if (weather === "Clouds") {
        document.body.style.background =
        "linear-gradient(180deg, #d7d2cc, #304352)";
    }

    else if (weather === "Snow") {
        document.body.style.background =
        "linear-gradient(180deg, #e6dada, #274046)";
    }
}
const tooltip = document.getElementById("tooltip");


const provinceNames = {

    28: "East Azerbaijan",
    17: "West Azerbaijan",
    24: "Ardabil",
    15: "Isfahan",
    6 : "Alborz",
    20: "Ilam",
    12: "Bushehr",
    21: "Tehran",
    16: "Chaharmahal and Bakhtiari",
    10: "South Khorasan",
    14: "Razavi Khorasan",
    0 : "North Khorasan",
    11: "Khuzestan",
    7 : "Zanjan",
    26: "Semnan",
    3 : "Sistan and Baluchestan",
    27: "Fars",
    5 : "Qazvin",
    22: "Qom",
    18: "Kurdistan",
    25: "Kerman",
    19: "Kermanshah",
    30: "Kohgiluyeh and Boyer-Ahmad",
    2 : "Golestan",
    23: "Guilan",
    8 : "Lorestan",
    4 : "Mazandaran",
    13: "Markazi",
    9 : "Hormozgan",
    1 : "Hamadan",
    29: "Yazd"
};



document.querySelectorAll("path").forEach((province,index)=>{


    province.addEventListener("mousemove",function(e){


        tooltip.style.left = e.clientX + 20 + "px";
        tooltip.style.top = e.clientY + 20 + "px";


        tooltip.innerHTML =
        `
        <b>${provinceNames[index]}</b>
        <br>
        🌡 25°C
        `;


        tooltip.style.opacity = 1;


    });


    province.addEventListener("mouseleave",function(){

        tooltip.style.opacity = 0;

    });


});
document.querySelectorAll("path").forEach((province,index)=>{


    province.addEventListener("click",function(){

        const name = provinceNames[index];

        window.location.href =
        "province.html?name=" + name;

    });


});
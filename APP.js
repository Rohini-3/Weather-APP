const API_KEY = "data08697556c8290d7aa49946c3d3d5f";

// DOM Elements
const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");
const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");
const grantAccessButton = document.querySelector("[data-grantAccess]");
const searchInput = document.querySelector("[data-searchInput]");

// Tab Management
let currentTab = userTab;
currentTab.classList.add("current-tab");
getFromSessionStorage();

const switchTab = (newTab) => {
    if (newTab !== currentTab) {
        currentTab.classList.remove("current-tab");
        currentTab = newTab;
        currentTab.classList.add("current-tab");

        const isSearchTab = searchForm.classList.contains("active");
        userInfoContainer.classList.toggle("active", isSearchTab);
        grantAccessContainer.classList.remove("active");
        searchForm.classList.toggle("active", !isSearchTab);

        if (!isSearchTab) {
            getFromSessionStorage();
        }
    }
};

userTab.addEventListener("click", () => switchTab(userTab));
searchTab.addEventListener("click", () => switchTab(searchTab));

// Session Storage Management
const getFromSessionStorage = () => {
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if (!localCoordinates) {
        grantAccessContainer.classList.add("active");
    } else {
        const coordinates = JSON.parse(localCoordinates);
        fetchUser WeatherInfo(coordinates);
    }
};

// Fetch User Weather Info
const fetchUser WeatherInfo = async ({ lat, lon }) => {
    grantAccessContainer.classList.remove("active");
    loadingScreen.classList.add("active");

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        if (!response.ok) throw new Error('Failed to fetch weather data');
        const data = await response.json();
        renderWeatherInfo(data);
    } catch (err) {
        console.error(err);
        // Handle error (e.g., show an alert)
    } finally {
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
    }
};

// Render Weather Info
const renderWeatherInfo = ({ name, sys, weather, main, wind, clouds }) => {
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    cityName.innerText = name;
    countryIcon.src = `https://flagcdn.com/144x108/${sys.country.toLowerCase()}.png`;
    desc.innerText = weather[0].description;
    weatherIcon.src = `http://openweathermap.org/img/w/${weather[0].icon}.png`;
    temp.innerText = `${main.temp} °C`;
    windspeed.innerText = `${wind.speed} m/s`;
    humidity.innerText = `${main.humidity}%`;
    cloudiness.innerText = `${clouds.all}%`;
};

// Get User Location
const getLocation = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, handleLocationError);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
};

const showPosition = ({ coords: { latitude, longitude } }) => {
    const userCoordinates = { lat: latitude, lon: longitude };
    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUser WeatherInfo(userCoordinates);
};

const handleLocationError = () => {
    alert("Unable to retrieve your location.");
};

// Grant Access Button
grantAccessButton.addEventListener("click", getLocation);

// Search Weather by City
searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const cityName = searchInput.value.trim();
    if (cityName) {
        fetchSearchWeatherInfo(cityName);
    }
});

const fetchSearchWeatherInfo = async
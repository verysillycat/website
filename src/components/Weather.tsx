"use client";

import { useEffect, useState } from "react";
import {
	Sun,
	SunMedium,
	SunDim,
	Cloud,
	CloudSun,
	CloudRain,
	CloudRainWind,
	CloudSunRain,
	CloudSnow,
	CloudHail,
	CloudLightning,
	CloudFog,
	Cloudy,
	LucideIcon,
} from "lucide-react";

interface WeatherData {
	temp: string;
	condition: string;
}

interface WeatherState extends WeatherData {
	error: string | null;
	lastUpdated: Date | null;
}

const REFRESH_INTERVAL = 300000;

const WEATHER_ICONS: Record<string, { icon: LucideIcon; color: string }> = {
	clear: { icon: Sun, color: "text-yellow-300" },
	sunny: { icon: SunMedium, color: "text-yellow-300" },
	thunder: { icon: CloudLightning, color: "text-yellow-400" },
	"thunder-snow": { icon: CloudSnow, color: "text-blue-100" },
	blizzard: { icon: CloudSnow, color: "text-blue-100" },
	torrential: { icon: CloudRainWind, color: "text-blue-200" },
	fog: { icon: CloudFog, color: "text-gray-300" },
	"freezing-fog": { icon: CloudFog, color: "text-blue-100" },
	"heavy-rain": { icon: CloudRainWind, color: "text-blue-200" },
	"freezing-rain": { icon: CloudHail, color: "text-blue-100" },
	"light-rain": { icon: CloudSunRain, color: "text-blue-200" },
	rain: { icon: CloudRain, color: "text-blue-200" },
	"heavy-snow": { icon: CloudSnow, color: "text-blue-100" },
	"light-snow": { icon: CloudSnow, color: "text-gray-200" },
	snow: { icon: CloudSnow, color: "text-blue-100" }, // never snows but i keep dreaming
	"partly-cloudy": { icon: CloudSun, color: "text-gray-200" },
	overcast: { icon: Cloud, color: "text-gray-300" },
	cloudy: { icon: Cloudy, color: "text-gray-300" },
	default: { icon: SunDim, color: "text-gray-300" },
};

const WeatherSkeleton = () => {
	const [windowWidth, setWindowWidth] = useState(0);

	useEffect(() => {
		setWindowWidth(window.innerWidth);
		const handleResize = () => setWindowWidth(window.innerWidth);
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const showIconOnly = windowWidth < 415;

	return (
		<div
			className={`animate-pulse bg-white/5 backdrop-blur-sm px-3 py-1 rounded-2xl flex items-center gap-2 shadow-lg ${
				showIconOnly ? "w-[42px]" : "w-[80px]"
			}`}
		>
			<div className="w-4 h-4" />
			{!showIconOnly && <div className="h-4 w-[32px]" />}
		</div>
	);
};

const Weather = () => {
	const [weatherState, setWeatherState] = useState<WeatherState>({
		temp: "",
		condition: "",
		error: null,
		lastUpdated: null,
	});
	const [loading, setLoading] = useState(true);
	const [windowWidth, setWindowWidth] = useState(0);

	useEffect(() => {
		setWindowWidth(window.innerWidth);
		const handleResize = () => setWindowWidth(window.innerWidth);
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const fetchWeather = async () => {
		try {
			setLoading(true);
			const response = await fetch("https://wttr.in/Honduras?format=%t|%C");
			if (!response.ok) throw new Error("Weather service unavailable");

			const data = await response.text();
			const [temp, condition] = data.split("|");

			setWeatherState({
				temp: temp.replace("+", "").trim(),
				condition: condition.trim(),
				error: null,
				lastUpdated: new Date(),
			});
		} catch (error) {
			console.error("Error fetching weather:", error);
			setWeatherState((prev) => ({
				...prev,
				error: "Unable to fetch weather data",
			}));
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchWeather();
		const interval = setInterval(fetchWeather, REFRESH_INTERVAL);
		return () => clearInterval(interval);
	}, []);

	const showIconOnly = windowWidth < 415;

	if (loading) return <WeatherSkeleton />;
	if (weatherState.error) {
		return (
			<div className="bg-red-500/10 backdrop-blur-sm px-3 py-1 rounded-2xl flex items-center gap-2 shadow-lg">
				<span className="text-sm text-red-500">
					{windowWidth < 860 ? "Error" : weatherState.error}
				</span>
			</div>
		);
	}

	return (
		<div className="bg-white/5 backdrop-blur-sm px-3 py-1 rounded-2xl flex items-center gap-2 shadow-lg hover:bg-white/10 transition-all duration-300">
			<WeatherIcon condition={weatherState.condition} />
			{!showIconOnly && (
				<span className="text-sm font-medium">{weatherState.temp}</span>
			)}
		</div>
	);
};

const WeatherIcon = ({ condition }: { condition: string }) => {
	const getWeatherIcon = (condition: string) => {
		const lowercaseCondition = condition.toLowerCase();

		const matchedIcon =
			Object.entries(WEATHER_ICONS).find(([key]) =>
				lowercaseCondition.includes(key),
			)?.[1] ?? WEATHER_ICONS.default;

		const IconComponent = matchedIcon.icon;
		return <IconComponent className={`w-4 h-4 ${matchedIcon.color}`} />;
	};

	return getWeatherIcon(condition);
};
export default Weather;

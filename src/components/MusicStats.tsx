"use client";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardBody } from "@heroui/react";
import Image from "next/image";
import {
	AudioLines,
	UserRound,
	ArrowLeft,
	ArrowRight,
	Disc3,
} from "lucide-react";
import React from "react";

interface MusicStatsProps {
	isOpen: boolean;
	onClose: () => void;
}

interface Artist {
	position: number;
	artist: {
		name: string;
		image: string;
		genres: string[];
		id: string;
		spotifyPopularity: number;
	};
}

interface Track {
	position: number;
	track: {
		name: string;
		artists: { name: string }[];
		albums: { image: string }[];
		id: string;
		spotifyPopularity: number;
	};
}

interface LoadingState {
	loading: boolean;
	loaded: boolean;
}

const extractDominantColor = (imageData: Uint8ClampedArray) => {
	const colors = Array.from({ length: Math.floor(imageData.length / (4 * 10)) }, (_, i) => {
		const idx = i * 40;
		return [imageData[idx], imageData[idx + 1], imageData[idx + 2]];
	});

	const [avgR, avgG, avgB] = colors.reduce(
		([r, g, b], [cr, cg, cb]) => [r + cr, g + cg, b + cb],
		[0, 0, 0]
	).map(sum => Math.floor(sum / colors.length));

	const brightness = (0.299 * avgR + 0.587 * avgG + 0.114 * avgB) / 255;
	if (brightness < 0.4) {
		const adjustment = 0.5 / brightness;
		return {
			r: Math.min(255, Math.floor(avgR * adjustment)),
			g: Math.min(255, Math.floor(avgG * adjustment)),
			b: Math.min(255, Math.floor(avgB * adjustment))
		};
	}

	return { r: avgR, g: avgG, b: avgB };
};

const handleImageColorExtraction = (
	img: HTMLImageElement, 
	onColorExtracted: (color: string) => void
) => {
	const canvas = document.createElement("canvas");
	const ctx = canvas.getContext("2d");
	if (!ctx) return;

	const scale = Math.min(1, 100 / Math.max(img.width, img.height));
	canvas.width = img.width * scale;
	canvas.height = img.height * scale;

	ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
	const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
	const { r, g, b } = extractDominantColor(imageData);
	onColorExtracted(`rgb(${r}, ${g}, ${b})`);
};

export default function MusicStats({ isOpen, onClose }: MusicStatsProps) {
	const [artists, setArtists] = useState<Artist[]>([]);
	const [tracks, setTracks] = useState<Track[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState<"artists" | "tracks">("artists");
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 5;
	const [dominantColors, setDominantColors] = useState<Record<string, string>>({});
	const previousTab = useRef<"artists" | "tracks">("artists");
	const [animationDirection, setAnimationDirection] = useState<'left' | 'right' | null>(null);
	const [isPageChange, setIsPageChange] = useState(false);
	const [loadingStates, setLoadingStates] = useState<Record<string, LoadingState>>({});

	useEffect(() => {
		const timer = setTimeout(() => {
			previousTab.current = activeTab;
		}, 300);
		return () => clearTimeout(timer);
	}, [activeTab]);

	const fetchStats = async () => {
		try {
			setError(null);
			const res = await fetch("/api/stats");
			if (!res.ok) {
				throw new Error(`Error fetching music stats: ${res.status}`);
			}
			const data = await res.json();
			if (data.error) {
				throw new Error(data.error);
			}
			setArtists(data.artists.items.slice(0, 10));
			setTracks(data.tracks.items.slice(0, 10));
		} catch (error) {
			console.error("Failed to fetch music stats:", error);
			setError("Failed to load music stats. Please try again later.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (isOpen) {
			fetchStats();
			setCurrentPage(1);
		}
	}, [isOpen]);

	useEffect(() => {
		const handleEscapeKey = (event: KeyboardEvent) => {
			if (event.key === "Escape" && isOpen) {
				onClose();
			}
		};

		document.addEventListener("keydown", handleEscapeKey);
		return () => document.removeEventListener("keydown", handleEscapeKey);
	}, [isOpen, onClose]);

	const handleImageLoad = (item: Artist | Track) => {
		const itemKey = isArtist(item) 
			? `${item.artist.id}-${item.artist.image}`
			: `${item.track.id}-${item.track.albums[0]?.image}`;
		
		setLoadingStates(prev => ({ 
			...prev, 
			[itemKey]: { loading: false, loaded: true }
		}));
		
		const img = new window.Image();
		img.crossOrigin = "Anonymous";
		const imgSrc = isArtist(item) ? item.artist.image : item.track.albums[0].image;
		
		img.onload = () => {
			handleImageColorExtraction(img, (color) => {
				setDominantColors(prev => ({ ...prev, [itemKey]: color }));
			});
		};
		img.src = imgSrc;
	};

	const isArtist = (item: Artist | Track): item is Artist => {
		return "artist" in item;
	};

	const isTrack = (item: Artist | Track): item is Track => {
		return "track" in item;
	};

	const currentItems = React.useMemo(() => {
		const items = activeTab === "artists" ? artists : tracks;
		const startIndex = (currentPage - 1) * itemsPerPage;
		return items.slice(startIndex, startIndex + itemsPerPage);
	}, [activeTab, currentPage, artists, tracks]);

	const paginationInfo = React.useMemo(() => ({
		totalPages: Math.ceil((activeTab === "artists" ? artists.length : tracks.length) / itemsPerPage),
		canGoBack: currentPage > 1,
		canGoForward: currentPage < Math.ceil((activeTab === "artists" ? artists.length : tracks.length) / itemsPerPage)
	}), [activeTab, currentPage, artists.length, tracks.length]);

	useEffect(() => {
		const newLoadingStates: Record<string, LoadingState> = {};
		
		currentItems.forEach(item => {
			const key = isArtist(item) 
				? `${item.artist.id}-${item.artist.image}`
				: `${item.track.id}-${item.track.albums[0]?.image}`;
			
			if (!loadingStates[key]) {
				newLoadingStates[key] = { loading: true, loaded: false };
			}
		});

		if (Object.keys(newLoadingStates).length > 0) {
			setLoadingStates(prev => ({ ...prev, ...newLoadingStates }));
		}

		currentItems.forEach(item => {
			handleImageLoad(item);
		});
	}, [currentItems]);

	const handlePageChange = (newPage: number) => {
		setIsPageChange(true);
		setAnimationDirection(null);
		setCurrentPage(newPage);
	};

	const handleTabChange = (tab: "artists" | "tracks") => {
		setIsPageChange(false);
		const direction = tab === 'artists' ? 'left' : 'right';
		setAnimationDirection(direction);
		setActiveTab(tab);
		setCurrentPage(1);
	};

	if (!isOpen) return null;

	return (
		<AnimatePresence mode="popLayout">
			{isOpen && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{
						duration: 0.25,
						ease: [0.25, 0.8, 0.25, 1],
					}}
					className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-[10px]"
				>
					<motion.div
						className="absolute inset-0 bg-black bg-opacity-50"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{
							duration: 0.25,
							ease: [0.25, 0.8, 0.25, 1],
						}}
						onClick={onClose}
					/>
					<motion.div
						initial={{ scale: 0.98, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						exit={{ scale: 0.98, opacity: 0 }}
						transition={{
							duration: 0.25,
							ease: [0.25, 0.8, 0.25, 1],
						}}
						className="relative z-10 w-[95%] max-w-lg mx-auto"
					>
						<Card className="rounded-lg border border-zinc-800 relative overflow-hidden bg-zinc-900/90">
							<CardHeader className="relative z-10 flex justify-between items-center py-4.5 px-6">
								<Disc3 className="absolute left-4 top-5 w-5 h-5 text-zinc-500" />
								<button
									onClick={onClose}
									className="text-zinc-400 hover:text-white transition-colors absolute right-4 top-4"
								>
									<svg
										className="w-5 h-5"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M6 18L18 6M6 6l12 12"
										/>
									</svg>
								</button>
								<div className="flex flex-col items-center mx-auto w-full">
									<div className="flex gap-4">
										<button
											className={`px-4 py-2 rounded flex items-center gap-2 transition-colors ${
												activeTab === "artists"
													? "bg-[#B7B7B7]/15 text-white hover:bg-[#B7B7B7]/25"
													: "bg-[#B7B7B7]/5 hover:bg-[#B7B7B7]/15"
											}`}
											onClick={() => handleTabChange("artists")}
										>
											<UserRound className="w-4 h-4" />
											<span className="hidden zssm:block">Top Artists</span>
										</button>
										<button
											className={`px-4 py-2 rounded flex items-center gap-2 transition-colors ${
												activeTab === "tracks"
													? "bg-[#B7B7B7]/15 text-white hover:bg-[#B7B7B7]/30"
													: "bg-[#B7B7B7]/5 hover:bg-[#B7B7B7]/30"
											}`}
											onClick={() => handleTabChange("tracks")}
										>
											<AudioLines className="w-4 h-4" />
											<span className="hidden zssm:block">Top Tracks</span>
										</button>
									</div>
									<span className="text-xs text-zinc-500 mt-2 px-2 rounded-md bg-zinc-800/35">
										since 4 weeks
									</span>
								</div>
							</CardHeader>
							<div className="w-full h-px bg-gradient-to-r from-transparent via-zinc-700/50 to-transparent" />
							<CardBody className="relative px-6 py-3">
								{error ? (
									<div className="flex flex-col items-center justify-center py-8 text-center">
										<div className="text-red-400 mb-3">
											<svg
												className="w-12 h-12 mx-auto"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
												/>
											</svg>
										</div>
										<p className="text-zinc-300">{error}</p>
										<button
											onClick={() => {
												setLoading(true);
												setError(null);
												fetchStats();
											}}
											className="mt-4 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors"
										>
											Try Again
										</button>
									</div>
								) : loading ? (
									<>
										<div className="space-y-4">
											{[...Array(itemsPerPage)].map((_, index) => (
												<div key={index} className="flex items-center gap-2 py-1.5 mx-2">
													<span className="ml-2 text-lg font-bold w-4 flex items-center justify-center">
														<div className="w-4 h-6 bg-zinc-800/50 rounded animate-pulse" />
													</span>
													<div className="flex items-center gap-3 flex-1 px-1.5 w-full">
														<div className="w-12 h-12 bg-zinc-800/50 rounded-full animate-pulse" />
														<div className="flex-1 space-y-2">
															<div className="h-4 bg-zinc-800/50 rounded animate-pulse w-32" />
															<div className="h-3 bg-zinc-800/50 rounded animate-pulse w-48" />
														</div>
														<div className="flex flex-col items-end justify-center gap-0.5 pr-2">
															<div className="h-3 bg-zinc-800/50 rounded animate-pulse w-12" />
															<div className="flex items-center gap-1">
																<div className="w-14 h-1 bg-zinc-800/50 rounded-full animate-pulse" />
																<div className="w-4 h-3 bg-zinc-800/50 rounded animate-pulse" />
															</div>
														</div>
													</div>
												</div>
											))}
										</div>
										<div className="flex justify-center items-center gap-2 mt-6">
											<div className="w-8 h-8 bg-zinc-800/50 rounded animate-pulse" />
											<div className="w-16 h-8 bg-zinc-800/50 rounded animate-pulse" />
											<div className="w-8 h-8 bg-zinc-800/50 rounded animate-pulse" />
										</div>
									</>
								) : (
									<>
										<AnimatePresence mode="wait" initial={false}>
											<motion.div
												key={`${activeTab}-${currentPage}`}
												initial={{ 
													opacity: 0,
													x: isPageChange ? 0 : (animationDirection === 'left' ? 20 : -20),
													y: isPageChange ? 8 : 0
												}}
												animate={{ 
													opacity: 1,
													x: 0,
													y: 0
												}}
												exit={{ 
													opacity: 0,
													x: isPageChange ? 0 : (animationDirection === 'left' ? -20 : 20),
													y: isPageChange ? -8 : 0
												}}
												transition={{
													duration: 0.3,
													ease: [0.2, 0.0, 0.0, 1.0],
													opacity: { 
														duration: 0.2,
														ease: [0.4, 0.0, 0.2, 1.0]
													},
												}}
												className="space-y-3 overflow-hidden pt-2"
											>
												{activeTab === "artists"
													? currentItems.map((item) => {
															if (!isArtist(item)) return null;
															const artistKey = `${item.artist.id}-${item.artist.image}`;
															return (
																<a
																	href={`https://stats.fm/artist/${item.artist.id}`}
																	target="_blank"
																	rel="noopener noreferrer"
																	key={item.position}
																	className="flex items-center gap-2 group rounded-lg hover:ease-out will-change-transform hover:-translate-y-[1px] py-1.5 mx-2 border-2 [border-style:dashed] border-transparent hover:shadow-[0_8px_16px_-6px_rgba(0,0,0,0.2)] hover:shadow-zinc-900/20"
																	style={{
																		transition: `
																			transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1),
																			background-color 0.3s cubic-bezier(0.25, 0.8, 0.25, 1),
																			border-color 0.15s cubic-bezier(0.25, 0.8, 0.25, 1)
																		`,
																		backgroundColor: 'transparent',
																		borderColor: 'transparent'
																	}}
																	onMouseEnter={(e) => {
																		const element = e.currentTarget;
																		const color = dominantColors[artistKey] || 'rgb(128, 128, 128)';
																		const rgbaColor = color.replace('rgb', 'rgba').replace(')', ', 0.15)');
																		element.style.backgroundColor = rgbaColor;

																		const colorValues = color.match(/\d+/g);
																		const [r, g, b] = colorValues ? colorValues.map(Number) : [128, 128, 128];
																		const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
																		const borderColor = brightness > 0.5
																			? `rgba(${Math.max(0, r - 50)}, ${Math.max(0, g - 50)}, ${Math.max(0, b - 50)}, 0.2)`
																			: `rgba(${Math.min(255, r + 50)}, ${Math.min(255, g + 50)}, ${Math.min(255, b + 50)}, 0.2)`;
																		element.style.borderColor = borderColor;
																	}}
																	onMouseLeave={(e) => {
																		const element = e.currentTarget;
																		element.style.backgroundColor = 'transparent';
																		element.style.borderColor = 'transparent';
																	}}
																>
																	<span className="ml-2 text-lg font-bold w-4 flex items-center justify-center text-zinc-400 group-hover:text-[#c6c6c6] transition-colors">
																		{item.position}
																	</span>
																	<div className="flex items-center gap-3 flex-1 px-1.5 w-full">
																		<div className="relative w-12 h-12 rounded-full overflow-hidden">
																			{loadingStates[`${item.artist.id}-${item.artist.image}`]?.loading && (
																				<div className="absolute inset-0 skeleton-bg animate-pulse rounded-full" />
																			)}
																			<Image
																				src={item.artist.image}
																				alt={item.artist.name}
																				width={48}
																				height={48}
																				className={`rounded-full object-cover transition-opacity duration-300 ease-in-out ${
																					loadingStates[`${item.artist.id}-${item.artist.image}`]?.loaded 
																						? 'opacity-100' 
																						: 'opacity-0'
																				}`}
																				onLoad={() => handleImageLoad(item)}
																			/>
																		</div>
																		<div className="flex-1">
																			<h3 className="font-semibold group-hover:text-[#c6c6c6] transition-colors">
																				{item.artist.name}
																			</h3>
																			<p className="text-sm text-gray-500">
																				{item.artist.genres
																					.slice(0, 2)
																					.join("/")}
																			</p>
																		</div>
																		<div className="flex flex-col items-end justify-center gap-0.5 pr-2 ml-auto">
																			<span className="text-[10px] text-zinc-400">Popularity</span>
																			<div className="flex items-center gap-1">
																				<div 
																					className="w-14 h-1 rounded-full overflow-hidden"
																					style={{
																						backgroundColor: dominantColors[artistKey] 
																							? `${dominantColors[artistKey].replace('rgb', 'rgba').replace(')', ', 0.1')}`
																							: 'rgb(39, 39, 42)' // fallback to zinc-800
																					}}
																				>
																					<div 
																						className="h-full rounded-full transition-all duration-150"
																						style={{ 
																							width: `${item.artist.spotifyPopularity}%`,
																							backgroundColor: dominantColors[artistKey] || 'transparent'
																						}}
																					>
																						{!dominantColors[artistKey] && (
																							<div className="w-full h-full bg-gradient-to-r from-zinc-800/50 via-zinc-700/50 to-zinc-800/50 animate-pulse" />
																						)}
																					</div>
																				</div>
																				<span className="text-[10px] text-zinc-400 min-w-[2ch]">
																					{item.artist.spotifyPopularity}
																				</span>
																			</div>
																		</div>
																	</div>
																</a>
															);
														})
													: currentItems.map((item) => {
															if (!isTrack(item)) return null;
															const trackKey = `${item.track.id}-${item.track.albums[0]?.image}`;

															return (
																<a
																	href={`https://stats.fm/track/${item.track.id}`}
																	target="_blank"
																	rel="noopener noreferrer"
																	key={item.position}
																	className="flex items-center gap-2 group rounded-lg hover:ease-out will-change-transform hover:-translate-y-[1px] py-1.5 mx-2 border-2 [border-style:dashed] border-transparent hover:shadow-[0_8px_16px_-6px_rgba(0,0,0,0.2)] hover:shadow-zinc-900/20"
																	style={{
																		transition: `
																			transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1),
																			background-color 0.3s cubic-bezier(0.25, 0.8, 0.25, 1),
																			border-color 0.15s cubic-bezier(0.25, 0.8, 0.25, 1)
																		`,
																		backgroundColor: 'transparent',
																		borderColor: 'transparent'
																	}}
																	onMouseEnter={(e) => {
																		const element = e.currentTarget;
																		const color = dominantColors[trackKey] || 'rgb(128, 128, 128)';
																		const rgbaColor = color.replace('rgb', 'rgba').replace(')', ', 0.15)');
																		element.style.backgroundColor = rgbaColor;

																		const colorValues = color.match(/\d+/g);
																		const [r, g, b] = colorValues ? colorValues.map(Number) : [128, 128, 128];
																		const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
																		const borderColor = brightness > 0.5
																			? `rgba(${Math.max(0, r - 50)}, ${Math.max(0, g - 50)}, ${Math.max(0, b - 50)}, 0.2)`
																			: `rgba(${Math.min(255, r + 50)}, ${Math.min(255, g + 50)}, ${Math.min(255, b + 50)}, 0.2)`;
																		element.style.borderColor = borderColor;
																	}}
																	onMouseLeave={(e) => {
																		const element = e.currentTarget;
																		element.style.backgroundColor = 'transparent';
																		element.style.borderColor = 'transparent';
																	}}
																>
																	<span className="ml-2 text-lg font-bold w-4 flex items-center justify-center text-zinc-500 group-hover:text-[#c6c6c6] transition-colors">
																		{item.position}
																	</span>
																	<div className="flex items-center gap-3 flex-1 px-1.5 w-full">
																		<div className="relative w-12 h-12">
																			{loadingStates[`${item.track.id}-${item.track.albums[0]?.image}`]?.loading && (
																				<div className="absolute inset-0 skeleton-bg animate-pulse rounded" />
																			)}
																			<Image
																				src={item.track.albums[0].image}
																				alt={item.track.name}
																				width={48}
																				height={48}
																				className={`rounded object-cover transition-opacity duration-300 ease-in-out ${
																					loadingStates[`${item.track.id}-${item.track.albums[0]?.image}`]?.loaded 
																						? 'opacity-100' 
																						: 'opacity-0'
																				}`}
																				onLoad={() => handleImageLoad(item)}
																			/>
																		</div>
																		<div className="flex-1">
																			<h3 className="font-semibold group-hover:text-[#c6c6c6] transition-colors">
																				{item.track.name}
																			</h3>
																			<p className="text-sm text-gray-500">
																				{Array.from(
																					new Set(
																						item.track.artists.map(
																							(artist) => artist.name,
																						),
																					),
																				).reduce((acc, name, index, arr) => {
																					if (index === 0) return name;
																					if (index === arr.length - 1)
																						return `${acc} & ${name}`;
																					return `${acc}, ${name}`;
																				}, "")}
																			</p>
																		</div>
																		<div className="flex flex-col items-end justify-center gap-0.5 pr-2 ml-auto">
																			<span className="text-[10px] text-zinc-400">Popularity</span>
																			<div className="flex items-center gap-1">
																				<div 
																					className="w-14 h-1 rounded-full overflow-hidden"
																					style={{
																						backgroundColor: dominantColors[trackKey] 
																							? `${dominantColors[trackKey].replace('rgb', 'rgba').replace(')', ', 0.1')}`
																							: 'rgb(39, 39, 42)' // fallback to zinc-800
																					}}
																				>
																					<div 
																						className="h-full rounded-full transition-all duration-150"
																						style={{ 
																							width: `${item.track.spotifyPopularity}%`,
																							backgroundColor: dominantColors[trackKey] || 'transparent'
																						}}
																					>
																						{!dominantColors[trackKey] && (
																							<div className="w-full h-full bg-gradient-to-r from-zinc-800/50 via-zinc-700/50 to-zinc-800/50 animate-pulse" />
																						)}
																					</div>
																				</div>
																				<span className="text-[10px] text-zinc-400 min-w-[2ch]">
																					{item.track.spotifyPopularity}
																				</span>
																			</div>
																		</div>
																	</div>
																</a>
															);
														})}
											</motion.div>
										</AnimatePresence>
										<div className="flex justify-center items-center mt-3 gap-2">
											<button
												onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
												disabled={currentPage === 1}
												className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700/80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
											>
												<ArrowLeft className="w-4 h-4" />
											</button>
											<span className="text-sm px-2">
												{currentPage} of {paginationInfo.totalPages}
											</span>
											<button
												onClick={() => handlePageChange(Math.min(paginationInfo.totalPages, currentPage + 1))}
												disabled={currentPage === paginationInfo.totalPages}
												className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700/80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
											>
												<ArrowRight className="w-4 h-4" />
											</button>
										</div>
									</>
								)}
							</CardBody>
						</Card>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}

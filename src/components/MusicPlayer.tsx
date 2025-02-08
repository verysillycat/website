"use client";
import { Card, CardBody } from "@heroui/react";
import { motion } from "framer-motion";
import {
	Play,
	Pause,
	SkipBack,
	SkipForward,
	Volume2,
	Volume1,
	Volume,
	VolumeX,
} from "lucide-react";
import { useRef, useEffect, useState, useCallback } from "react";
import Image from "next/image";

interface Song {
	title: string;
	artist: string;
}

export default function MusicPlayer() {
	const audioRef = useRef<HTMLAudioElement>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [isMuted, setIsMuted] = useState(false);
	const [volume, setVolume] = useState(50);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [currentSongIndex, setCurrentSongIndex] = useState(0);
	const [songs, setSongs] = useState<Song[]>([]);

	const isDraggingProgress = useRef(false);
	const isDraggingVolume = useRef(false);

	const [isLoading, setIsLoading] = useState(false);
	const [isImageLoaded, setIsImageLoaded] = useState(false);
	const [hoverProgress, setHoverProgress] = useState(0);
	const [slideDirection, setSlideDirection] = useState(0);
	const [hoverVolume, setHoverVolume] = useState(0);

	const loadedImages = useRef<Record<string, boolean>>({});

	const shouldPlayAfterLoad = useRef(false);

	const [isMobile, setIsMobile] = useState(false);

	const currentSong =
		songs.length > 0
			? {
					...songs[currentSongIndex % songs.length],
					cover: `/songs/covers/${encodeURIComponent(songs[currentSongIndex].title)}.png`,
					file: `/songs/${encodeURIComponent(`${songs[currentSongIndex].artist} - ${songs[currentSongIndex].title}.mp3`)}`,
				}
			: {
					title: "Loading...",
					artist: "Please wait",
					file: null,
					cover: "",
				};

	useEffect(() => {
		setIsImageLoaded(!!loadedImages.current[currentSong.cover]);
	}, [currentSong.cover]);

	const handleImageLoad = () => {
		loadedImages.current[currentSong.cover] = true;
		setIsImageLoaded(true);
	};

	useEffect(() => {
		const loadSongs = async () => {
			setIsLoading(true);
			try {
				const response = await fetch("/api/songs");
				const songList = await response.json();
				setSongs(songList);
				setCurrentSongIndex(Math.floor(Math.random() * songList.length));
				if ('mediaSession' in navigator) {
					navigator.mediaSession.setActionHandler('previoustrack', playPreviousSong);
					navigator.mediaSession.setActionHandler('nexttrack', playNextSong);
				}
			} catch (error) {
				console.error("Error loading songs:", error);
			} finally {
				setIsLoading(false);
			}
		};

		loadSongs();
	}, [setSongs, setCurrentSongIndex]);
	useEffect(() => {
		if ('mediaSession' in navigator && currentSong) {
			navigator.mediaSession.metadata = new MediaMetadata({
				title: currentSong.title,
				artist: currentSong.artist,
				artwork: currentSong.cover ? [{ src: currentSong.cover }] : []
			});
		}
	}, [currentSong]);

	useEffect(() => {
		if (audioRef.current) {
			audioRef.current.volume = volume / 100;
			audioRef.current.muted = isMuted;
		}
	}, [volume, isMuted]);

	const togglePlayPause = useCallback(async () => {
		if (audioRef.current) {
			try {
				if (audioRef.current.paused) {
					await audioRef.current.play();
					setIsPlaying(true);
				} else {
					await audioRef.current.pause();
					setIsPlaying(false);
				}
			} catch (error) {
				console.error("Error playing/pausing audio:", error);
				setIsPlaying(false);
			}
		}
	}, [setIsPlaying]);

	const toggleMute = () => setIsMuted(!isMuted);

	const handleTimeUpdate = () => {
		if (audioRef.current) {
			setCurrentTime(audioRef.current.currentTime);
		}
	};

	const handleLoadedMetadata = () => {
		if (audioRef.current) {
			setDuration(audioRef.current.duration);
			if (shouldPlayAfterLoad.current) {
				audioRef.current.play().catch(error => console.error('Autoplay failed:', error));
				shouldPlayAfterLoad.current = false;
			} else if (isPlaying) {
				audioRef.current.play().catch(error => console.error('Autoplay failed:', error));
			}
		}
	};

	const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
		const rect = e.currentTarget.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const newVolume = Math.round((x / rect.width) * 100);
		setVolume(Math.max(0, Math.min(100, newVolume)));
	};

	const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
		if (audioRef.current) {
			const rect = e.currentTarget.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const maxTime = duration - 0.1;
			const newTime = Math.max(
				0,
				Math.min((x / rect.width) * duration, maxTime),
			);
			audioRef.current.currentTime = newTime;
			setCurrentTime(newTime);
		}
	};

	const playNextSong = useCallback(() => {
		if (songs.length > 0) {
			const wasPlaying = isPlaying;
			setSlideDirection(1);
			setCurrentSongIndex((prevIndex) => (prevIndex + 1) % songs.length);
			if (wasPlaying) {
				const playNewSong = () => {
					audioRef.current?.play().catch(error => console.error('Autoplay failed:', error));
					audioRef.current?.removeEventListener('loadedmetadata', playNewSong);
				};
				audioRef.current?.addEventListener('loadedmetadata', playNewSong);
			}
			setIsPlaying(wasPlaying);
			shouldPlayAfterLoad.current = wasPlaying;
		}
	}, [songs.length, isPlaying]);

	const playPreviousSong = useCallback(() => {
		if (songs.length > 0) {
			const wasPlaying = isPlaying;
			setSlideDirection(-1);
			setCurrentSongIndex((prevIndex) => (prevIndex - 1 + songs.length) % songs.length);
			if (wasPlaying) {
				const playNewSong = () => {
					audioRef.current?.play().catch(error => console.error('Autoplay failed:', error));
					audioRef.current?.removeEventListener('loadedmetadata', playNewSong);
				};
				audioRef.current?.addEventListener('loadedmetadata', playNewSong);
			}
			setIsPlaying(wasPlaying);
			shouldPlayAfterLoad.current = wasPlaying;
		}
	}, [songs.length, isPlaying]);

	useEffect(() => {
		if ('mediaSession' in navigator) {
			navigator.mediaSession.setActionHandler('previoustrack', playPreviousSong);
			navigator.mediaSession.setActionHandler('nexttrack', playNextSong);
			
			return () => {
				navigator.mediaSession.setActionHandler('previoustrack', null);
				navigator.mediaSession.setActionHandler('nexttrack', null);
			};
		}
	}, [playPreviousSong, playNextSong]);

	const formatTime = (totalSeconds: number) => {
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = Math.floor(totalSeconds % 60);
		return `${minutes}:${seconds.toString().padStart(2, "0")}`;
	};

	const handleMouseDown =
		(type: "progress" | "volume") => (e: React.MouseEvent<HTMLDivElement>) => {
			if (type === "progress") {
				isDraggingProgress.current = true;
				if (audioRef.current && isPlaying) {
					audioRef.current.pause();
				}
				handleProgressClick(e);
			} else {
				isDraggingVolume.current = true;
				handleVolumeChange(e);
			}
		};

	const handleMouseMove = useCallback(
		(e: PointerEvent) => {
			if (isDraggingProgress.current) {
				const progressBar = document.querySelector(".progress-bar");
				if (progressBar) {
					const rect = progressBar.getBoundingClientRect();
					const x = e.clientX - rect.left;
					const maxTime = duration - 0.1;
					const newTime = Math.max(
						0,
						Math.min((x / rect.width) * duration, maxTime),
					);
					if (audioRef.current) {
						audioRef.current.currentTime = newTime;
						setCurrentTime(newTime);
						if (isPlaying && newTime === 0) {
							audioRef.current.play();
						}
					}
				}
			} else if (isDraggingVolume.current) {
				const volumeBar = document.querySelector(".volume-bar");
				if (volumeBar) {
					const rect = volumeBar.getBoundingClientRect();
					const x = e.clientX - rect.left;
					const newVolume = Math.max(
						0,
						Math.min(Math.round((x / rect.width) * 100), 100),
					);
					setVolume(newVolume);
				}
			}
		},
		[
			duration,
			isDraggingProgress,
			isDraggingVolume,
			audioRef,
			setCurrentTime,
			setVolume,
			isPlaying,
		],
	);

	const handleMouseUp = useCallback(() => {
		if (isDraggingProgress.current) {
			if (audioRef.current && isPlaying) {
				audioRef.current.play();
			}
			isDraggingProgress.current = false;
		}
		isDraggingVolume.current = false;
	}, [isPlaying]);

	useEffect(() => {
		document.addEventListener("pointermove", handleMouseMove);
		document.addEventListener("pointerup", handleMouseUp);

		return () => {
			document.removeEventListener("pointermove", handleMouseMove);
			document.removeEventListener("pointerup", handleMouseUp);
		};
	}, [duration, handleMouseMove, handleMouseUp]);

	const handleProgressHover = (e: React.MouseEvent<HTMLDivElement>) => {
		const rect = e.currentTarget.getBoundingClientRect();
		const x = e.clientX - rect.left;
		setHoverProgress((x / rect.width) * 100);
	};

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.code === "Space") {
				event.preventDefault();
				togglePlayPause();
			}
		};

		window.addEventListener("keydown", handleKeyDown);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [togglePlayPause]);

	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.matchMedia("(max-width: 640px)").matches);
		};
		checkMobile();
		window.addEventListener('resize', checkMobile);
		return () => window.removeEventListener('resize', checkMobile);
	}, []);

	const handleVolumeHover = (e: React.MouseEvent<HTMLDivElement>) => {
		const rect = e.currentTarget.getBoundingClientRect();
		const x = e.clientX - rect.left;
		setHoverVolume((x / rect.width) * 100);
	};

	return (
		<motion.div
			className="pt-2.5"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.25, ease: "easeInOut" }}
		>
			{currentSong.file && (
				<audio
					ref={audioRef}
					src={currentSong.file}
					onTimeUpdate={handleTimeUpdate}
					onLoadedMetadata={handleLoadedMetadata}
					onEnded={playNextSong}
					onError={(e) => console.error("Audio playback error:", e)}
				/>
			)}
			<Card className="bg-black/35 backdrop-blur-md border border-[#dbdbdb]/20 rounded-lg w-[90%] max-w-md mx-auto h-auto transition-all duration-300 hover:shadow-[0_0_5px_rgba(22,22,22,15)] hover:border-opacity-30 hover:scale-[1.02] hover:backdrop-filter-none">
				<CardBody className="p-2">
					<div className="flex items-start gap-3">
						{isLoading ? (
							<div className="skeleton-bg animate-pulse rounded-lg w-12 h-12" />
						) : currentSong.cover ? (
							<motion.div
								key={currentSongIndex}
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ duration: 0.3, ease: "easeOut" }}
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								className="relative h-12 w-12 rounded-lg overflow-hidden transition-transform duration-300 ease-in-out hover:scale-105"
							>
								{!isImageLoaded && (
									<div className="absolute inset-0 skeleton-bg animate-pulse" />
								)}
								<Image
									src={currentSong.cover}
									alt="Album Art"
									className="object-cover relative z-10 transition-opacity duration-300 ease-in-out"
									style={{ opacity: isImageLoaded ? 1 : 0 }}
									onLoad={handleImageLoad}
									fill
									sizes="48px"
									priority
								/>
							</motion.div>
						) : (
							<div className="skeleton-bg animate-pulse rounded-lg w-12 h-12" />
						)}

						<div className="flex-1 min-w-0 space-y-2">
							{isLoading ? (
								<div className="space-y-3">
									<div className="flex items-start gap-3">
										<div className="flex-1 space-y-3">
											<div className="flex gap-2 items-center">
												<div className="skeleton-bg animate-pulse h-2.5 w-24 rounded-full" />
												<div className="skeleton-bg animate-pulse h-2.5 w-32 rounded-full" />
											</div>

											<div className="flex items-center gap-3">
												<div className="flex items-center gap-3">
													{[1, 2, 3].map((i) => (
														<div
															key={i}
															className="skeleton-bg animate-pulse w-4 h-4 rounded-full"
														/>
													))}
												</div>

												<div className="flex-1 flex items-center gap-2">
													<div className="skeleton-bg animate-pulse h-2 w-8 rounded-full" />
													<div className="skeleton-bg animate-pulse h-2 flex-1 rounded-full" />
													<div className="skeleton-bg animate-pulse h-2 w-8 rounded-full" />
												</div>

												{!isMobile && (
													<div className="flex items-center gap-2">
														<div className="skeleton-bg animate-pulse w-4 h-4 rounded-full" />
														<div className="skeleton-bg animate-pulse h-2 w-16 rounded-full" />
													</div>
												)}
												{isMobile && (
													<div className="skeleton-bg animate-pulse w-4 h-4 rounded-full" />
												)}
											</div>
										</div>
									</div>
								</div>
							) : (
								<>
									<motion.div
										key={currentSongIndex}
										initial={{ x: 10 * slideDirection, opacity: 0, y: 0 }}
										animate={{ x: 0, opacity: 1, y: 0 }}
										transition={{ duration: 0.3, ease: "easeOut" }}
										onAnimationComplete={() => setSlideDirection(0)}
										className="overflow-hidden"
									>
										<div className="flex items-center gap-2 min-w-0">
											<span className="truncate text-sm text-white flex-shrink min-w-0">
												{currentSong.title}
											</span>
											<span className="text-zinc-400 text-sm flex-shrink-0">
												•
											</span>
											<span className="truncate text-sm text-zinc-400 flex-shrink min-w-0">
												{currentSong.artist}
											</span>
										</div>
									</motion.div>

									<div className="flex items-center gap-3">
										<div className="flex items-center gap-3">
											<motion.button
												whileHover={{ scale: 1.1 }}
												whileTap={{ scale: 0.9 }}
												className="text-zinc-400 hover:text-zinc-200 hover:filter hover:drop-shadow-[0_0_2px_rgba(255,255,255,0.5)] transition-all"
												onClick={playPreviousSong}
											>
												<SkipBack className="h-4 w-4" />
											</motion.button>
											<motion.button
												whileHover={{ scale: 1.1 }}
												whileTap={{ scale: 0.9 }}
												className="text-zinc-400 hover:text-zinc-200 hover:filter hover:drop-shadow-[0_0_2px_rgba(255,255,255,0.5)] transition-all"
												onClick={togglePlayPause}
											>
												{audioRef.current && !audioRef.current.paused ? (
													<Pause className="h-4 w-4" />
												) : (
													<Play className="h-4 w-4" />
												)}
											</motion.button>
											<motion.button
												whileHover={{ scale: 1.1 }}
												whileTap={{ scale: 0.9 }}
												className="text-zinc-400 hover:text-zinc-200 hover:filter hover:drop-shadow-[0_0_2px_rgba(255,255,255,0.5)] transition-all"
												onClick={playNextSong}
											>
												<SkipForward className="h-4 w-4" />
											</motion.button>
										</div>

										<div className={`flex-1 ${isMobile ? 'pr-8' : ''}`}>
											<div className="group relative h-6 flex items-center select-none">
												<div className="flex items-center w-full">
													<span className="mr-2 text-xs text-zinc-400">
														{formatTime(currentTime)}
													</span>
													<div className="relative flex-1 progress-bar">
														<div
															className="absolute inset-0 -top-2 -bottom-2 cursor-pointer"
															onClick={handleProgressClick}
															onMouseDown={handleMouseDown("progress")}
															onMouseMove={handleProgressHover}
															onMouseLeave={() => setHoverProgress(0)}
														></div>
														<div className="h-[2px] w-full bg-zinc-800 rounded-full overflow-hidden">
															<div
																className="absolute h-full bg-white/10 rounded-full transition-all duration-100 ease-in-out"
																style={{ width: `${hoverProgress}%` }}
															/>
															<div
																className="h-full transition-[width] duration-75 bg-white rounded-full"
																style={{
																	width: `${(currentTime / duration) * 100}%`,
																}}
															/>
														</div>
													</div>
													<span className="ml-2 text-xs text-zinc-400">
														{formatTime(duration)}
													</span>
												</div>
											</div>
										</div>

										{!isLoading && isMobile ? (
											<div className="group flex items-center gap-2">
												<motion.button
													whileHover={{ scale: 1.1 }}
													whileTap={{ scale: 0.9 }}
													className="text-zinc-400 hover:text-zinc-200 hover:filter hover:drop-shadow-[0_0_2px_rgba(255,255,255,0.5)] transition-all"
													onClick={toggleMute}
												>
													{isMuted ? (
														<VolumeX className="h-4 w-4" />
													) : volume === 0 ? (
														<VolumeX className="h-4 w-4" />
													) : volume < 30 ? (
														<Volume className="h-4 w-4" />
													) : volume < 60 ? (
														<Volume1 className="h-4 w-4" />
													) : (
														<Volume2 className="h-4 w-4" />
													)}
												</motion.button>
												<motion.div
													whileHover={{ scale: 1.05 }}
													className="w-16 opacity-0 scale-95 hover:opacity-100 hover:scale-100 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 ease-in-out"
												>
													<div className="group relative h-6 flex items-center select-none">
														<div className="flex items-center w-full">
															<div className="relative flex-1 volume-bar">
																<div
																	className="absolute inset-0 -top-2 -bottom-2 cursor-pointer"
																	onClick={handleVolumeChange}
																	onMouseDown={handleMouseDown("volume")}
																	onMouseMove={handleVolumeHover}
																	onMouseLeave={() => setHoverVolume(0)}
																></div>
																<div className="h-[2px] w-full bg-zinc-800 rounded-full overflow-hidden">
																	<div
																		className="absolute h-full bg-white/10 rounded-full transition-all duration-300 ease-in-out"
																		style={{ width: `${hoverVolume}%` }}
																	/>
																	<div
																		className="relative h-full transition-[width] duration-75 bg-zinc-400 rounded-full"
																		style={{ width: `${volume}%` }}
																	></div>
																</div>
															</div>
															<span className="ml-2 text-xs text-zinc-400">
																{volume}%
															</span>
														</div>
													</div>
												</motion.div>
											</div>
										) : (
											<div className="group flex items-center gap-2">
												<motion.button
													whileHover={{ scale: 1.1 }}
													whileTap={{ scale: 0.9 }}
													className="text-zinc-400 hover:text-zinc-200 hover:filter hover:drop-shadow-[0_0_2px_rgba(255,255,255,0.5)] transition-all"
													onClick={toggleMute}
												>
													{isMuted ? (
														<VolumeX className="h-4 w-4" />
													) : volume === 0 ? (
														<VolumeX className="h-4 w-4" />
													) : volume < 30 ? (
														<Volume className="h-4 w-4" />
													) : volume < 60 ? (
														<Volume1 className="h-4 w-4" />
													) : (
														<Volume2 className="h-4 w-4" />
													)}
												</motion.button>
												<motion.div
													whileHover={{ scale: 1.05 }}
													className="w-16 opacity-0 scale-95 hover:opacity-100 hover:scale-100 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 ease-in-out"
												>
													<div className="group relative h-6 flex items-center select-none">
														<div className="flex items-center w-full">
															<div className="relative flex-1 volume-bar">
																<div
																	className="absolute inset-0 -top-2 -bottom-2 cursor-pointer"
																	onClick={handleVolumeChange}
																	onMouseDown={handleMouseDown("volume")}
																	onMouseMove={handleVolumeHover}
																	onMouseLeave={() => setHoverVolume(0)}
																></div>
																<div className="h-[2px] w-full bg-zinc-800 rounded-full overflow-hidden">
																	<div
																		className="absolute h-full bg-white/10 rounded-full transition-all duration-300 ease-in-out"
																		style={{ width: `${hoverVolume}%` }}
																	/>
																	<div
																		className="relative h-full transition-[width] duration-75 bg-zinc-400 rounded-full"
																		style={{ width: `${volume}%` }}
																	></div>
																</div>
															</div>
															<span className="ml-2 text-xs text-zinc-400">
																{volume}%
															</span>
														</div>
													</div>
												</motion.div>
											</div>
										)}
									</div>
								</>
							)}
						</div>
					</div>
				</CardBody>
			</Card>
		</motion.div>
	);
}

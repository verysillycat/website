"use client";
import { useEffect, useState } from "react";
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
	};
}

interface Track {
	position: number;
	track: {
		name: string;
		artists: { name: string }[];
		albums: { image: string }[];
		id: string;
	};
}

export default function MusicStats({ isOpen, onClose }: MusicStatsProps) {
	const [artists, setArtists] = useState<Artist[]>([]);
	const [tracks, setTracks] = useState<Track[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState<"artists" | "tracks">("artists");
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 5;
	const [loadingImages, setLoadingImages] = useState<Record<number, boolean>>(
		{},
	);

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

	const getCurrentItems = () => {
		const items = activeTab === "artists" ? artists : tracks;
		const startIndex = (currentPage - 1) * itemsPerPage;
		const endIndex = startIndex + itemsPerPage;
		return items.slice(startIndex, endIndex);
	};

	const totalPages = Math.ceil(
		(activeTab === "artists" ? artists.length : tracks.length) / itemsPerPage,
	);

	useEffect(() => {
		setCurrentPage(1);
	}, [activeTab]);

	const handleImageLoad = (position: number) => {
		setLoadingImages((prev) => ({ ...prev, [position]: false }));
	};

	const isArtist = (item: Artist | Track): item is Artist => {
		return "artist" in item;
	};

	const isTrack = (item: Artist | Track): item is Track => {
		return "track" in item;
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
							<CardHeader className="relative z-10 flex justify-between items-center py-5 px-6">
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
											onClick={() => setActiveTab("artists")}
										>
											<UserRound className="w-4 h-4" />
											Top Artists
										</button>
										<button
											className={`px-4 py-2 rounded flex items-center gap-2 transition-colors ${
												activeTab === "tracks"
													? "bg-[#B7B7B7]/15 text-white hover:bg-[#B7B7B7]/30"
													: "bg-[#B7B7B7]/5 hover:bg-[#B7B7B7]/30"
											}`}
											onClick={() => setActiveTab("tracks")}
										>
											<AudioLines className="w-4 h-4" />
											Top Tracks
										</button>
									</div>
									<span className="text-xs text-zinc-500 mt-2 px-2 rounded-md bg-zinc-800/35">
										since 4 weeks
									</span>
								</div>
							</CardHeader>
							<div className="w-full h-px bg-gradient-to-r from-transparent via-zinc-700/50 to-transparent my-2" />
							<CardBody className="relative px-6">
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
												<div key={index} className="flex items-center gap-4">
													<div className="w-8 h-8 bg-zinc-800/50 rounded-full animate-pulse" />
													<div className="w-12 h-12 bg-zinc-800/50 rounded-full animate-pulse" />
													<div className="flex-1 space-y-2">
														<div className="h-4 bg-zinc-800/50 rounded animate-pulse w-32" />
														<div className="h-3 bg-zinc-800/50 rounded animate-pulse w-48" />
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
												initial={{ opacity: 0, x: 20 }}
												animate={{ opacity: 1, x: 0 }}
												exit={{ opacity: 0, x: -20 }}
												transition={{ duration: 0.2 }}
												className="space-y-4 overflow-hidden pt-2"
											>
												{activeTab === "artists"
													? getCurrentItems().map((item) => {
															if (!isArtist(item)) return null;
															return (
																<div
																	key={item.position}
																	className="flex items-center gap-3 group"
																>
																	<span className="ml-1.5 mr-1 text-lg font-bold w-4 flex items-center text-zinc-500 group-hover:text-[#c6c6c6] transition-colors">
																		{item.position}
																	</span>
																	<a
																		href={`https://stats.fm/artist/${item.artist.id}`}
																		target="_blank"
																		rel="noopener noreferrer"
																		className="flex items-center gap-4 flex-1 p-2 -m-2 rounded-lg transition-all duration-200 group-hover:bg-zinc-800/50 group-hover:shadow-lg group-hover:-translate-y-0.5"
																	>
																		<div className="relative w-12 h-12">
																			{loadingImages[item.position] !==
																				false && (
																				<div className="absolute inset-0 bg-zinc-800/50 rounded-full animate-pulse" />
																			)}
																			<Image
																				src={item.artist.image}
																				alt={item.artist.name}
																				width={48}
																				height={48}
																				className="rounded-full object-cover aspect-square"
																				onLoad={() =>
																					handleImageLoad(item.position)
																				}
																			/>
																		</div>
																		<div className="flex-1">
																			<h3 className="font-semibold group-hover:text-[#c6c6c6] transition-colors">
																				{item.artist.name}
																			</h3>
																			<p className="text-sm text-gray-500">
																				{item.artist.genres
																					.slice(0, 2)
																					.join(" & ")}
																			</p>
																		</div>
																	</a>
																</div>
															);
														})
													: getCurrentItems().map((item) => {
															if (!isTrack(item)) return null;
															return (
																<div
																	key={item.position}
																	className="flex items-center gap-3 group"
																>
																	<span className="ml-1.5 mr-1 text-lg font-bold w-4 flex items-center text-zinc-500 group-hover:text-[#c6c6c6] transition-colors">
																		{item.position}
																	</span>
																	<a
																		href={`https://stats.fm/track/${item.track.id}`}
																		target="_blank"
																		rel="noopener noreferrer"
																		className="flex items-center gap-4 flex-1 p-2 -m-2 rounded-lg transition-all duration-200 group-hover:bg-zinc-800/50 group-hover:shadow-lg group-hover:-translate-y-0.5"
																	>
																		<div className="relative w-12 h-12">
																			{loadingImages[item.position] !==
																				false && (
																				<div className="absolute inset-0 bg-zinc-800/50 rounded animate-pulse" />
																			)}
																			<Image
																				src={item.track.albums[0].image}
																				alt={item.track.name}
																				width={48}
																				height={48}
																				className="rounded"
																				onLoad={() =>
																					handleImageLoad(item.position)
																				}
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
																	</a>
																</div>
															);
														})}
											</motion.div>
										</AnimatePresence>

										<div className="flex justify-center items-center gap-2 mt-6">
											<button
												onClick={() =>
													setCurrentPage((p) => Math.max(1, p - 1))
												}
												disabled={currentPage === 1}
												className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700/80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
											>
												<ArrowLeft className="w-4 h-4" />
											</button>
											<span className="text-sm px-2">
												{currentPage} of {totalPages}
											</span>
											<button
												onClick={() =>
													setCurrentPage((p) => Math.min(totalPages, p + 1))
												}
												disabled={currentPage === totalPages}
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

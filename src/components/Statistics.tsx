"use client";
import { Card, CardHeader, CardBody } from "@heroui/react";
import { motion } from "framer-motion";
import { TextFade } from "../app/structure/TextFade";
import { useState, useEffect, useRef } from "react";
import { useInview } from "../lib/animateInscroll";
import { Icon } from "@iconify/react";

export default function Statistics() {
	const ref = useRef<HTMLDivElement>(null);
	const isInView = useInview(ref);
	const [contributions, setContributions] = useState([]);
	const [total, setTotal] = useState(0);
	const [months, setMonths] = useState<string[]>([]);
	const [loading, setLoading] = useState(true);
	const [languages, setLanguages] = useState<{ [key: string]: number }>({});

	useEffect(() => {
		const getLastTwelveMonths = () => {
			const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
			const current = new Date();
			const months = [];
			
			const startMonth = current.getMonth();
			for (let i = 0; i <= 12; i++) {
				const monthIndex = (startMonth + i) % 12;
				months.push(monthNames[monthIndex]);
			}
			
			return months;
		};

		setMonths(getLastTwelveMonths());
		
		fetch('/api/stats')
			.then(res => res.json())
			.then(data => {
				setContributions(data.contributions);
				setTotal(data.total);
				setLanguages(data.languages);
				setLoading(false);
			})
			.catch(error => {
				console.error('Error fetching GitHub data:', error);
				setLoading(false);
			});
	}, []);

	if (loading) {
		return (
			<div 
				ref={ref}
				className="flex flex-col items-center justify-center min-h-[25vh] py-12"
			>
				<motion.div
					initial={{ opacity: 0, y: -5 }}
					animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -5 }}
					transition={{ duration: 0.2, ease: "easeInOut" }}
				>
					<TextFade words="Statistics" className="mb-3.5 text-2xl font-bold text-white/90" duration={1}/>
				</motion.div>
				
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
					transition={{ duration: 0.5, ease: "easeInOut" }}
				>
					<Card className="w-full max-w-[95vw] md:w-auto bg-black bg-opacity-25 backdrop-blur-[1.5px] border border-[#999a9e]/75 rounded-md">
						<CardHeader className="px-2 md:px-4 pt-2 md:pt-4 flex gap-3 justify-between items-center">
							<div className="flex items-center gap-3">
								<div className="h-7 w-64 bg-white/10 animate-pulse rounded-2xl" />
								<div className="h-4 w-4 bg-white/10 animate-pulse rounded-full" />
							</div>
							<div className="h-7 w-32 bg-white/10 animate-pulse rounded-2xl" />
						</CardHeader>
						<CardBody>
							<div className="w-full">
								<div className="border border-white/[0.03] bg-white/[0.01] backdrop-blur-sm rounded-2xl shadow-lg p-4">
									<div className="flex gap-2">
										<div className="flex flex-col justify-between pt-6 pb-2 space-y-8">
											<div className="h-3 w-6 bg-white/10 animate-pulse rounded" />
											<div className="h-3 w-6 bg-white/10 animate-pulse rounded" />
											<div className="h-3 w-6 bg-white/10 animate-pulse rounded" />
										</div>
										<div className="w-full min-w-[750px]">
											<div className="flex justify-between mb-2">
												{[...Array(12)].map((_, i) => (
													<div key={i} className="h-3 w-6 bg-white/10 animate-pulse rounded" />
												))}
											</div>
											<div className="grid grid-flow-col auto-cols-min grid-rows-[repeat(7,_minmax(0,_1fr))] gap-1 md:gap-[3.5px]">
												{[...Array(371)].map((_, i) => (
													<div key={i} className="h-3 w-3 bg-white/10 animate-pulse rounded-sm" />
												))}
											</div>
										</div>
									</div>
								</div>
							</div>
							<div className="mt-4 border border-white/[0.03] bg-white/[0.01] backdrop-blur-sm rounded-2xl p-4">
								<div className="flex flex-col gap-2">
									{[...Array(5)].map((_, i) => (
										<div key={i} className="flex items-center gap-2">
											<div className="h-3 w-20 bg-white/10 animate-pulse rounded" />
											<div className="flex-1 h-3 bg-white/10 animate-pulse rounded-full" />
											<div className="h-3 w-10 bg-white/10 animate-pulse rounded" />
										</div>
									))}
								</div>
							</div>
						</CardBody>
					</Card>
				</motion.div>
			</div>
		);
	}

	return (
		<div 
			ref={ref}
			className="flex flex-col items-center justify-center min-h-[25vh] py-12"
		>
			<motion.div
				initial={{ opacity: 0, y: -5 }}
				animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -5 }}
				transition={{ duration: 0.2, ease: "easeInOut" }}
			>
				<TextFade words="Statistics" className="mb-3.5 text-2xl font-bold text-white/90" duration={1}/>
			</motion.div>

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
				transition={{ duration: 0.5, ease: "easeInOut" }}
			>
				<Card className="w-full max-w-[95vw] md:w-auto bg-black bg-opacity-25 backdrop-blur-[1.5px] border border-[#999a9e]/75 rounded-md relative overflow-visible z-0 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:shadow-[0_0_10px_rgba(35,32,32,15)] hover:border-opacity-60 hover:scale-[1.02] hover:backdrop-blur-none">
					<CardHeader className="px-2 md:px-4 pt-2 md:pt-4 flex gap-3 justify-between items-center relative z-[-1]">
						<div className="flex items-center gap-3">
							<motion.div
								whileHover={{
									scale: 1.03,
								}}
								whileTap={{ scale: 0.98 }}
								transition={{
									duration: 0.2,
									ease: "easeInOut",
								}}
								className="text-xs md:text-sm text-white/80 inline-flex items-center px-2 py-1 border border-white/[0.03] bg-white/[0.01] backdrop-blur-sm rounded-2xl shadow-lg"
							>
								<div className="flex items-center gap-1">
									<span className="font-medium">{total}</span>
									<span>Contributions in the last year</span>
								</div>
							</motion.div>
							<motion.div
								whileHover={{
									scale: 1.1,
								}}
								transition={{
									duration: 0.2,
									ease: "easeInOut",
								}}
							>
								<div className="group relative">
									<Icon 
										icon="material-symbols:info-outline-rounded"
										className="w-4 h-4 -ml-1 text-white/60 hover:text-white/80 transition-colors duration-200 self-center cursor-help"
									/>
									<div className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 hidden group-hover:block z-50">
										<div className="relative bg-zinc-950/95 border border-white/10 text-white/90 text-xs px-2 py-1 rounded-md whitespace-nowrap shadow-xl">
											All GitHub activity across public repositories
										</div>
									</div>
								</div>
							</motion.div>
						</div>
						<div className="flex items-center gap-2">
							<motion.div
								whileHover={{
									scale: 1.03,
								}}
								whileTap={{ scale: 0.98 }}
								transition={{
									duration: 0.2,
									ease: "easeInOut",
								}}
								className="border border-white/[0.03] non-selectable flex items-center gap-2 text-xs text-gray-400 bg-white/[0.01] backdrop-blur-sm px-2 py-1 rounded-2xl shadow-lg"
							>
								<span>Less</span>
								<div className="flex gap-1">
									{[0, 1, 2, 3, 4].map((level) => (
										<div
											key={level}
											className={`h-2.5 w-2.5 rounded-sm ${
												[
													'bg-white/10',
													'bg-white/25',
													'bg-white/50',
													'bg-white/75',
													'bg-white/90',
												][level]
											}`}
										/>
									))}
								</div>
								<span>More</span>
							</motion.div>
						</div>
					</CardHeader>
					<CardBody>
						<div className="w-full">
							<div className="w-full overflow-visible">
								<motion.div
									whileHover={{
										scale: 1.005,
										boxShadow: "0 0 2px rgba(255, 255, 255, 0.08)",
									}}
									whileTap={{ scale: 0.98 }}
									transition={{
										type: "tween",
										ease: [0.4, 0, 0.2, 1],
										duration: 0.3,
									}}
									className="relative border border-white/[0.03] bg-white/[0.01] backdrop-blur-sm rounded-2xl shadow-lg p-4 overflow-visible z-[1]"
								>
									<div className="overflow-x-auto pb-2 custom-scrollbar">
										<div className="min-w-[750px]">
											<div className="flex gap-2">
												<div className="flex flex-col justify-between pt-6 pb-2 text-[10px] md:text-xs text-gray-400">
													<span>Mon</span>
													<span>Wed</span>
													<span>Fri</span>
												</div>
												<div className="w-full relative" style={{ zIndex: 10 }}>
													<div className="flex justify-between mb-2">
														{months.map((month) => (
															<span key={month} className="text-[10px] md:text-xs text-gray-400">{month}</span>
														))}
													</div>
													<div className="grid grid-flow-col auto-cols-min grid-rows-[repeat(7,_minmax(0,_1fr))] gap-1 md:gap-[3.5px]">
														{contributions.map(({ date, level, count }) => (
															<motion.div
																key={date}
																className="relative"
															>
																<div className={`group relative h-3 w-3 rounded-sm ${
																	[
																		'bg-white/10 hover:bg-white/15',    
																		'bg-white/25 hover:bg-white/30',    
																		'bg-white/50 hover:bg-white/55',    
																		'bg-white/75 hover:bg-white/80',    
																		'bg-white/90 hover:bg-white/95',    
																	][level]
																}`}>
																	<div className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 hidden group-hover:block" style={{ position: 'fixed' }}>
																		<div className="relative bg-zinc-950/95 border border-white/10 text-white/90 text-xs px-2 py-1 rounded-md whitespace-nowrap shadow-xl">
																			{(() => {
																				const day = new Date(date).getDate();
																				const suffix = day % 10 === 1 && day !== 11 
																					? 'st'
																					: day % 10 === 2 && day !== 12
																					? 'nd' 
																					: day % 10 === 3 && day !== 13
																					? 'rd'
																					: 'th';
																				const formattedDate = new Date(date).toLocaleDateString('en-US', { 
																					month: 'long',
																					day: 'numeric'
																				}) + suffix;
																				return count === 1
																					? `1 contribution on ${formattedDate}`
																					: `${count} contributions on ${formattedDate}`;
																			})()}
																		</div>
																	</div>
																</div>
															</motion.div>
														))}
													</div>
												</div>
											</div>
										</div>
									</div>
								</motion.div>
							</div>
						</div>
						<motion.div
							whileHover={{ scale: 1.005 }}
							className="mt-4 border border-white/[0.03] bg-white/[0.01] backdrop-blur-sm rounded-2xl p-4"
						>
							<div className="flex flex-col gap-2">
								{(() => {
									const totalBytes = Object.values(languages).reduce((a, b) => a + b, 0);
									return Object.entries(languages)
										.sort(([,a], [,b]) => b - a)
										.filter(([, bytes]) => (bytes / totalBytes) * 100 >= 1)
										.map(([lang, bytes]) => {
											const percentage = (bytes / totalBytes) * 100;
											return (
												<div key={lang} className="flex items-center gap-2">
													<span className="text-xs text-white/60 w-20 truncate">{lang}</span>
													<div className="flex-1 h-3 bg-white/10 hover:bg-white/15 rounded-full overflow-hidden">
														<motion.div 
															className="h-full bg-white/80 rounded-full"
															initial={{ width: "0%" }}
															animate={{ width: `${percentage}%` }}
															transition={{
																duration: 1.2,
																ease: [0.4, 0, 0.2, 1],
															}}
															style={{ originX: 1 }}
														/>
													</div>
													<span className="text-xs text-white/60 w-10 text-right">
														{percentage.toFixed(1)}%
													</span>
												</div>
											);
										});
								})()}
							</div>
						</motion.div>
					</CardBody>
				</Card>
			</motion.div>
		</div>
	);
}

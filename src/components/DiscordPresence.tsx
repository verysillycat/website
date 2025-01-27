import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardHeader, CardBody } from "@heroui/react";
import { useSocket } from "@/hooks/SocketContext";
import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';

interface UserAreaProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function UserArea({ isOpen, onClose }: UserAreaProps) {
    const socketData = useSocket();
    const { status, data } = socketData;
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [activityTimes, setActivityTimes] = useState<{ [key: number]: number }>({});
    const [dominantColor, setDominantColor] = useState('#1DB954');
    const [isCalculatingColor, setIsCalculatingColor] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [avatarLoaded, setAvatarLoaded] = useState(false);
    const [spotifyImageLoaded, setSpotifyImageLoaded] = useState(false);
    const [hasOverflow, setHasOverflow] = useState(false);
    const [needsWiderSpotifyCard, setNeedsWiderSpotifyCard] = useState(false);
    const [avatarColors, setAvatarColors] = useState<{ primary: string; secondary: string } | null>(null);
    const [activityImagesLoaded, setActivityImagesLoaded] = useState<{[key: string]: boolean}>({});
    const [smallActivityImagesLoaded, setSmallActivityImagesLoaded] = useState<{[key: string]: boolean}>({});
    const [bannerUrl, setBannerUrl] = useState<string | null>(null);
    const [isBannerLoaded, setIsBannerLoaded] = useState(false);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        
        if (data?.spotify) {
            interval = setInterval(() => {
                const now = Date.now();
                const start = data.spotify.timestamps.start;
                const end = data.spotify.timestamps.end;
                
                const elapsed = now - start;
                const total = end - start;
                const newProgress = (elapsed / total) * 100;
                
                setProgress(newProgress);
                setCurrentTime(elapsed);
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [data?.spotify]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        
        if (data?.activities?.length) {
            interval = setInterval(() => {
                const now = Date.now();
                const newTimes: { [key: number]: number } = {};
                
                data.activities
                    .filter(activity => activity.type !== 2 && activity.name !== 'Custom Status')
                    .forEach((activity: any, index: number) => {
                        if (activity.timestamps?.start) {
                            newTimes[index] = now - activity.timestamps.start;
                        }
                    });
                
                setActivityTimes(newTimes);
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [data?.activities]);

    const extractDominantColor = (imageData: Uint8ClampedArray) => {
        const sampleSize = 10;
        const colors: [number, number, number][] = [];
        
        for (let i = 0; i < imageData.length; i += 4 * sampleSize) {
            const r = imageData[i];
            const g = imageData[i + 1];
            const b = imageData[i + 2];
            colors.push([r, g, b]);
        }
        
        let avgR = 0, avgG = 0, avgB = 0;
        colors.forEach(([r, g, b]) => {
            avgR += r;
            avgG += g;
            avgB += b;
        });
        
        const count = colors.length;
        let r = Math.floor(avgR / count);
        let g = Math.floor(avgG / count);
        let b = Math.floor(avgB / count);
        
        const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        
        if (brightness < 0.4) {
            const brightnessAdjustment = 0.5 / brightness;
            r = Math.min(255, Math.floor(r * brightnessAdjustment));
            g = Math.min(255, Math.floor(g * brightnessAdjustment));
            b = Math.min(255, Math.floor(b * brightnessAdjustment));
        }
        
        return { r, g, b };
    };

    useEffect(() => {
        if (data?.spotify?.album_art_url) {
            setSpotifyImageLoaded(false);
            setIsCalculatingColor(true);
            
            const img = new window.Image();
            img.crossOrigin = 'Anonymous';
            img.src = data.spotify.album_art_url;
            
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                const scale = Math.min(1, 100 / Math.max(img.width, img.height));
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;
                
                ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
                const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height).data;
                
                if (!imageData) return;
                
                const rgb = extractDominantColor(imageData);
                setDominantColor(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`);
                setIsCalculatingColor(false);
            };
        } else {
            setDominantColor('#1DB954');
            setIsCalculatingColor(false);
        }
    }, [data?.spotify?.album_art_url]);

    const statusColor = {
        online: "bg-green-500",
        dnd: "bg-red-500",
        idle: "bg-yellow-500",
        offline: "bg-gray-500",
    }[status] || "bg-gray-500";

    const getAvatarUrl = useCallback(() => {
        if (!data?.discord_user) return null;
        const { avatar } = data.discord_user;
        return `https://cdn.discordapp.com/avatars/${data.discord_user.id}/${avatar}.${avatar?.startsWith('a_') ? 'gif' : 'png'}?size=512`;
    }, [data?.discord_user]);

    useEffect(() => {
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscapeKey);
        return () => document.removeEventListener('keydown', handleEscapeKey);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (data?.discord_user || status === 'error') {
            setIsLoading(false);
        }
    }, [data?.discord_user, status]);

    const getActivityImageUrl = (activity: any) => {
        if (!activity.assets?.large_image) {
            return `https://dcdn.dstn.to/app-icons/${activity.application_id}?size=1024`;
        }

        const { large_image } = activity.assets;
        
        if (large_image.startsWith('mp:external/')) {
            const processedUrl = large_image.split('/').slice(2).join('/');
            return processedUrl.startsWith('https/') 
                ? `https://${processedUrl.slice(6)}`
                : processedUrl;
        }
        
        return `https://cdn.discordapp.com/app-assets/${activity.application_id}/${large_image}.png`;
    };

    const getActivitySmallImageUrl = (activity: any) => {
        if (!activity.assets?.small_image) return null;

        const { small_image } = activity.assets;
        
        if (small_image.startsWith('mp:external/')) {
            const processedUrl = small_image.split('/').slice(2).join('/');
            return processedUrl.startsWith('https/') 
                ? `https://${processedUrl.slice(6)}`
                : processedUrl;
        }
        
        return `https://cdn.discordapp.com/app-assets/${activity.application_id}/${small_image}.png`;
    };

    useEffect(() => {
        const needsWider = hasOverflow && data?.spotify && (
            data.spotify.song.length > 35 || 
            data.spotify.artist.length > 35 || 
            data.spotify.album.length > 35 || 
            (data.spotify.song.length + data.spotify.artist.length > 60)
        );
        
        if (needsWider !== needsWiderSpotifyCard) {
            setNeedsWiderSpotifyCard(needsWider);
        }
    }, [data?.spotify, hasOverflow, needsWiderSpotifyCard]);

    const extractAvatarColors = useCallback((imageData: Uint8ClampedArray) => {
        const colors: [number, number, number][] = [];
        const numSamples = 10;
        
        for (let i = 0; i < imageData.length; i += 4 * numSamples) {
            const r = imageData[i];
            const g = imageData[i + 1];
            const b = imageData[i + 2];
            
            const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            
            if (brightness >= 0.1 && brightness <= 0.8) {
                const max = Math.max(r, g, b);
                const min = Math.min(r, g, b);
                const saturation = max > 0 ? (max - min) / max : 0;
                
                if (saturation >= 0.1) {
                    colors.push([r, g, b]);
                }
            }
        }
        
        colors.sort((a, b) => {
            const brightnessA = (0.299 * a[0] + 0.587 * a[1] + 0.114 * a[2]) / 255;
            const brightnessB = (0.299 * b[0] + 0.587 * b[1] + 0.114 * b[2]) / 255;
            return brightnessB - brightnessA;
        });
        
        const midPoint = Math.floor(colors.length / 2);
        const primary = colors[Math.floor(midPoint / 2)];
        const secondary = colors[Math.min(colors.length - 1, midPoint + Math.floor(midPoint / 2))];
        
        return {
            primary: `rgb(${primary[0]}, ${primary[1]}, ${primary[2]})`,
            secondary: `rgb(${secondary[0]}, ${secondary[1]}, ${secondary[2]})`
        };
    }, []);

    useEffect(() => {
        if (getAvatarUrl()) {
            const img = new window.Image();
            img.crossOrigin = 'Anonymous';
            img.src = getAvatarUrl() || '';
            
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                canvas.width = img.width;
                canvas.height = img.height;
                
                ctx?.drawImage(img, 0, 0);
                const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height).data;
                
                if (imageData) {
                    const colors = extractAvatarColors(imageData);
                    setAvatarColors(colors);
                }
            };
        }
    }, [data?.discord_user, extractAvatarColors, getAvatarUrl]);

    useEffect(() => {
        const nonCustomActivities = data?.activities?.filter(activity => activity.type !== 4) || [];
        const shouldOverflow = nonCustomActivities.length > 3 || (nonCustomActivities.length > 2 && data?.spotify);
        
        if (shouldOverflow !== hasOverflow) {
            if (shouldOverflow) {
                setHasOverflow(true);
            } else {
                setHasOverflow(false);
            }
        }
    }, [data?.activities, data?.spotify, hasOverflow]);

    useEffect(() => {
        const spotifyElement = document.querySelector('[data-hovering="true"]') as HTMLElement;
        if (spotifyElement) {
            spotifyElement.style.backgroundColor = isCalculatingColor 
                ? 'rgb(24, 24, 27)' 
                : `color-mix(in srgb, ${dominantColor} 25%, rgb(24 24 27 / 0.9))`;
            spotifyElement.style.borderColor = isCalculatingColor 
                ? 'rgb(63, 63, 70)' 
                : `color-mix(in srgb, ${dominantColor} 30%, rgb(63, 63, 70))`;
        }
    }, [dominantColor, isCalculatingColor]);

    const handleStatusTextOverflow = useCallback((text: string, maxWidth: number) => {
        const tempSpan = document.createElement('span');
        Object.assign(tempSpan.style, {
            visibility: 'hidden',
            position: 'absolute',
            whiteSpace: 'nowrap',
            fontSize: '0.875rem'
        });
        tempSpan.textContent = text;
        document.body.appendChild(tempSpan);
        
        const isOverflowing = tempSpan.getBoundingClientRect().width > maxWidth;
        document.body.removeChild(tempSpan);
        
        if (!isOverflowing) return text;
        
        const words = text.split(' ');
        const lastTwoWords = words.slice(-2).join(' ');
        const remainingWords = words.slice(0, -2).join(' ');
        
        return (
            <>
                {remainingWords}
                <br />
                {lastTwoWords}
            </>
        );
    }, []);

    useEffect(() => {
        if (data?.discord_user?.id) {
            setIsBannerLoaded(false);
            fetch(`https://dcdn.dstn.to/banners/${data.discord_user.id}?size=1024`)
                .then(response => {
                    if (response.ok) {
                        setBannerUrl(`https://dcdn.dstn.to/banners/${data.discord_user.id}?size=1024`);
                    } else {
                        setBannerUrl(null);
                    }
                })
                .catch(() => setBannerUrl(null));
        }
    }, [data?.discord_user?.id]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ 
                        duration: 0.25,
                        ease: [0.25, 0.8, 0.25, 1]
                    }}
                    className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-[8px]"
                >
                    <motion.div 
                        className="absolute inset-0 bg-black bg-opacity-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ 
                            duration: 0.25,
                            ease: [0.25, 0.8, 0.25, 1]
                        }}
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ scale: 0.98, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.98, opacity: 0 }}
                        transition={{ 
                            duration: 0.25,
                            ease: [0.25, 0.8, 0.25, 1]
                        }}
                        className={`relative z-10 w-[95%] max-w-lg
                            data-[wider=true]:max-w-2xl 
                            data-[overflow=true]:max-w-4xl
                            data-[wider-spotify=true]:max-w-3xl`}
                        data-wider={false}
                        data-overflow={hasOverflow}
                        data-wider-spotify={needsWiderSpotifyCard}
                    >
                        <Card className={`rounded-lg border border-zinc-800 bg-white/[0.05] relative overflow-hidden ${
                            bannerUrl ? 'bg-zinc-950/95' : 'bg-zinc-900/90'
                        }`}>
                            {bannerUrl ? (
                                <>
                                    <div 
                                        className={`absolute inset-0 opacity-40 pointer-events-none transition-opacity duration-300 ${
                                            !isBannerLoaded ? 'opacity-0' : 'opacity-40'
                                        }`}
                                        style={{
                                            backgroundImage: `url(${bannerUrl})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            filter: 'blur(10px)',
                                            transform: 'scale(1.1)',
                                            zIndex: 0,
                                            backgroundColor: 'rgba(0, 0, 0, 0.4)'
                                        }}
                                        aria-hidden="true"
                                    >
                                        <Image
                                            src={bannerUrl}
                                            alt="User Banner"
                                            width={500}
                                            height={500}
                                            className="hidden"
                                            onLoad={() => setIsBannerLoaded(true)}
                                            priority
                                            unoptimized
                                        />
                                    </div>
                                    {!isBannerLoaded && !isLoading && (
                                        <div 
                                            className="absolute inset-0 bg-zinc-800/30 animate-pulse"
                                            aria-hidden="true"
                                        />
                                    )}
                                </>
                            ) : (
                                <div 
                                    className="absolute top-0 left-0 right-0 h-32 opacity-30 pointer-events-none"
                                    style={{
                                        background: avatarColors 
                                            ? `linear-gradient(to right, ${avatarColors.primary}, ${avatarColors.secondary})`
                                            : 'linear-gradient(to right, rgb(39, 39, 42), rgb(24, 24, 27))',
                                        filter: 'blur(30px)',
                                        transform: 'translateY(-50%)',
                                        zIndex: 0
                                    }}
                                    aria-hidden="true"
                                />
                            )}
                            <CardHeader className="relative z-10 flex justify-end items-center">
                                <button 
                                    onClick={onClose}
                                    className="text-zinc-400 hover:text-white transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </CardHeader>
                            <CardBody className="relative z-10">
                                {isLoading || !data?.discord_user ? (
                                    <div className="flex flex-col gap-4 animate-pulse">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <div className="w-20 h-20 rounded-full bg-zinc-800/50" />
                                                {!avatarLoaded && (
                                                    <div className="absolute inset-0 w-20 h-20 rounded-full bg-zinc-800/50 animate-pulse" />
                                                )}
                                                <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-zinc-900 bg-zinc-800/50" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between">
                                                    <div className="space-y-1.5">
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-4 w-32 bg-zinc-800/50 rounded" />
                                                            <div className="h-4 w-20 bg-zinc-800/30 rounded-md" />
                                                        </div>
                                                        <div className="h-3.5 w-24 bg-zinc-800/50 rounded" />
                                                        <div className="h-3.5 w-36 bg-zinc-800/50 rounded" />
                                                    </div>
                                                    <div className="mt-2 mr-5">
                                                        <div className="h-[30px] zsm:w-[120px] w-[60px] bg-zinc-800/50 rounded-md" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="h-4 w-20 bg-zinc-800/50 rounded" />
                                            <div className="bg-zinc-800/50 rounded-lg p-3 flex items-center gap-3">
                                                <div className="w-[55px] h-[55px] rounded-md bg-zinc-700/50" />
                                                <div className="space-y-2">
                                                    <div className="h-4 w-32 bg-zinc-700/50 rounded" />
                                                    <div className="h-3 w-24 bg-zinc-700/50 rounded" />
                                                    <div className="h-3 w-28 bg-zinc-700/50 rounded" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <motion.div 
                                        className={`flex flex-col gap-4 transition-[grid-template-columns,grid-auto-flow] duration-300 ease-in-out ${
                                            hasOverflow ? 'md:grid md:grid-cols-2 md:[&>*:last-child:nth-child(2n-1)]:col-span-2 md:[&>*:last-child:nth-child(2n-1)]:mx-auto md:[&>*:last-child:nth-child(2n-1)]:max-w-[calc(50%-0.5rem)]' : ''
                                        }`}
                                    >
                                        <motion.div 
                                            layout="position"
                                            className="flex items-center gap-4 w-full md:col-span-2"
                                            transition={{ 
                                                layout: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
                                                opacity: { duration: 0.3 }
                                            }}
                                        >
                                            <div className="relative">
                                                <Image
                                                    src={getAvatarUrl() || ''}
                                                    alt="Discord Avatar"
                                                    width={80}
                                                    height={80}
                                                    className="rounded-full"
                                                    onLoad={() => setAvatarLoaded(true)}
                                                />
                                                {!avatarLoaded && (
                                                    <div className="absolute inset-0 w-20 h-20 rounded-full bg-zinc-800/50 animate-pulse" />
                                                )}
                                                {avatarLoaded && data.discord_user.avatar_decoration_data && (
                                                    <Image
                                                        src={`https://cdn.discordapp.com/avatar-decoration-presets/${data.discord_user.avatar_decoration_data.asset}.png`}
                                                        alt="Avatar Decoration"
                                                        width={96}
                                                        height={96}
                                                        unoptimized
                                                        priority
                                                        className="absolute -inset-y-2 -right-3 left-0 w-24 h-24 pointer-events-none select-none object-contain mix-blend-normal opacity-100 scale-125"
                                                        style={{
                                                            filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.3))'
                                                        }}
                                                    />
                                                )}
                                                <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-zinc-900 ${statusColor}`} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                                            {data.discord_user.global_name || data.discord_user.username}
                                                            {data.discord_user.clan?.identity_enabled && (
                                                                <span className={`text-xs font-medium ${bannerUrl ? 'text-zinc-400/70 bg-zinc-800/40' : 'text-zinc-400 bg-zinc-800/50'} px-1.5 py-0.5 rounded-md flex items-center gap-1`}>
                                                                    <Image
                                                                        src={`https://cdn.discordapp.com/clan-badges/${data.discord_user.clan.identity_guild_id}/${data.discord_user.clan.badge}.png`}
                                                                        alt={data.discord_user.clan.tag}
                                                                        width={16}
                                                                        height={16}
                                                                        className="inline-block"
                                                                    />
                                                                    {data.discord_user.clan.tag}
                                                                </span>
                                                            )}
                                                        </h3>
                                                        <p className="text-sm text-zinc-400">
                                                            @{data.discord_user.username}
                                                        </p>
                                                    </div>
                                                    <motion.div 
                                                        layout="position"
                                                        className="flex-shrink-0 mt-3 mr-5"
                                                        transition={{ 
                                                            layout: { 
                                                                duration: 0.2,
                                                                ease: [0.4, 0, 0.2, 1]
                                                            }
                                                        }}
                                                    >
                                                        <motion.a
                                                            layout="position"
                                                            href={`https://discord.com/users/${data.discord_user.id}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs font-medium text-white bg-indigo-500 hover:bg-indigo-600 transition-colors px-2.5 py-1.5 rounded-md flex items-center gap-1.5 w-fit whitespace-nowrap"
                                                        >
                                                            <span className="hidden zsm:block">Add on Discord</span>
                                                            <span className="block zsm:hidden">Add</span>
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                                                                <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                                                            </svg>
                                                        </motion.a>
                                                    </motion.div>
                                                </div>
                                                <AnimatePresence mode="popLayout">
                                                    {(data.activities?.find(activity => activity.type === 4)?.state || data.activities?.find(activity => activity.type === 4)?.emoji) && (
                                                        <motion.p 
                                                            initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                                            animate={{ height: "auto", opacity: 1, marginTop: "0.25rem" }}
                                                            exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                                            transition={{ 
                                                                duration: 0.2,
                                                                ease: "easeInOut"
                                                            }}
                                                            className="text-sm text-zinc-400 flex items-center gap-1.5 overflow-hidden mt-1"
                                                        >
                                                            {data.activities.find(activity => activity.type === 4)?.emoji && (
                                                                <Image
                                                                    src={data.activities.find(activity => activity.type === 4)?.emoji?.id 
                                                                        ? `https://cdn.discordapp.com/emojis/${data.activities.find(activity => activity.type === 4)?.emoji?.id}.${data.activities.find(activity => activity.type === 4)?.emoji?.animated ? 'gif' : 'png'}`
                                                                        : `https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/${data.activities.find(activity => activity.type === 4)?.emoji?.name.codePointAt(0)?.toString(16)}.svg`
                                                                    }
                                                                    alt={data.activities.find(activity => activity.type === 4)?.emoji?.name}
                                                                    width={16}
                                                                    height={16}
                                                                    className="w-4 h-4 rounded-[0.125rem]"
                                                                    unoptimized={!!data.activities.find(activity => activity.type === 4)?.emoji?.id}
                                                                />
                                                            )}
                                                            {handleStatusTextOverflow(data.activities.find(activity => activity.type === 4)?.state || '', document.querySelector('.text-sm.text-zinc-400')?.getBoundingClientRect().width || 0)}
                                                        </motion.p>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </motion.div>
                                        
                                        {(data.activities?.length > 0 || data.spotify || status !== 'offline') && (
                                            <motion.div 
                                                layout="position"
                                                className={`relative py-1 ${hasOverflow ? 'md:col-span-2' : ''}`}
                                                transition={{ 
                                                    layout: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
                                                    opacity: { duration: 0.3 }
                                                }}
                                            >
                                                <div className="absolute inset-x-0 bottom-0" aria-hidden="true">
                                                    <div className="w-2/3 mx-auto h-[2px] bg-gradient-to-r from-transparent via-zinc-700/50 to-transparent" />
                                                </div>
                                            </motion.div>
                                        )}
                                        
                                        <AnimatePresence>
                                            {(data.activities?.length === 0 || data.activities?.every(activity => activity.type === 4)) && status !== 'offline' ? (
                                                <motion.div 
                                                    key="nothing-happening"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ 
                                                        opacity: 1,
                                                        transition: {
                                                            duration: 0.3,
                                                            delay: 0.15,
                                                            ease: [0.32, 0.72, 0, 1]
                                                        }
                                                    }}
                                                    exit={{ 
                                                        opacity: 0,
                                                        transition: {
                                                            duration: 0.2,
                                                            ease: [0.32, 0.72, 0, 1]
                                                        }
                                                    }}
                                                    className={`bg-zinc-800/${bannerUrl ? '30' : '50'} rounded-lg p-3 flex items-center justify-center gap-3 border-2 border-dashed border-transparent min-h-[88px] overflow-hidden`}
                                                >
                                                    <motion.div 
                                                        initial={{ opacity: 0 }}
                                                        animate={{ 
                                                            opacity: 1,
                                                            transition: {
                                                                delay: 0.2,
                                                                duration: 0.6,
                                                                ease: [0.22, 1, 0.36, 1]
                                                            }
                                                        }}
                                                        exit={{ 
                                                            opacity: 0,
                                                            transition: {
                                                                duration: 0.3,
                                                                ease: [0.22, 1, 0.36, 1]
                                                            }
                                                        }}
                                                        className="text-center"
                                                    >
                                                        <svg 
                                                            xmlns="http://www.w3.org/2000/svg" 
                                                            viewBox="0 0 24 24"
                                                            className="w-8 h-8 text-zinc-500 mx-auto mb-2"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        >
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.348 14.652a3.75 3.75 0 0 1 0-5.304m5.304 0a3.75 3.75 0 0 1 0 5.304m-7.425 2.121a6.75 6.75 0 0 1 0-9.546m9.546 0a6.75 6.75 0 0 1 0 9.546M5.106 18.894c-3.808-3.807-3.808-9.98 0-13.788m13.788 0c3.808 3.807 3.808 9.98 0 13.788M12 12h.008v.008H12V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                                                        </svg>
                                                        <p className="text-sm text-zinc-400">Nothing is happening</p>
                                                        <p className="text-xs text-zinc-500 mt-1">No active activity to display</p>
                                                    </motion.div>
                                                </motion.div>
                                            ) : null}

                                            {status === 'offline' && (
                                                <motion.div 
                                                    key="offline"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ 
                                                        opacity: 1,
                                                        transition: {
                                                            duration: 0.3,
                                                            delay: 0.15,
                                                            ease: [0.32, 0.72, 0, 1]
                                                        }
                                                    }}
                                                    exit={{ 
                                                        opacity: 0,
                                                        transition: {
                                                            duration: 0.2,
                                                            ease: [0.32, 0.72, 0, 1]
                                                        }
                                                    }}
                                                    className={`bg-zinc-800/${bannerUrl ? '30' : '50'} rounded-lg p-3 flex items-center justify-center gap-3 border-2 border-dashed border-transparent min-h-[88px] overflow-hidden`}
                                                >
                                                    <motion.div 
                                                        initial={{ opacity: 0 }}
                                                        animate={{ 
                                                            opacity: 1,
                                                            transition: {
                                                                delay: 0.2,
                                                                duration: 0.6,
                                                                ease: [0.22, 1, 0.36, 1]
                                                            }
                                                        }}
                                                        exit={{ 
                                                            opacity: 0,
                                                            transition: {
                                                                duration: 0.3,
                                                                ease: [0.22, 1, 0.36, 1]
                                                            }
                                                        }}
                                                        className="text-center"
                                                    >
                                                        <svg 
                                                            xmlns="http://www.w3.org/2000/svg" 
                                                            viewBox="0 0 24 24"
                                                            className="w-8 h-8 text-zinc-500 mx-auto mb-2"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        >
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="m3 3 8.735 8.735m0 0a.374.374 0 1 1 .53.53m-.53-.53.53.53m0 0L21 21M14.652 9.348a3.75 3.75 0 0 1 0 5.304m2.121-7.425a6.75 6.75 0 0 1 0 9.546m2.121-11.667c3.808 3.807 3.808 9.98 0 13.788m-9.546-4.242a3.733 3.733 0 0 1-1.06-2.122m-1.061 4.243a6.75 6.75 0 0 1-1.625-6.929m-.496 9.05c-3.068-3.067-3.664-7.67-1.79-11.334M12 12h.008v.008H12V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                                                        </svg>
                                                        <p className="text-sm text-zinc-400">Currently offline</p>
                                                        <p className="text-xs text-zinc-500 mt-1">No connection to Discord</p>
                                                    </motion.div>
                                                </motion.div>
                                            )}

                                            {data.activities
                                                ?.filter(activity => activity.type !== 2 && activity.type !== 4)
                                                .map((activity: any, index: number) => (
                                                    <AnimatePresence key={activity.application_id || activity.name}>
                                                        <motion.div 
                                                            initial={{ opacity: 0, scale: 0.98 }}
                                                            animate={{ 
                                                                opacity: 1,
                                                                scale: 1,
                                                                transition: {
                                                                    duration: 0.3,
                                                                    delay: index * 0.05,
                                                                    ease: [0.25, 0.8, 0.25, 1]
                                                                }
                                                            }}
                                                            exit={{ 
                                                                opacity: 0,
                                                                scale: 0.98,
                                                                transition: {
                                                                    duration: 0.2,
                                                                    ease: [0.25, 0.8, 0.25, 1]
                                                                }
                                                            }}
                                                            className={`bg-zinc-800/${bannerUrl ? '30' : '50'} rounded-lg p-3 flex items-center gap-3 relative before:absolute before:inset-0 before:rounded-lg before:border-2 before:border-dashed before:border-zinc-700/50 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300 hover:scale-[1.02] min-h-[88px] overflow-hidden`}
                                                        >
                                                            {(activity.application_id || activity.assets?.large_image) ? (
                                                                <div className="relative">
                                                                    <div className="group/large">
                                                                        <div className="relative">
                                                                            <Image
                                                                                src={getActivityImageUrl(activity)}
                                                                                alt={activity.name}
                                                                                width={needsWiderSpotifyCard ? 72 : 65}
                                                                                height={needsWiderSpotifyCard ? 72 : 65}
                                                                                className="rounded-md"
                                                                                onLoad={(e) => {
                                                                                    const target = e.target as HTMLImageElement;
                                                                                    target.style.opacity = '1';
                                                                                    setActivityImagesLoaded(prev => ({
                                                                                        ...prev,
                                                                                        [activity.application_id]: true
                                                                                    }));
                                                                                }}
                                                                                style={{ 
                                                                                    opacity: activityImagesLoaded[activity.application_id] ? '1' : '0'
                                                                                }}
                                                                            />
                                                                            {!activityImagesLoaded[activity.application_id] && (
                                                                                <div 
                                                                                    className="absolute inset-0 bg-zinc-700/50 rounded-md animate-pulse transition-opacity duration-300" 
                                                                                    onTransitionEnd={(e) => {
                                                                                        const target = e.target as HTMLElement;
                                                                                        if (target.style.opacity === '0') {
                                                                                            target.style.display = 'none';
                                                                                        }
                                                                                    }}
                                                                                />
                                                                            )}
                                                                        </div>
                                                                        {activity.assets?.large_text && (
                                                                            <div className="fixed opacity-0 group-hover/large:opacity-100 transition-opacity duration-200 pointer-events-none">
                                                                                <div 
                                                                                    className="bg-zinc-800 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap shadow-lg relative"
                                                                                    style={{
                                                                                        position: 'absolute',
                                                                                        transform: 'translate(-50%, -100%)',
                                                                                        left: '50%',
                                                                                        bottom: needsWiderSpotifyCard ? '60px' : '55px',
                                                                                        marginLeft: needsWiderSpotifyCard ? '35px' : '30px',
                                                                                    }}
                                                                                >
                                                                                    {activity.assets.large_text}
                                                                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-800 transform rotate-45" />
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    {getActivitySmallImageUrl(activity) && (
                                                                        <div className="absolute -bottom-1.5 -right-1.5 group/small">
                                                                            <div className="relative">
                                                                                <Image
                                                                                    src={getActivitySmallImageUrl(activity)}
                                                                                    alt={activity.assets?.small_text || "Status"}
                                                                                    width={28}
                                                                                    height={28}
                                                                                    className="rounded-full border-2 border-zinc-900"
                                                                                    onLoad={(e) => {
                                                                                        const target = e.target as HTMLImageElement;
                                                                                        target.style.opacity = '1';
                                                                                        setSmallActivityImagesLoaded(prev => ({
                                                                                            ...prev,
                                                                                            [activity.application_id]: true
                                                                                        }));
                                                                                    }}
                                                                                    style={{ 
                                                                                        opacity: smallActivityImagesLoaded[activity.application_id] ? '1' : '0'
                                                                                    }}
                                                                                />
                                                                                {!smallActivityImagesLoaded[activity.application_id] && (
                                                                                    <div 
                                                                                        className="absolute inset-0 bg-zinc-700/50 rounded-full animate-pulse transition-opacity duration-300 border-2 border-zinc-900"
                                                                                        onTransitionEnd={(e) => {
                                                                                            const target = e.target as HTMLElement;
                                                                                            if (target.style.opacity === '0') {
                                                                                                target.style.display = 'none';
                                                                                            }
                                                                                        }}
                                                                                    />
                                                                                )}
                                                                                {activity.assets?.small_text && (
                                                                                    <div className="fixed opacity-0 group-hover/small:opacity-100 transition-opacity duration-200 pointer-events-none">
                                                                                        <div 
                                                                                            className="bg-zinc-800 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap shadow-lg relative"
                                                                                            style={{
                                                                                                position: 'absolute',
                                                                                                transform: 'translate(-50%, -100%)',
                                                                                                left: '50%',
                                                                                                bottom: '50px',
                                                                                                marginBottom: '-35px',
                                                                                                marginLeft: '15px',
                                                                                            }}
                                                                                        >
                                                                                            {activity.assets.small_text}
                                                                                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-800 transform rotate-45" />
                                                                                        </div>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <div className="relative flex-shrink-0">
                                                                    <div className="w-[65px] h-[65px] rounded-md bg-zinc-700/50 flex items-center justify-center">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                                                        </svg>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            <div>
                                                                <p className="text-base font-medium text-white">{activity.name}</p>
                                                                {activity.details && (
                                                                    <p className="text-xs font-normal text-zinc-400">{activity.details}</p>
                                                                )}
                                                                {activity.state && (
                                                                    <p className="text-xs font-normal text-zinc-400">{activity.state}</p>
                                                                )}
                                                                {activity.timestamps?.start && (
                                                                    <p className="text-xs text-zinc-500">
                                                                        {(() => {
                                                                            const elapsed = activityTimes[index] ? Math.floor(activityTimes[index] / 1000) : 0;
                                                                            const hours = Math.floor(elapsed / 3600);
                                                                            const minutes = Math.floor((elapsed % 3600) / 60);
                                                                            const seconds = elapsed % 60;
                                                                            
                                                                            return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} elapsed`;
                                                                        })()}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    </AnimatePresence>
                                                ))}

                                            {data.spotify && (
                                                <motion.div 
                                                    key="spotify"
                                                    initial={{ opacity: 0, scale: 0.98 }}
                                                    animate={{ 
                                                        opacity: 1,
                                                        scale: 1,
                                                        transition: {
                                                            duration: 0.3,
                                                            ease: [0.25, 0.8, 0.25, 1]
                                                        }
                                                    }}
                                                    exit={{ 
                                                        opacity: 0,
                                                        scale: 0.98,
                                                        transition: {
                                                            duration: 0.2,
                                                            ease: [0.25, 0.8, 0.25, 1]
                                                        }
                                                    }}
                                                    className={`rounded-lg p-3 flex items-center gap-3 relative before:absolute before:inset-0 before:rounded-lg before:border-2 before:border-dashed before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300 before:[border-color:var(--border-color)] group min-h-[88px] overflow-hidden ${
                                                        data.spotify.track_id ? 'cursor-pointer hover:scale-[1.02]' : ''
                                                    }`}
                                                    style={{ 
                                                        backgroundColor: isCalculatingColor 
                                                            ? `rgb(24, 24, 27, ${bannerUrl ? '0.3' : '1'})` 
                                                            : `color-mix(in srgb, ${dominantColor} ${data.spotify.track_id ? 'var(--bg-opacity, 8%)' : '8%'}, rgb(39 39 42 / ${bannerUrl ? '0.3' : '0.5'}))`,
                                                        '--bg-opacity': 'var(--bg-opacity, 8%)',
                                                        '--border-color': isCalculatingColor 
                                                            ? 'transparent'
                                                            : `color-mix(in srgb, ${dominantColor} var(--border-opacity, 30%), rgb(63, 63, 70))`,
                                                    } as any}
                                                    onMouseEnter={(e) => {
                                                        const target = e.currentTarget;
                                                        target.style.setProperty('--bg-opacity', '25%');
                                                        target.style.setProperty('--border-opacity', '30%');
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        const target = e.currentTarget;
                                                        target.style.setProperty('--bg-opacity', '8%');
                                                        target.style.setProperty('--border-opacity', '0%');
                                                    }}
                                                    onClick={() => {
                                                        if (data.spotify.track_id) {
                                                            window.open(`https://open.spotify.com/track/${data.spotify.track_id}`, '_blank');
                                                        }
                                                    }}
                                                >
                                                    {(!needsWiderSpotifyCard || !data.spotify.album_art_url || !data.spotify.track_id) && (
                                                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                            {!data.spotify.track_id || !data.spotify.album_art_url ? (
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    viewBox="0 0 2931 2931"
                                                                    className="fill-[#1DB954] h-4 w-4"
                                                                >
                                                                    <path d="M1465.5 0C656.1 0 0 656.1 0 1465.5S656.1 2931 1465.5 2931 2931 2274.9 2931 1465.5C2931 656.2 2274.9.1 1465.5 0zm672.1 2113.6c-26.3 43.2-82.6 56.7-125.6 30.4-344.1-210.3-777.3-257.8-1287.4-141.3-49.2 11.3-98.2-19.5-109.4-68.7-11.3-49.2 19.4-98.2 68.7-109.4C1242.1 1697.1 1721 1752 2107.3 1988c43 26.5 56.7 82.6 30.3 125.6zm179.3-398.9c-33.1 53.8-103.5 70.6-157.2 37.6-394.2-242.3-994.9-312.2-1460.3-170.8-60.4 18.3-124.2-15.8-142.6-76.1-18.2-60.4 15.9-124.1 76.2-142.5 532.2-161.5 1193.9-83.3 1646.8 194.7 53.8 33.1 70.8 103.4 37.1 157.1zm15.4-415.6c-472.4-280.5-1251.6-306.3-1702.6-169.5-72.4 22-149-18.9-170.9-91.3-21.9-72.4 18.9-149 91.4-171 517.7-157.1 1378.2-126.8 1922 196 65.1 38.7 86.5 122.8 47.9 187.8-38.5 65.2-122.8 86.7-187.8 48z"/>
                                                                </svg>
                                                            ) : (
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    className="fill-white/50 h-4 w-4"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path d="M10 6V8H5V19H16V14H18V20C18 20.5523 17.5523 21 17 21H4C3.44772 21 3 20.5523 3 20V7C3 6.44772 3 6 4 6H10ZM21 3V11H19V6.413L11.207 14.207L9.793 12.793L17.585 5H13V3H21Z" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                    )}
                                                    <div className={`flex items-start gap-2 ${!data.spotify.album_art_url || !data.spotify.track_id ? 'justify-center w-full' : ''}`}>
                                                        {data.spotify.album_art_url && data.spotify.track_id && (
                                                            
                                                            <div className={`relative flex-shrink-0 ${
                                                                !hasOverflow && (() => {
                                                                    const songLength = data.spotify.song.length;
                                                                    const artistLength = data.spotify.artist.length;
                                                                    const albumLength = data.spotify.album.length;
                                                                    const totalLength = songLength + artistLength + albumLength;
                                                                    
                                                                    if (songLength > 80 || totalLength > 150 || 
                                                                        (songLength > 65 && (artistLength > 65 || albumLength > 65))) {
                                                                        return 'mt-4';
                                                                    }
                                                                    
                                                                    return '';
                                                                })()
                                                            }`}>
                                                                <Image
                                                                    src={data.spotify.album_art_url}
                                                                    alt={data.spotify.album}
                                                                    width={80}
                                                                    height={80}
                                                                    className="rounded-md"
                                                                    onLoad={() => setSpotifyImageLoaded(true)}
                                                                />
                                                                {!spotifyImageLoaded && (
                                                                    <div className="absolute inset-0 w-20 h-20 rounded-md bg-zinc-700/50 animate-pulse" />
                                                                )}
                                                            </div>
                                                        )}
                                                        <div className={`${!data.spotify.album_art_url || !data.spotify.track_id ? 'text-center flex-1' : 'flex-1'}`}>
                                                            <div className={`flex items-start gap-2 ${!data.spotify.album_art_url || !data.spotify.track_id ? 'justify-center text-center flex' : ''}`}>
                                                                <p className={`text-sm font-medium text-white ${!data.spotify.album_art_url || !data.spotify.track_id ? 'text-center px-6' : 'pr-6'}`}>
                                                                    {data.spotify.song}
                                                                </p>
                                                                {needsWiderSpotifyCard && data.spotify.track_id && (
                                                                    <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                                        <svg
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            className="fill-white/50 h-4 w-4 mx-auto"
                                                                            viewBox="0 0 24 24"
                                                                        >
                                                                            <path d="M10 6V8H5V19H16V14H18V20C18 20.5523 17.5523 21 17 21H4C3.44772 21 3 20.5523 3 20V7C3 6.44772 3 6 4 6H10ZM21 3V11H19V6.413L11.207 14.207L9.793 12.793L17.585 5H13V3H21Z" />
                                                                        </svg>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-zinc-400">
                                                                by {data.spotify.artist.split('; ').map((artist: string, index: number, array: string[]) => {
                                                                    if (array.length === 1) return artist;
                                                                    if (index === array.length - 2) return `${artist} `;
                                                                    if (index === array.length - 1) return `& ${artist}`;
                                                                    return `${artist}, `;
                                                                })}
                                                            </p>
                                                            <p className={`text-xs text-zinc-500 ${!hasOverflow && (data.spotify.song.length > 35 || data.spotify.artist.length > 35) ? 'mt-1' : ''}`}>
                                                                on {data.spotify.album}
                                                            </p>
                                                            <div className={`mt-3 ${!data.spotify.album_art_url || !data.spotify.track_id ? 'flex justify-center' : ''}`}>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xs text-zinc-500">
                                                                        {Math.floor(currentTime / 1000 / 60)}:
                                                                        {String(Math.floor(currentTime / 1000 % 60)).padStart(2, '0')}
                                                                    </span>
                                                                    <div className="w-40 bg-zinc-700/50 rounded-full h-1">
                                                                        {isCalculatingColor ? (
                                                                            <div className="h-full w-full animate-pulse bg-gradient-to-r from-zinc-600/50 via-zinc-500/50 to-zinc-600/50 rounded-full" />
                                                                        ) : (
                                                                            <div 
                                                                                className="h-1 rounded-full transition-all duration-1000"
                                                                                style={{ 
                                                                                    width: `${Math.min(progress, 100)}%`,
                                                                                    backgroundColor: dominantColor
                                                                                }}
                                                                            />
                                                                        )}
                                                                    </div>
                                                                    <span className="text-xs text-zinc-500">
                                                                        {Math.floor((data.spotify.timestamps.end - data.spotify.timestamps.start) / 1000 / 60)}:
                                                                        {String(Math.floor((data.spotify.timestamps.end - data.spotify.timestamps.start) / 1000 % 60)).padStart(2, '0')}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                )}
                            </CardBody>
                        </Card>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

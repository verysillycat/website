export interface DiscordUser {
	username: string;
	id: string;
	discriminator: string;
	avatar: string;
	global_name: string;
	avatar_decoration_data?: {
		sku_id: string;
		asset: string;
		expires_at: string | null;
	};
	clan?: {
		tag: string;
		identity_guild_id: string | number;
		badge: string;
		identity_enabled: boolean;
	};
	primary_guild?: {
		tag: string;
		identity_guild_id: number;
		badge: string;
		identity_enabled: boolean;
	};
}

export interface LanyardData {
	discord_user: DiscordUser;
	discord_status: string;
	activities: any[];
	spotify: any;
	listening_to_spotify: boolean;
}

export interface SocketData {
	status: string;
	data: LanyardData | null;
}

export interface WebSocketMessage {
	op: number;
	t?: string;
	d: {
		heartbeat_interval?: number;
		discord_status?: string;
	} & Partial<LanyardData>;
}

export interface SocketState extends SocketData {
	connectionStatus: "connecting" | "connected" | "disconnected";
}

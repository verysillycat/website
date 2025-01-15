import { useState, useEffect } from "react";

export function useSocket() {
	const [status, setStatus] = useState("offline");

	useEffect(() => {
		const socket = new WebSocket("wss://api.lanyard.rest/socket");

		socket.addEventListener("open", () => {
			socket.send(
				JSON.stringify({
					op: 2,
					d: {
						subscribe_to_id: "825069530376044594",
					},
				}),
			);
		});

		socket.addEventListener("message", (event) => {
			const message = JSON.parse(event.data);
			if (message.t === "INIT_STATE" || message.t === "PRESENCE_UPDATE") {
				setStatus(message.d.discord_status);
			}
		});

		socket.addEventListener("error", (error) => {
			console.error("WebSocket error:", error);
		});

		return () => {
			socket.close();
		};
	}, []);
	return { status };
}

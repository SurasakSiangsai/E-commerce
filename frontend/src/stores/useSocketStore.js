import { create } from "zustand";
import { io } from "socket.io-client"; // Ensure this import is correct
import { useUserStore } from "./useUserStore";

export const useSocketStore = create((set) => ({
	socket: null,
	connectSocket: () => {
		const { user, token } = useUserStore.getState();
		if (!user || !token) return;

		try {
			const socket = io(import.meta.env.VITE_BACKEND_URL, {
				auth: { token },
			});

			socket.on("connect", () => {
				console.log("Connected to WebSocket:", socket.id);
			});

			socket.on("new-order", (data) => {
				console.log("New order notification:", data);
				alert(`New order: ${data.message}`);
			});

			socket.on("disconnect", () => {
				console.log("Disconnected from WebSocket");
			});

			socket.on("connect_error", (err) => {
				console.error("WebSocket connection error:", err.message);
			});

			set({ socket });
		} catch (error) {
			console.error("Error connecting to WebSocket:", error.message);
		}
	},
	disconnectSocket: () => {
		const { socket } = useSocketStore.getState();
		if (socket) {
			socket.disconnect();
			set({ socket: null });
		}
	},
}));

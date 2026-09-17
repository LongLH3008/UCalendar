import { useRef } from "react";
import type { PointerEvent } from "react";

export type SwipeDirection = "up" | "right" | "down" | "left";

export default function useCalendarSwipe(changeMonth: (direction: "next" | "prev", swipe: SwipeDirection) => void) {
	const start = useRef<{ id: number; x: number; y: number } | null>(null);
	const reset = () => { start.current = null; };

	return {
		onPointerDown(event: PointerEvent<HTMLDivElement>) {
			if (event.pointerType !== "touch") return;
			if (!event.isPrimary) {
				reset();
				return;
			}
			start.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
			event.currentTarget.setPointerCapture(event.pointerId);
		},
		onPointerUp(event: PointerEvent<HTMLDivElement>) {
			const origin = start.current;
			if (!origin || origin.id !== event.pointerId) return;
			reset();
			const dx = event.clientX - origin.x;
			const dy = event.clientY - origin.y;
			const horizontal = Math.abs(dx) > Math.abs(dy);
			const distance = horizontal ? Math.abs(dx) : Math.abs(dy);
			const crossDistance = horizontal ? Math.abs(dy) : Math.abs(dx);
			if (distance < 50 || distance < crossDistance * 1.2) return;
			const swipe = horizontal ? (dx > 0 ? "right" : "left") : (dy < 0 ? "up" : "down");
			changeMonth(swipe === "right" || swipe === "up" ? "next" : "prev", swipe);
		},
		onPointerCancel: reset,
		onLostPointerCapture: reset,
	};
}

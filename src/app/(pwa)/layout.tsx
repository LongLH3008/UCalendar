import ServiceWorkerRegistration from "@/components/pwa/ServiceWorkerRegistration";
import type { ReactNode } from "react";

export default function PWALayout({ children }: { children: ReactNode }) {
	return (
		<>
			{children}
			<ServiceWorkerRegistration />
		</>
	);
}

import { cn } from "@/core/lib/utils";
import type { CSSProperties, HTMLAttributes } from "react";

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

type Props = {
	as?: HeadingTag;
	size?: number;
} & HTMLAttributes<HTMLHeadingElement>;

const desktopSizes: Record<HeadingTag, number> = {
	h1: 48,
	h2: 36,
	h3: 30,
	h4: 24,
	h5: 20,
	h6: 18,
};

const Heading = ({ as: Tag = "h3", size, className, style, children, ...rest }: Props) => {
	return (
		<Tag
			className={cn("heading-font-size", "font-bold leading-tight", className)}
			style={{ "--heading-font-size": size ?? desktopSizes[Tag], ...style } as CSSProperties}
			{...rest}
		>
			{children}
		</Tag>
	);
};

export default Heading;

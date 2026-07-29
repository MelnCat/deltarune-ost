import { act, useRef, useState } from "react";
import styles from "./MainLink.module.css";
import { useEventListener } from "usehooks-ts";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import soul from "@/assets/img/soul/soul.png";

export const MainLink = ({
	children,
	to,
	active = false,
	onHover,
}: {
	children: React.ReactNode;
	to: string;
	active?: boolean;
	onHover?: () => void;
}) => {
	const ref = useRef<HTMLAnchorElement>(null!);
	useEventListener(
		"mouseover",
		() => {
			onHover?.();
		},
		ref,
	);
	return (
		<div className={styles.link} data-active={active || null} >
			<div className={styles.soulContainer}>
				{active && (
					<motion.div transition={{ ease: "linear", duration: 0.1 }} layout layoutId="soul" className={styles.soul}>
						<img src={soul} alt="soul" />
					</motion.div>
				)}
			</div>
			<Link to={to} ref={ref}>{children}</Link>
		</div>
	);
};

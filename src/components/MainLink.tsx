import { useRef, useState } from "react";
import styles from "./MainLink.module.css";
import { useEventListener } from "usehooks-ts";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import soul from "@/assets/img/soul/soul.png";

let stopHover = () => {};

export const MainLink = ({ children, to }: { children: React.ReactNode; to: string }) => {
	const ref = useRef<HTMLDivElement>(null!);
	const [hover, setHover] = useState(false);
	useEventListener(
		"mouseover",
		() => {
			stopHover();
			stopHover = () => setHover(false);
			setHover(true);
		},
		ref,
	);
	return (
		<div className={styles.link} data-active={hover || null} ref={ref}>
			<div className={styles.soulContainer}>
				{hover && (
					<motion.div transition={{ ease: "linear", duration: 0.1 }} layout layoutId="soul" className={styles.soul}>
						<img src={soul} alt="soul" />
					</motion.div>
				)}
			</div>
			<Link to={to}>{children}</Link>
		</div>
	);
};

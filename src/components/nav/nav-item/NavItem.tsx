import { getIcon } from "components/icons";
import styles from "./NavItem.module.scss";
import classNames from "@lib/class-names";
import Link from "components/link/Link";
import type { YSPComponentPropsWithChildren } from "types/components";

interface NavItemContentProps {
	readonly title: string;
	readonly description: string;
	readonly author: string;
	readonly icon?: string;
	readonly url?: string;
	readonly target?: string;
	readonly onClick?: () => void;
};

const NavItemContent = ({
	url,
	target,
	icon,
	title,
	description,
	author,
	onClick,
	className,
}: YSPComponentPropsWithChildren<NavItemContentProps>) => (
	<Link
		href={url}
		target={target}
		className={classNames(styles.root, className)}
		asChild
		onClick={onClick}
	>
		<span className={classNames(styles.content, className)}>
			{icon && <span className={styles.icon}>{getIcon(icon)}</span>}
			<span className={styles.meta}>
				<span className={classNames(styles.title, className)}>{title}</span>
				<span className={styles.description}>{description}</span>
				<span className={styles.author}>{author}</span>
			</span>
		</span>
	</Link>
);

export default NavItemContent;
export type { NavItemContentProps };

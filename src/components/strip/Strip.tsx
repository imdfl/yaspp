import cx from "@lib/class-names";
import type { YSPComponentPropsWithChildren } from "@src/types/components";
import styles from "./Strip.module.scss";

interface IStripProps extends YSPComponentPropsWithChildren {
	type?: "horizontal" | "vertical";
}

const Strip = ({ className, type = "horizontal" }: IStripProps) => {
	const cls = type === "vertical" ? styles.vertical : styles.horizontal;
	return (
		<div className={cx(styles.root, className, cls)} />
	);
};

export default Strip;

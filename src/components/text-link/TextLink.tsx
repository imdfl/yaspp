import React, { useMemo } from "react";
import Text from "../text/Text";
import Link from "../link/Link";
import classNames from "@lib/class-names";
import type { YSPComponentPropsWithChildren } from "@src/types/components";

import styles from "./TextLink.module.scss";

export type TextLinkProps = {
	href: string;
	title?: string;
	linked?: boolean;
	// variant?: TextVariant | HeadingVariant | SubtitleVariant;
	asChild?: boolean;
};

const TextLink = ({
	href,
	title,
	linked,
	// variant,
	children,
	asChild,
	className,
}: YSPComponentPropsWithChildren<TextLinkProps>): React.JSX.Element => {
	const text = useMemo(
		() => (
			<Text className={styles.label}>
				{children}
			</Text>
		),
		[children]
	);

	const link = useMemo(
		() => (
			<Link href={href} className={styles.link} asChild={asChild}>
				{text}
			</Link>
		),
		[href, text, asChild]
	);

	return (
		<span
			title={title}
			aria-label={title}
			className={classNames(styles.root, className)}
			// data-variant={variant}
		>
			{linked ? link : text}
		</span>
	);
};

export default TextLink;

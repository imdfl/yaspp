import React, { useMemo } from "react";
import Text, {
	HeadingVariant,
	SubtitleVariant,
	type TextVariant,
} from "../text/Text";
import Link from "../link/Link";
import styles from "./TextLink.module.scss";
import classNames from "@lib/class-names";
import type { YSPComponentPropsWithChildren } from "types/components";

export type TextLinkProps = {
	href: string;
	title?: string;
	linked?: boolean;
	variant?: TextVariant | HeadingVariant | SubtitleVariant;
	asChild?: boolean;
};

const TextLink = ({
	href,
	title,
	linked,
	variant,
	children,
	asChild,
	className,
}: YSPComponentPropsWithChildren<TextLinkProps>): JSX.Element => {
	const text = useMemo(
		() => (
			<Text variant={variant} className={styles.label}>
				{children}
			</Text>
		),
		[children, variant]
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
			data-variant={variant}
		>
			{linked ? link : text}
		</span>
	);
};

export default TextLink;

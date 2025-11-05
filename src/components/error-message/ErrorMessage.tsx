import React from "react";
import { getIcon } from "components/icons";
import classNames from "@lib/class-names";
import styles from "./ErrorMessage.module.scss";
import { Link } from "..";
import type { YSPComponentPropsWithChildren } from "types/components";

type ErrorMessageProps = {
	message?: string;
	icon?: string;
	label?: string;
	reportIssueUrl?: string;
	issueTrackerUrl?: string;
};

const ErrorMessage = ({
	message,
	icon = "cross",
	label,
	issueTrackerUrl,
	children,
	className,
}: YSPComponentPropsWithChildren<ErrorMessageProps>) => (
	<div className={classNames(styles.root, className)}>
		{getIcon(icon)} {message}
		{children ?? children}
		{!children && (
			<Link target="_blank" href={issueTrackerUrl}>
				{label}
			</Link>
		)}
	</div>
);

export default ErrorMessage;
export type { ErrorMessageProps };

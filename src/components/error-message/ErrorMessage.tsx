import type { YSPComponentPropsWithChildren } from "@src/types/components";
import { getIcon } from "@components/icons";
import classNames from "@lib/class-names";
import { Link } from "..";
import styles from "./ErrorMessage.module.scss";

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

import classNames from "@lib/class-names";
import { useContext, useEffect, useState } from "react";
import { LocaleContext } from "../../contexts/localeContext";
import { YSPComponentPropsWithChildren } from "../../types/components";
import useClassNames from "@hooks/useClassNames";

import styles from "./DateFormat.module.scss";

interface DateFormatProps {
	readonly date: Date;
	readonly locale?: string;
};

const DateFormat = ({
	date,
	locale,
	className,
}: YSPComponentPropsWithChildren<DateFormatProps>): React.JSX.Element => {
	const ctx = useContext(LocaleContext);
	const [label, setLabel] = useState("");
	const { componentClass } = useClassNames({
		part: "date-format",
		classes: [styles.root, className]
	})

	useEffect(() => {
		let dt: Date;
		try {
			if (!date) {
				dt = new Date();
			}
			else if (typeof date === "string") {
				dt = new Date(Date.parse(date));
			}
			else if (typeof date?.toLocaleDateString === "function") {
				dt = date;
			}
			else {
				dt = new Date();
			}
		} 
		catch (error) {
			console.error(`Invalid date ${String(date)}`);
			dt = new Date();
		}
		const label = dt.toLocaleDateString(locale || ctx.locale, {
			day: "2-digit",
			month: "2-digit",
			year: "2-digit"
		});

		setLabel(label);
	}, [ctx, locale, date]);

	return label ? (
		<time className={componentClass}>
			{label}
		</time>
	) : (<></>);
}

export default DateFormat;

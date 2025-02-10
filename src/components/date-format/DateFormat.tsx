import classNames from 'classnames';
import styles from './DateFormat.module.scss';
import { useContext, useEffect, useState } from 'react';
import { LocaleContext } from '../../contexts/localeContext';

type DateFormatProps = {
	date: Date;
	locale?: string;
	className?: string;
};

const DateFormat = ({
	date,
	locale,
	className,
}: DateFormatProps): JSX.Element => {
	const ctx = useContext(LocaleContext);
	const [label, setLabel] = useState("");

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
		<time className={classNames(styles.root, className)}>
			{label}
		</time>
	) : (<></>);
}

export default DateFormat;

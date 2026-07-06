import React from "react";
import ToggleGroup from "@components/toggle/toggle-group/ToggleGroup";
import classNames from "@lib/class-names";
import type { LocaleId } from "@src/types/locale";
import useClassNames from "@hooks/useClassNames";

import styles from "./LocaleSelect.module.scss";

type LocaleOptionProps = {
	id: LocaleId;
	label: string;
	title: string;
};

type LocaleSelectProps = {
	defaultValue: string;
	options: LocaleOptionProps[];
	onSelect: (id: LocaleId) => void;
	className?: string;
};

const LocaleSelect = ({
	defaultValue,
	options,
	onSelect,
	className,
}: LocaleSelectProps): React.JSX.Element => {
	const { componentClass } = useClassNames({
		classes: [styles.root],
		part: "locale-select",
	});
	if (options.length > 1) {
		return (
			<ToggleGroup
				type="single"
				defaultValue={defaultValue}
				onSelect={onSelect}
				className={classNames(styles.root, className)}
			>
				{options.map(({ id, label, title }) => (
					<span
						key={id}
						title={title}
						data-value={id}
						data-locale={id}
					>
						{label}
					</span>
				))}
			</ToggleGroup>)
	}
	return <></>
}

export default LocaleSelect;
export type { LocaleOptionProps, LocaleSelectProps };

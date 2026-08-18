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
	currentLocale: string;
	options: LocaleOptionProps[];
	onSelect: (id: LocaleId) => void;
	className?: string;
};

const LocaleSelect = ({
	currentLocale,
	options,
	onSelect,
	className,
}: LocaleSelectProps): React.JSX.Element => {
	const { componentClass } = useClassNames({
		classes: [styles.root, className],
		part: "locale-select",
	});
	if (!(options?.length > 1)) {
		return <></>
	}

	return (
		<ToggleGroup
			type="single"
			initialValue={currentLocale}
			onSelect={onSelect}
			className={componentClass}
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

export default LocaleSelect;
export type { LocaleOptionProps, LocaleSelectProps };

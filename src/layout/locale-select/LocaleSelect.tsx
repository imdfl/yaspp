import React from 'react';
import ToggleGroup from '../../components/toggle/toggle-group/ToggleGroup';
import classNames from 'classnames';
import styles from './LocaleSelect.module.scss';
import type { LocaleId } from 'types/locale';

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
}: LocaleSelectProps): JSX.Element => options.length > 1 ? (
	<ToggleGroup
		type="single"
		defaultValue={defaultValue}
		onSelect={onSelect}
		className={classNames(styles.root, className)}
	>
		{options.map(({ id, label, title }) => (
			<span
				key={`locale-item-${id}`}
				title={title}
				data-value={id}
				data-locale={id}
			>
				{label}
			</span>
		))}
	</ToggleGroup>
) : <></>

export default LocaleSelect;
export type { LocaleOptionProps, LocaleSelectProps };

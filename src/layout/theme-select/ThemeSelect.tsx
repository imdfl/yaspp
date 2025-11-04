import React, { useCallback, useEffect, useState } from 'react';
import { getIcon } from 'components/icons';
import ToggleButton from '../../components/toggle/toggle-button/ToggleButton';
import styles from './ThemeSelect.module.scss';
import classNames from '@lib/class-names';
import { useMountGuard } from '../../hooks/useMountGuard';

type ThemeSelectProps = {
	readonly label: string;
	readonly theme: string;
	readonly themes: ReadonlyArray<string>;
	readonly setTheme: (val: string) => void;
	readonly className?: string;
};

const ThemeSelect = ({
	label,
	theme,
	setTheme,
	themes,
	className,
}: ThemeSelectProps): JSX.Element => {
	const [curThemeIndex, setCurThemeIndex] = useState<number>(themes.indexOf(theme));
	const { mounted } = useMountGuard();

	const toggleTheme = useCallback(() => {
		if (themes.length < 2) {
			return;
		}
		let nextInd = curThemeIndex === 0 ? 1 : 0;
		setTheme(themes[nextInd]);
		
	}, [curThemeIndex, themes, setTheme])

	useEffect(() => {
		setCurThemeIndex(themes.indexOf(theme));
	}, [themes, theme]);

	if (!mounted) {
		return null;
	}
	if (themes.length < 2 || curThemeIndex < 0) {
		return null;
	}


	return (
		<ToggleButton
			title={label}
			isToggled={curThemeIndex === 1}
			onClick={toggleTheme}
			className={classNames(styles.root, className)}
		>
			{getIcon(theme)}
		</ToggleButton>
	);
};

export default ThemeSelect;
export type { ThemeSelectProps };

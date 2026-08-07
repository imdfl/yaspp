import React, { useCallback, useEffect, useState } from "react";
import type { ElementSize } from "@src/types/styles";
import type { YSPComponentPropsWithChildren } from "@src/types/components";
import { getIcon } from "@components/icons";
import ToggleButton from "@components/toggle/toggle-button/ToggleButton";
import classNames from "@lib/class-names";
import { useMountGuard } from "@hooks/useMountGuard";

import styles from "./ThemeSelect.module.scss";

type ThemeSelectProps = {
	readonly label: string;
	readonly theme: string;
	readonly themes: ReadonlyArray<string>;
	readonly setTheme: (val: string) => void;
	readonly size?: ElementSize;
};

const ThemeSelect = ({
	label,
	theme,
	setTheme,
	themes,
	className,
	size
}: YSPComponentPropsWithChildren<ThemeSelectProps>): React.JSX.Element => {
	const [curThemeIndex, setCurThemeIndex] = useState<number>(themes.indexOf(theme));
	const { mounted } = useMountGuard();

	const toggleTheme = useCallback(() => {
		const maxInd = themes.length - 1;
		if (maxInd === 0) {
			return;
		}
		const nextInd = curThemeIndex >= maxInd ? 0 : (curThemeIndex + 1);
		setTheme(themes[nextInd]);
		
	}, [curThemeIndex, themes, setTheme])

	useEffect(() => {
		setCurThemeIndex(themes.indexOf(theme));
	}, [themes, theme]);

	if (!mounted) {
		return null;
	}
	if (themes.length < 2) {
		return null;
	}


	return (
		<ToggleButton
			title={label}
			isToggled={curThemeIndex === 1}
			onClick={toggleTheme}
			className={classNames(styles.root, className)}
		>
			{getIcon(theme, { size, varName: `--ml-logo-${theme}-url` })}
		</ToggleButton>
	);
};

export default ThemeSelect;
export type { ThemeSelectProps };

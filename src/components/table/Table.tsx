import type { YSPComponentPropsWithChildren } from "@src/types/components";
import useClassNames from "@hooks/useClassNames";
import { ComponentContextProvider } from "@contexts";

import styles from "./Table.module.scss";


export const Table = ({
	children,
	className,
	currentPath,
	style = {},
}: YSPComponentPropsWithChildren) => {
	const { componentPath, componentClass } = useClassNames({
		part: "table",
		classes: [className, styles.root],
		currentPath
	})
	return (
		<ComponentContextProvider parentPath={componentPath}>
			<table className={componentClass} style={style}>
				<tbody>{children}</tbody>
			</table>
		</ComponentContextProvider>

	);
};

export default Table;

import type { YSPComponentPropsWithChildren } from "@src/types/components";
import { ComponentContextProvider } from "@contexts";
import useClassNames from "@hooks/useClassNames";

import styles from "./Figure.module.scss";

type FigureProps = {
	elementId: string;
};

const Figure = ({
	elementId,
	children,
	className,
	style = {},
	...rest
}: YSPComponentPropsWithChildren<FigureProps>) => {
	const dataType = rest["data-type"];
	const part = (typeof dataType === "string" && dataType.length) ?
		`figure-${dataType}`
		: "figure";
	const { componentClass, componentPath, createSubClass } = useClassNames({
		part,
		classes: [styles.root, className]
	})

	return (
		<ComponentContextProvider parentPath={componentPath}>
			<figure className={componentClass} {...rest} style={style}>
				{elementId && <a id={elementId}></a>}
				<div className={createSubClass("content", styles.figureContent)}>{children}</div>
			</figure>
		</ComponentContextProvider>
	);
};

export default Figure;
export type { FigureProps };

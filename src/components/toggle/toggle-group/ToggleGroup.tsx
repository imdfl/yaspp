import React, { useMemo } from "react";
import * as ToggleGroupPrimitives from "@radix-ui/react-toggle-group";
// import { ToggleGroupItemProps } from "./toggle-group-item/ToggleGroupItem";
import cx from "@lib/class-names";
import styles from "./ToggleGroup.module.scss";
import type { YSPComponentPropsWithChildren } from "@src/types/components";

type ToggleGroupProps = {
	initialValue: string;
	// options?: ToggleGroupItemProps[];
	onSelect?: (val: string) => void;
	type: 'single';
};

const ToggleGroup = ({
	initialValue,
	type,
	onSelect,
	children,
	className,
}: YSPComponentPropsWithChildren<ToggleGroupProps>): React.JSX.Element => {
	const childrenWithProps = useMemo(
		() =>
			React.Children.map(children, (child) => {
				if (React.isValidElement(child)) {
					const value = child.props['data-value'];
					return (
						<ToggleGroupPrimitives.Item
							className={cx(styles.item, { [styles.selected]: value === initialValue})}
							value={value}
							asChild
						>
							{child}
						</ToggleGroupPrimitives.Item>
					);
				}
				return child;
			}),
		[children, initialValue]
	);

	return (
		<ToggleGroupPrimitives.Root
			type={type}
			defaultValue={initialValue}
			onValueChange={onSelect}
			className={cx(styles.root, className)}
		>
			{childrenWithProps}
		</ToggleGroupPrimitives.Root>
	);
};

export default ToggleGroup;
export type { ToggleGroupProps };

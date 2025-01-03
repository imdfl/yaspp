import React, { PropsWithChildren, SyntheticEvent } from 'react';
import { Slot } from '@radix-ui/react-slot';
import classNames from 'classnames';
import styles from './Button.module.scss';

type ButtonProps = {
	title?: string;
	asChild?: boolean;
	disabled?: boolean;
	onClick?: (e: SyntheticEvent | string | number | boolean) => void;
	type?: 'submit';
	className?: string;
};

const Button = ({
	asChild,
	disabled,
	children,
	className,
	title,
	onClick,
	...props
}: PropsWithChildren<ButtonProps>) => {
	const Comp = asChild && typeof children !== 'string' ? Slot : 'button';

	return (
		<Comp
			className={classNames(styles.root, className)}
			onClick={(e: SyntheticEvent) => onClick?.(e)}
			disabled={disabled}
			title={title}
			{...props}
		>
			{children}
		</Comp>
	);
};

export default Button;
export type { ButtonProps };

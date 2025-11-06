import React, { useCallback } from "react";
import CustomField, {
	type CustomFieldProps,
} from "components/custom-field/CustomField";
import { getValidityErrorMessage } from "components/custom-field/helpers";
import { useInputValidation } from "@hooks/useInputValidation";
import classNames from "@lib/class-names";
import styles from "./Input.module.scss";
import type { YSPComponentPropsWithChildren } from "types/components";

type InputProps = {
	readonly translateFn: (s: string) => string;
} & CustomFieldProps;

const Input = ({
	type,
	translateFn,
	className,
	...rest
}: YSPComponentPropsWithChildren<InputProps>) => {
	const trErrorMessage = useCallback((validity: ValidityState) =>
		getValidityErrorMessage({
			validity,
			translateFn,
		}), [translateFn]);

	const { valid, invalid, errorMessage, validate } =
		useInputValidation(trErrorMessage);

	const CustomInput = type === "textarea" ? "textarea" : "input";

	return (
		<CustomField
			type={type}
			className={classNames(styles.root, className)}
			isValid={valid}
			isInvalid={invalid}
			errorMessage={errorMessage}
			{...rest}
		>
			<CustomInput onChange={validate} onBlur={validate} />
		</CustomField>
	);
};

export default Input;

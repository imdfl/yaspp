import { useEffect, useState } from 'react';

export interface ITranslatedString {
	readonly text: string;
}

/**
 * A hook that saves the value of a string which may be expensive to compute
 * @returns an object with a `text` string prop
 */
export const useTranslatedString = (generate: () => string): ITranslatedString => {
	const [text, setText] = useState("");

	useEffect(() => {
		setText(generate());
	}, [generate])

	return {
		text
	};
};

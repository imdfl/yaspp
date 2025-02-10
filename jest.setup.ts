import '@testing-library/jest-dom';
import './tests/mocks/mockRouter';
import i18n from './i18n';
import { I18nConfig } from 'next-translate';

global.i18nConfig = i18n as unknown as I18nConfig;

jest.mock('next/config', () => () => ({
	serverRuntimeConfig: {
		PROJECT_ROOT: '/',
	},
}));

global.ResizeObserver = class {
	observe() {}
	unobserve() {}
	disconnect() {}
};

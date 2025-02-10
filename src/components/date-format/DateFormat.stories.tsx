import type { Meta, StoryObj } from '@storybook/react';
import DateFormat from './DateFormat';

const meta = {
	title: 'UI/DateFormat',
	component: DateFormat,
	parameters: {
		layout: 'centered',
	},
	tags: ['autodocs'],
	argTypes: {},
} satisfies Meta<typeof DateFormat>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
	args: {
		date: new Date(),
		locale: "en",
	},
	render: function Render({ date, locale }) {
		return <DateFormat date={date} locale={locale} />;
	},
};

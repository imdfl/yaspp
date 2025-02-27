import type { Meta, StoryObj } from '@storybook/react';
import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport';
import MenuBar from 'components/nav/menu-bar/MenuBar';
import MenuDrawer from './menu-drawer/MenuDrawer';

const meta = {
	title: 'Site/Nav',
	component: MenuBar,
	parameters: {
		viewport: {
			viewports: INITIAL_VIEWPORTS,
		},
	},
	tags: ['autodocs'],
	argTypes: {},
} satisfies Meta<typeof MenuBar>;

export default meta;
type Story = StoryObj<typeof meta>;

const sectionWithItems = [
	{
		id: 's1',
		title: 'Section 1',
		locale: {
		},
		items: [
			{
				id: 'item1',
				title: 'item 1',
				type: 'article',
				url: '#',
				locale: {
					title: 'Item 11',
				},
				icon: 'pencil',
			},
			{
				id: 'item2',
				title: 'item 2',
				type: 'article',
				url: '#',
				locale: {
					title: 'Item 2',
				},
				icon: 'pencil',
			},
			{
				id: 'item3',
				title: 'item 3',
				type: 'article',
				url: '#',
				locale: {
					title: 'Item 4',
				},
				icon: 'pencil',
			},
		],
	},
	{
		id: 's2',
		locale: {
		},
		title: 'Section 2',
		items: [
			{
				id: 'item1',
				title: 'item 1',
				type: 'article',
				url: '#',
				locale: {
					title: 'Item 11',
				},
				icon: 'pencil',
			},
			{
				id: 'item2',
				title: 'item 2',
				type: 'article',
				url: '#',
				locale: {
					title: 'Item 2',
				},
				icon: 'pencil',
			},
			{
				id: 'item3',
				title: 'item 3',
				type: 'article',
				url: '#',
				locale: {
					title: 'Item 4',
				},
				icon: 'pencil',
			},
		],
	},
];

export const NavBar: Story = {
	args: {
		items: sectionWithItems,
	},
	render: function Render({ items }) {
		return <MenuBar items={items} />;
	},
};

export const NavDrawer: Story = {
	args: {
		items: sectionWithItems,
	},
	render: function Render({ items }) {
		return <MenuDrawer items={items} />;
	},
};

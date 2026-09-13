import * as React from 'react';

/**
 * Colors used when an option does not carry its own color in the column metadata,
 * or when option colors are disabled on the control.
 */
export interface IThemePalette {
  containerBackground: string;
  choiceBackground: string;
  choiceHoverBackground: string;
  choiceText: string;
  selectedBackground: string;
  selectedText: string;
  focusOutline: string;
}

export const lightTheme: IThemePalette = {
  containerBackground: '#ffffff',
  choiceBackground: '#f8f9fa',
  choiceHoverBackground: '#E7EFF7',
  choiceText: '#333333',
  selectedBackground: '#1160B7',
  selectedText: '#ffffff',
  focusOutline: '#1160B7',
};

export const darkTheme: IThemePalette = {
  containerBackground: '#292929',
  choiceBackground: '#666666',
  choiceHoverBackground: '#777777',
  choiceText: '#fefefe',
  selectedBackground: '#141414',
  selectedText: '#ffffff',
  focusOutline: '#8ab4f8',
};

export const getTheme = (isDarkMode: boolean): IThemePalette => (isDarkMode ? darkTheme : lightTheme);

// Room for the hover zoom and focus ring around the pills; without it the host
// container clips them at the edge of the control.
const HORIZONTAL_GUTTER = 6;
const VERTICAL_GUTTER = 2;

// A pill plus its vertical gutters has to add up to the height of a stock form
// field (32px), otherwise the platform's label sits higher than the pill text and
// the field lines up with neither the row above it nor the row below.
const CHOICE_HEIGHT = 32 - VERTICAL_GUTTER * 2;

// Gap between pills: wide enough between columns to read as separate options,
// tighter between rows when the options wrap.
const CHOICE_ROW_GAP = 4;
const CHOICE_COLUMN_GAP = 10;

export const HOVER_SCALE = 1.06;

export const containerStyle = (theme: IThemePalette, isMobile: boolean, disabled: boolean): React.CSSProperties => ({
  padding: `${VERTICAL_GUTTER}px ${isMobile ? VERTICAL_GUTTER : HORIZONTAL_GUTTER}px`,
  overflow: 'visible',
  backgroundColor: theme.containerBackground,
  boxSizing: 'border-box',
  opacity: disabled ? 0.6 : 1,
  pointerEvents: disabled ? 'none' : 'auto',
});

export const choicesStyle = (isMobile: boolean): React.CSSProperties => ({
  display: 'flex',
  flexDirection: isMobile ? 'column' : 'row',
  flexWrap: 'wrap',
  justifyContent: 'flex-start',
  gap: `${CHOICE_ROW_GAP}px ${CHOICE_COLUMN_GAP}px`,
  width: '100%',
});

export const choiceBaseStyle: React.CSSProperties = {
  padding: '5px 10px',
  height: `${CHOICE_HEIGHT}px`,
  borderRadius: '6px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexGrow: 0,
  flexBasis: 'auto',
  boxSizing: 'border-box',
  whiteSpace: 'nowrap',
  userSelect: 'none',
  outline: 'none',
  transition: 'background-color 0.2s, color 0.2s, transform 0.2s, box-shadow 0.2s',
};

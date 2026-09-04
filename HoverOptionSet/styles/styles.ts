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

// Horizontal room for the hover zoom and focus ring on the first/last pill in a row;
// without it the host container clips them at the edge.
const HOVER_SCALE_GUTTER = '6px';

export const HOVER_SCALE = 1.06;

export const containerStyle = (theme: IThemePalette, isMobile: boolean, disabled: boolean): React.CSSProperties => ({
  padding: isMobile ? '5px' : `2px ${HOVER_SCALE_GUTTER}`,
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
  width: '100%',
});

export const choiceBaseStyle: React.CSSProperties = {
  margin: '5px',
  padding: '5px 10px',
  height: '30px',
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

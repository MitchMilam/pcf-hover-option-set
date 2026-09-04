import * as React from 'react';
import { useState } from 'react';
import { getContrastText, normalizeHexColor, withAlpha } from './colorUtils';
import {
  HOVER_SCALE,
  IThemePalette,
  choiceBaseStyle,
  choicesStyle,
  containerStyle,
  getTheme,
} from './styles/styles';

export interface IHoverOptionSetProps {
  selectedValue: number | null;
  options: ComponentFramework.PropertyHelper.OptionMetadata[];
  onChange: (newValue: number | null) => void;
  isDarkMode: boolean;
  disabled: boolean;
  formFactor: number;
  /** Clicking (or pressing Enter/Space on) the selected option clears the value. */
  allowClear: boolean;
  /** Render options using the color defined on the choice value, when one exists. */
  useOptionColors: boolean;
}

// ComponentFramework.FormFactor: 0 = Unknown, 1 = Desktop, 2 = Tablet, 3 = Phone
const isMobileFormFactor = (formFactor: number): boolean => formFactor === 2 || formFactor === 3;

interface IChoiceVisualState {
  backgroundColor: string;
  color: string;
}

/**
 * Works out the background, text and indicator colors for one option, given its
 * selection/hover state. Options that carry a color in the column metadata are
 * filled with that color when selected and tinted with it on hover; everything
 * else falls back to the theme palette.
 */
const getChoiceVisualState = (
  optionColor: string | null,
  isSelected: boolean,
  isHovered: boolean,
  theme: IThemePalette
): IChoiceVisualState => {
  if (optionColor) {
    if (isSelected) {
      return { backgroundColor: optionColor, color: getContrastText(optionColor) };
    }
    return {
      backgroundColor: isHovered ? withAlpha(optionColor, 0.18) : theme.choiceBackground,
      color: theme.choiceText,
    };
  }

  if (isSelected) {
    return { backgroundColor: theme.selectedBackground, color: theme.selectedText };
  }
  return {
    backgroundColor: isHovered ? theme.choiceHoverBackground : theme.choiceBackground,
    color: theme.choiceText,
  };
};

export const HoverOptionSetComponent: React.FunctionComponent<IHoverOptionSetProps> = (props) => {
  const { selectedValue, options, onChange, isDarkMode, disabled, formFactor, allowClear, useOptionColors } = props;

  const [hoveredValue, setHoveredValue] = useState<number | null>(null);
  const [focusedValue, setFocusedValue] = useState<number | null>(null);
  // Mimics :focus-visible (not usable from inline styles): the focus ring is shown
  // only when focus was reached via the keyboard, not after a mouse click.
  const [keyboardFocus, setKeyboardFocus] = useState(false);

  const theme = getTheme(isDarkMode);
  const isMobile = isMobileFormFactor(formFactor);

  const selectOption = (value: number): void => {
    if (disabled) {
      return;
    }
    if (value === selectedValue) {
      if (allowClear) {
        onChange(null);
      }
      return;
    }
    onChange(value);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, value: number): void => {
    setKeyboardFocus(true);
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectOption(value);
    }
  };

  return (
    <div style={containerStyle(theme, isMobile, disabled)}>
      <div role="radiogroup" aria-disabled={disabled} style={choicesStyle(isMobile)}>
        {options.map((item) => {
          const isSelected = selectedValue === item.Value;
          const isHovered = hoveredValue === item.Value;
          const showFocusRing = keyboardFocus && focusedValue === item.Value;
          const optionColor = useOptionColors ? normalizeHexColor(item.Color) : null;
          const visual = getChoiceVisualState(optionColor, isSelected, isHovered, theme);

          return (
            <div
              key={item.Value}
              role="radio"
              aria-checked={isSelected}
              aria-label={item.Label}
              tabIndex={disabled ? -1 : 0}
              title={isSelected && allowClear && !disabled ? `${item.Label} (click again to clear)` : item.Label}
              style={{
                ...choiceBaseStyle,
                backgroundColor: visual.backgroundColor,
                color: visual.color,
                cursor: disabled ? 'not-allowed' : 'pointer',
                transform: isHovered && !isMobile ? `scale(${HOVER_SCALE})` : 'scale(1)',
                boxShadow: showFocusRing ? `0 0 0 2px ${theme.focusOutline}` : 'none',
              }}
              onMouseDown={() => setKeyboardFocus(false)}
              onClick={() => selectOption(item.Value)}
              onKeyDown={(e) => onKeyDown(e, item.Value)}
              onMouseEnter={() => setHoveredValue(item.Value)}
              onMouseLeave={() => setHoveredValue(null)}
              onFocus={() => setFocusedValue(item.Value)}
              onBlur={() => setFocusedValue(null)}
            >
              <span>{item.Label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

HoverOptionSetComponent.displayName = 'HoverOptionSet';

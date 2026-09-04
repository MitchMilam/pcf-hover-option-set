# Hover Option Set PCF Component

## Overview

The Hover Option Set PCF (PowerApps Component Framework) component provides a modern and interactive, user-friendly interface for selecting options. Built using TypeScript and React, this component maintains the look and feel consistent with modern web applications and Microsoft products. The option set is designed to fit seamlessly into a option set field, making it an elegant solution for option selection in your applications.

<p align="center">
  <img src="https://github.com/user-attachments/assets/1f064e7b-6457-4bfc-83fb-a384c3f82a42" alt="PCFHoverOptionSet_light" width="350" style="margin-right: 10px;"/>
  <img src="https://github.com/user-attachments/assets/70dcb82b-9405-44fa-a9d3-26246617e2de" alt="PCFHoverOptionSet_dark" width="350"/>
</p>

## Features

- **Option Selection**: Easily select an option.
- **Clear Value**: Click the selected option again to clear the column (can be turned off per control instance).
- **Option Colors**: Options that have a color defined on the choice value are filled with that color when selected (and tinted with it on hover), with text contrast chosen automatically. Options without a color use the default theme.
- **Hover Animation**: Enhanced user interaction with hover animations.
- **Keyboard Accessible**: Options are focusable and can be toggled with Enter or Space; the group is exposed to assistive technology as a radio group.
- **Responsive**: Leverages React to deliver dynamic, responsive behavior that adapts to the context's form factor.
- **Dark Mode**: Supports the native dark mode in model-driven apps.
- **Stays in Sync**: Reflects value changes made by form scripts or business rules, not just user clicks.
- **Field Type**: Applied in a option set field (choice), ideal for form integration.

## Configuration

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| Option Set | Bound (OptionSet) | — | The choice column the control is bound to. |
| Allow clear | Input (TwoOptions) | Yes | When enabled, clicking the selected option again clears the value. |
| Use option colors | Input (TwoOptions) | Yes | When enabled, options with a color in the column metadata are rendered with that color. |

## Usage

Click here to [download](https://github.com/nunosubtil/pcf-hover-option-set/releases/tag/v1.0.0.1) the managed solution that you can use to import the control into your environment.

## License

This project is licensed under the terms of the MIT license. See the **LICENSE** file for details.

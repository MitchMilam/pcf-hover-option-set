import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { HoverOptionSetComponent, IHoverOptionSetProps } from "./HoverOptionSet";
import * as React from "react";

export class PCFHoverOptionSet implements ComponentFramework.ReactControl<IInputs, IOutputs> {
    private notifyOutputChanged: () => void;
    private _selectedValue: number | null = null;

    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        state: ComponentFramework.Dictionary
    ): void {
        this.notifyOutputChanged = notifyOutputChanged;
        this._selectedValue = context.parameters.optionsetFieldControl.raw ?? null;
    }

    public updateView(context: ComponentFramework.Context<IInputs>): React.ReactElement {
        const optionSet = context.parameters.optionsetFieldControl;

        // Always take the current value and option list from the context rather than
        // caching them in init(), so changes made outside the control (form scripts,
        // business rules, record navigation) are reflected immediately.
        this._selectedValue = optionSet.raw ?? null;

        const props: IHoverOptionSetProps = {
            selectedValue: this._selectedValue,
            options: optionSet.attributes?.Options ?? [],
            onChange: this._updateValue.bind(this),
            isDarkMode: context.fluentDesignLanguage?.isDarkTheme ?? false,
            formFactor: context.client.getFormFactor(),
            disabled: context.mode.isControlDisabled,
            allowClear: context.parameters.allowClear?.raw ?? true,
            useOptionColors: context.parameters.useOptionColors?.raw ?? true,
        };

        return React.createElement(HoverOptionSetComponent, props);
    }

    private _updateValue(newValue: number | null): void {
        if (newValue === this._selectedValue) {
            return;
        }
        this._selectedValue = newValue;
        this.notifyOutputChanged();
    }

    public getOutputs(): IOutputs {
        // The platform only clears a bound column when the output is explicitly null;
        // returning undefined leaves the existing value untouched. The generated
        // IOutputs type declares the property as an optional number, so the null has
        // to be cast to satisfy the compiler.
        return {
            optionsetFieldControl: this._selectedValue === null
                ? (null as unknown as number)
                : this._selectedValue
        };
    }

    public destroy(): void {
        // Nothing to clean up; React unmounts the virtual control tree.
    }
}

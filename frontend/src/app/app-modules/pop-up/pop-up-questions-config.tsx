import { DynamicComponentRenderer } from "@/components/app/dynamic-component-renderer"
import { ToggleSwitchProps } from "@/components/app/checkbox/switch"
import { DropDownProps } from "@/components/app/dropDown/dropDown"
import { TextFieldProps } from "@/components/app/text-field/text-field"
import { RadioBarProps } from "@/components/app/radios/radio-bar"

interface SwitchComponentState {
  activeLabel: string
  inactiveLabel: string
  checked: boolean
}

interface TextInputState {
  label: string
  placeholder: string
}

interface RadioBarState {
  name: string
  buttons: string[]
}

interface CheckboxTilesState {
  name: string
  buttons: string[]
}

interface DropDownState {
  options: string[]
  selectedOption: string
}

type Builders = {
  selectedType: string
  setSelectedType: (v: string) => void
  setQuestionText: (v: string) => void
  switch: { value: SwitchComponentState; set: React.Dispatch<React.SetStateAction<SwitchComponentState>> }
  textInput: { value: TextInputState; set: React.Dispatch<React.SetStateAction<TextInputState>> }
  radioBar: { value: RadioBarState; set: React.Dispatch<React.SetStateAction<RadioBarState>> }
  checkboxTiles: { value: CheckboxTilesState; set: React.Dispatch<React.SetStateAction<CheckboxTilesState>> }
  dropDown: { value: DropDownState; set: React.Dispatch<React.SetStateAction<DropDownState>> }
}

interface PopupConfig {
  components: React.ReactNode[]
  questionText: string
}

const supportedQuestionTypes = ["TextInput", "Switch", "RadioBar", "CheckboxTiles", "DropDown"]

export function getPopupComponentsAndOptions(b: Builders): PopupConfig {
  const typeSelector = (
    <DynamicComponentRenderer
      key="type-selector"
      component="RadioBar"
      option={{
        optionProps: {
          buttons: supportedQuestionTypes.map((key) => ({ label: key, value: key })),
          name: "Which question type do you want to create?",
          selectedValue: b.selectedType,
          test_id: "radio-bar-question-type",
          onChange: b.setSelectedType,
        } as RadioBarProps,
      }}
      showQuestionText={false}
    />
  )

  const questionTextField = (
    <DynamicComponentRenderer
      key="question-text"
      component="TextInput"
      option={{
        optionProps: {
          label: "Question text",
          placeholder: "Type the question...",
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => b.setQuestionText(e.target.value),
          name: "questionText",
        } as TextFieldProps,
      }}
      showQuestionText={false}
    />
  )

  switch (b.selectedType) {
    case "Switch":
      return {
        components: [
          typeSelector,
          questionTextField,
          <DynamicComponentRenderer
            key="active-label"
            component="TextInput"
            option={{
              optionProps: {
                label: "Active label",
                placeholder: "Enter active label...",
                onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                  b.switch.set((prev) => ({ ...prev, activeLabel: e.target.value })),
                name: "activeLabel",
              } as TextFieldProps,
            }}
            showQuestionText={false}
          />,
          <DynamicComponentRenderer
            key="inactive-label"
            component="TextInput"
            option={{
              optionProps: {
                label: "Inactive label",
                placeholder: "Enter inactive label...",
                onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                  b.switch.set((prev) => ({ ...prev, inactiveLabel: e.target.value })),
                name: "inactiveLabel",
              } as TextFieldProps,
            }}
            showQuestionText={false}
          />,
          <DynamicComponentRenderer
            key="default-state"
            component="Switch"
            option={{
              optionProps: {
                activeLabel: "Default ON",
                inactiveLabel: "Default OFF",
                checked: b.switch?.value?.checked ?? false,
                onChange: (checked: boolean) => b.switch.set((prev) => ({ ...prev, checked })),
                name: "defaultState",
              } as ToggleSwitchProps,
            }}
            questionText="Default state"
          />,
        ],
        questionText: "Configure Switch Question",
      }
    case "TextInput":
      return {
        components: [
          typeSelector,
          questionTextField,
          <DynamicComponentRenderer
            key="field-label"
            component="TextInput"
            option={{
              optionProps: {
                label: "Field label",
                placeholder: "Enter field label...",
                onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                  b.textInput.set((prev) => ({ ...prev, label: e.target.value })),
                name: "fieldLabel",
              } as TextFieldProps,
            }}
            showQuestionText={false}
          />,
          <DynamicComponentRenderer
            key="placeholder-text"
            component="TextInput"
            option={{
              optionProps: {
                label: "Placeholder",
                placeholder: "Enter placeholder text...",
                onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                  b.textInput.set((prev) => ({ ...prev, placeholder: e.target.value })),
                name: "placeholderText",
              } as TextFieldProps,
            }}
            showQuestionText={false}
          />,
        ],
        questionText: "Configure Text Input Question",
      }
    case "RadioBar":
      return {
        components: [
          typeSelector,
          questionTextField,
          <DynamicComponentRenderer
            key="group-name"
            component="TextInput"
            option={{
              optionProps: {
                label: "Group name",
                placeholder: "Enter group name...",
                onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                  b.radioBar.set((prev) => ({ ...prev, name: e.target.value })),
                name: "groupName",
              } as TextFieldProps,
            }}
            showQuestionText={false}
          />,
          <div key="options-list" className="space-y-2">
            <label className="block text-sm font-medium text-foreground">Options</label>
            <div className="space-y-2">
              {b.radioBar.value.buttons.map((button, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={button}
                    onChange={(e) => {
                      const updated = [...b.radioBar.value.buttons]
                      updated[index] = e.target.value
                      b.radioBar.set((prev) => ({ ...prev, buttons: updated }))
                    }}
                    placeholder="Enter option..."
                    className="flex-1 px-3 py-2 border border-border rounded-md shadow-sm bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                  <button
                    onClick={() => {
                      const updated = b.radioBar.value.buttons.filter((_, i) => i !== index)
                      b.radioBar.set((prev) => ({ ...prev, buttons: updated }))
                    }}
                    className="px-3 py-2 text-muted-foreground hover:text-destructive font-semibold text-lg transition-colors"
                    title="Delete option"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() =>
                b.radioBar.set((prev) => ({ ...prev, buttons: [...prev.buttons, ""] }))
              }
              className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm font-medium transition-colors"
            >
              + Add extra option
            </button>
          </div>,
        ],
        questionText: "Configure Radio Bar Question",
      }
    case "CheckboxTiles":
      return {
        components: [
          typeSelector,
          questionTextField,
          <DynamicComponentRenderer
            key="checkbox-tiles-group-name"
            component="TextInput"
            option={{
              optionProps: {
                label: "Group name",
                placeholder: "Enter group name...",
                onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                  b.checkboxTiles.set((prev) => ({ ...prev, name: e.target.value })),
                name: "checkboxTilesGroupName",
              } as TextFieldProps,
            }}
            showQuestionText={false}
          />,
          <div key="checkbox-tiles-options-list" className="space-y-2">
            <label className="block text-sm font-medium text-foreground">Options</label>
            <div className="space-y-2">
              {b.checkboxTiles.value.buttons.map((button, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={button}
                    onChange={(e) => {
                      const updated = [...b.checkboxTiles.value.buttons]
                      updated[index] = e.target.value
                      b.checkboxTiles.set((prev) => ({ ...prev, buttons: updated }))
                    }}
                    placeholder="Enter option..."
                    className="flex-1 px-3 py-2 border border-border rounded-md shadow-sm bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                  <button
                    onClick={() => {
                      const updated = b.checkboxTiles.value.buttons.filter((_, i) => i !== index)
                      b.checkboxTiles.set((prev) => ({ ...prev, buttons: updated }))
                    }}
                    className="px-3 py-2 text-muted-foreground hover:text-destructive font-semibold text-lg transition-colors"
                    title="Delete option"
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() =>
                b.checkboxTiles.set((prev) => ({ ...prev, buttons: [...prev.buttons, ""] }))
              }
              className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm font-medium transition-colors"
            >
              + Add extra option
            </button>
          </div>,
        ],
        questionText: "Configure Checkbox Tiles Question",
      }
    case "DropDown":
      return {
        components: [
          typeSelector,
          questionTextField,
          <div key="dropdown-options-list" className="space-y-2">
            <label className="block text-sm font-medium text-foreground">Options</label>
            <div className="space-y-2">
              {b.dropDown.value.options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const updated = [...b.dropDown.value.options]
                      updated[index] = e.target.value
                      b.dropDown.set((prev) => ({
                        ...prev,
                        options: updated,
                        selectedOption: updated.includes(prev.selectedOption) ? prev.selectedOption : (updated[0] ?? ""),
                      }))
                    }}
                    placeholder="Enter option..."
                    className="flex-1 px-3 py-2 border border-border rounded-md shadow-sm bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                  <button
                    onClick={() => {
                      const updated = b.dropDown.value.options.filter((_, i) => i !== index)
                      b.dropDown.set((prev) => ({
                        ...prev,
                        options: updated,
                        selectedOption: updated.includes(prev.selectedOption) ? prev.selectedOption : (updated[0] ?? ""),
                      }))
                    }}
                    className="px-3 py-2 text-muted-foreground hover:text-destructive font-semibold text-lg transition-colors"
                    title="Delete option"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() =>
                b.dropDown.set((prev) => ({
                  ...prev,
                  options: [...prev.options, ""],
                }))
              }
              className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm font-medium transition-colors"
            >
              + Add extra option
            </button>
          </div>,
          <DynamicComponentRenderer
            key="dropdown-default-value"
            component="DropDown"
            option={{
              optionProps: {
                label: "Default selected value",
                options: b.dropDown.value.options
                  .filter((option) => option.trim() !== "")
                  .map((option) => ({ label: option, value: option })),
                selectedOption: b.dropDown.value.selectedOption,
                onSelect: (selectedOption: string) =>
                  b.dropDown.set((prev) => ({ ...prev, selectedOption })),
                id: "drop-down-default-option",
                name: "dropDownDefaultOption",
                test_id: "drop-down-default-option",
                disabled: b.dropDown.value.options.filter((o) => o.trim() !== "").length === 0,
              } as DropDownProps,
            }}
            showQuestionText={false}
          />,
        ],
        questionText: "Configure Dropdown Question",
      }
    default:
      return {
        components: [typeSelector, questionTextField],
        questionText: "Create New Question",
      }
  }
}

import { DynamicComponentRenderer } from "@/components/app/dynamic-component-renderer"
import { ToggleSwitchProps } from "@/components/app/checkbox/checkbox"
import { DropDownProps } from "@/components/app/dropDown/dropDown"
import { TextFieldProps } from "@/components/app/text-field/text-field"
import { RadioBarProps } from "@/components/app/radios/radio-bar"

interface CheckboxState {
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

interface DropDownState {
  options: string[]
  selectedOption: string
}

type Builders = {
  selectedType: string
  setSelectedType: (v: string) => void
  setQuestionText: (v: string) => void
  checkbox: { value: CheckboxState; set: React.Dispatch<React.SetStateAction<CheckboxState>> }
  textInput: { value: TextInputState; set: React.Dispatch<React.SetStateAction<TextInputState>> }
  radioBar: { value: RadioBarState; set: React.Dispatch<React.SetStateAction<RadioBarState>> }
  dropDown: { value: DropDownState; set: React.Dispatch<React.SetStateAction<DropDownState>> }
}

interface PopupConfig {
  components: React.ReactNode[]
  questionText: string
}

const supportedQuestionTypes = ["TextInput", "Checkbox", "RadioBar", "DropDown"]

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
    case "Checkbox":
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
                  b.checkbox.set((prev) => ({ ...prev, activeLabel: e.target.value })),
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
                  b.checkbox.set((prev) => ({ ...prev, inactiveLabel: e.target.value })),
                name: "inactiveLabel",
              } as TextFieldProps,
            }}
            showQuestionText={false}
          />,
          <DynamicComponentRenderer
            key="default-state"
            component="Checkbox"
            option={{
              optionProps: {
                activeLabel: "Default ON",
                inactiveLabel: "Default OFF",
                checked: b.checkbox.value?.checked ?? false,
                onChange: (checked: boolean) => b.checkbox.set((prev) => ({ ...prev, checked })),
                name: "defaultState",
              } as ToggleSwitchProps,
            }}
            questionText="Default state"
          />,
        ],
        questionText: "Configure Checkbox Question",
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
          <DynamicComponentRenderer
            key="options-list"
            component="TextInput"
            option={{
              optionProps: {
                label: "Options (comma-separated)",
                placeholder: "Example: Red,Green,Blue",
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                  const parsed = String(e.target.value)
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean)
                  b.radioBar.set((prev) => ({ ...prev, buttons: parsed }))
                },
                name: "optionsList",
              } as TextFieldProps,
            }}
            showQuestionText={false}
          />,
        ],
        questionText: "Configure Radio Bar Question",
      }
    case "DropDown":
      return {
        components: [
          typeSelector,
          questionTextField,
          <DynamicComponentRenderer
            key="dropdown-options-list"
            component="TextInput"
            option={{
              optionProps: {
                label: "Options (comma-separated)",
                placeholder: "Example: Small,Medium,Large",
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                  const parsed = String(e.target.value)
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean)
                  b.dropDown.set((prev) => ({
                    ...prev,
                    options: parsed,
                    selectedOption: parsed.includes(prev.selectedOption) ? prev.selectedOption : (parsed[0] ?? ""),
                  }))
                },
                name: "dropDownOptionsList",
              } as TextFieldProps,
            }}
            showQuestionText={false}
          />,
          <DynamicComponentRenderer
            key="dropdown-default-value"
            component="DropDown"
            option={{
              optionProps: {
                label: "Default selected value",
                options: b.dropDown.value.options.map((option) => ({ label: option, value: option })),
                selectedOption: b.dropDown.value.selectedOption,
                onSelect: (selectedOption: string) =>
                  b.dropDown.set((prev) => ({ ...prev, selectedOption })),
                id: "drop-down-default-option",
                name: "dropDownDefaultOption",
                test_id: "drop-down-default-option",
                disabled: b.dropDown.value.options.length === 0,
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

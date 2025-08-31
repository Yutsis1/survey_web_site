import { componentMapping } from "@/app/components/interfaceMapping"
import { DynamicComponentRenderer } from "@/app/components/dynamic-component-renderer"
import { ToggleSwitchProps } from "@/app/components/checkbox/checkbox"
import { TextFieldProps } from "@/app/components/text-field/text-field"
import { RadioBarProps } from "@/app/components/radios/radio-bar"

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

type Builders = {
  selectedType: string
  setSelectedType: (v: string) => void
  setQuestionText: (v: string) => void
  checkbox: { value: CheckboxState; set: React.Dispatch<React.SetStateAction<CheckboxState>> }
  textInput: { value: TextInputState; set: React.Dispatch<React.SetStateAction<TextInputState>> }
  radioBar: { value: RadioBarState; set: React.Dispatch<React.SetStateAction<RadioBarState>> }
}

interface PopupConfig {
  components: React.ReactNode[]
  questionText: string
}

export function getPopupComponentsAndOptions(b: Builders): PopupConfig {
  const typeSelector = (
    <DynamicComponentRenderer
      key="type-selector"
      component="RadioBar"
      option={{
        optionProps: {
          buttons: Object.keys(componentMapping).map(key => ({ label: key, value: key })),
          name: 'Which question type do you want to create?',
          selectedValue: b.selectedType,
          test_id: 'radio-bar-question-type',
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
          label: 'Question text',
          placeholder: 'Type the question…',
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => b.setQuestionText(e.target.value),
          name: 'questionText',
        } as TextFieldProps,
      }}
      showQuestionText={false}
    />
  )

  switch (b.selectedType) {
    case 'Checkbox':
      return {
        components: [
          typeSelector,
          questionTextField,
          <DynamicComponentRenderer
            key="active-label"
            component="TextInput"
            option={{
              optionProps: {
                label: 'Active label',
                placeholder: 'Enter active label...',
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => 
                  b.checkbox.set(prev => ({ ...prev, activeLabel: e.target.value })),
                name: 'activeLabel',
              } as TextFieldProps,
            }}
            showQuestionText={false}
          />,
          <DynamicComponentRenderer
            key="inactive-label"
            component="TextInput"
            option={{
              optionProps: {
                label: 'Inactive label',
                placeholder: 'Enter inactive label...',
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => 
                  b.checkbox.set(prev => ({ ...prev, inactiveLabel: e.target.value })),
                name: 'inactiveLabel',
              } as TextFieldProps,
            }}
            showQuestionText={false}
          />,
          <DynamicComponentRenderer
            key="default-state"
            component="Checkbox"
            option={{
              optionProps: {
                activeLabel: 'Default ON',
                inactiveLabel: 'Default OFF',
                checked: b.checkbox.value?.checked ?? false,
                onChange: (checked: boolean) => 
                  b.checkbox.set(prev => ({ ...prev, checked })),
                id: 'checkbox-default-state',
                name: 'defaultState',
              } as ToggleSwitchProps,
            }}
            questionText="Default state"
          />,
        ],
        questionText: 'Configure Checkbox Question'
      }
    case 'TextInput':
      return {
        components: [
          typeSelector,
          questionTextField,
          <DynamicComponentRenderer
            key="field-label"
            component="TextInput"
            option={{
              optionProps: {
                label: 'Field label',
                placeholder: 'Enter field label...',
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => 
                  b.textInput.set(prev => ({ ...prev, label: e.target.value })),
                id: 'textinput-field-label',
                name: 'fieldLabel',
              } as TextFieldProps,
            }}
            showQuestionText={false}
          />,
          <DynamicComponentRenderer
            key="placeholder-text"
            component="TextInput"
            option={{
              optionProps: {
                label: 'Placeholder',
                placeholder: 'Enter placeholder text...',
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => 
                  b.textInput.set(prev => ({ ...prev, placeholder: e.target.value })),
                name: 'placeholderText',
              } as TextFieldProps,
            }}
            showQuestionText={false}
          />,
        ],
        questionText: 'Configure Text Input Question'
      }
    case 'RadioBar':
      return {
        components: [
          typeSelector,
          questionTextField,
          <DynamicComponentRenderer
            key="group-name"
            component="TextInput"
            option={{
              optionProps: {
                label: 'Group name',
                placeholder: 'Enter group name...',
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => 
                  b.radioBar.set(prev => ({ ...prev, name: e.target.value })),
                name: 'groupName',
              } as TextFieldProps,
            }}
            showQuestionText={false}
          />,
          <DynamicComponentRenderer
            key="options-list"
            component="TextInput"
            option={{
              optionProps: {
                label: 'Options (comma-separated)',
                placeholder: 'Example: Red,Green,Blue',
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                  const parsed = String(e.target.value)
                    .split(',')
                    .map(t => t.trim())
                    .filter(Boolean)
                  b.radioBar.set(prev => ({ ...prev, buttons: parsed }))
                },
                name: 'optionsList',
              } as TextFieldProps,
            }}
            showQuestionText={false}
          />,
        ],
        questionText: 'Configure Radio Bar Question'
      }
    default:
      return {
        components: [typeSelector, questionTextField],
        questionText: 'Create New Question'
      }
  }
}

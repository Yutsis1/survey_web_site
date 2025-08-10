import { componentMapping, ComponentPropsMapping, Option } from "@/app/components/interfaceMapping"

type Builders = {
  selectedType: string
  setSelectedType: (v: string) => void
  setQuestionText: (v: string) => void
  checkbox: { value: any; set: (u: any) => void }
  textInput: { value: any; set: (u: any) => void }
  radioBar: { value: any; set: (u: any) => void }
}

export function getPopupComponentsAndOptions(b: Builders): {
  components: (keyof ComponentPropsMapping)[]
  options: Option<any>[]
} {
  const typeSelector: Option<any> = {
    optionProps: {
      buttons: Object.keys(componentMapping).map(key => ({ label: key, value: key })),
      name: 'Which question type do you want to create?',
      selectedValue: b.selectedType,
      test_id: 'radio-bar-question-type',
      onChange: b.setSelectedType,
    },
  }

  const questionTextField: Option<any> = {
    optionProps: {
      label: 'Question text',
      placeholder: 'Type the question…',
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => b.setQuestionText(e.target.value),
    },
  }

  const none = { components: [], options: [] as Option<any>[] }

  switch (b.selectedType) {
    case 'Checkbox':
      return {
        components: ['RadioBar', 'TextInput', 'TextInput', 'TextInput', 'Checkbox'],
        options: [
          typeSelector, questionTextField,
          { optionProps: { label: 'Active label', onChange: (e: any) => b.checkbox.set((s: any)=>({ ...s, activeLabel: e.target.value })) }},
          { optionProps: { label: 'Inactive label', onChange: (e: any) => b.checkbox.set((s: any)=>({ ...s, inactiveLabel: e.target.value })) }},
          { optionProps: { activeLabel: 'Default ON', inactiveLabel: 'Default OFF', checked: b.checkbox.value?.checked ?? false,
              onChange: (checked: boolean) => b.checkbox.set((s: any)=>({ ...s, checked })) } },
        ],
      }
    case 'TextInput':
      return {
        components: ['RadioBar', 'TextInput', 'TextInput', 'TextInput'],
        options: [
          typeSelector, questionTextField,
          { optionProps: { label: 'Field label', onChange: (e: any) => b.textInput.set((s: any)=>({ ...s, label: e.target.value })) }},
          { optionProps: { label: 'Placeholder', onChange: (e: any) => b.textInput.set((s: any)=>({ ...s, placeholder: e.target.value })) }},
        ],
      }
    case 'RadioBar':
      return {
        components: ['RadioBar', 'TextInput', 'TextInput', 'TextInput'],
        options: [
          typeSelector, questionTextField,
          { optionProps: { label: 'Group name', onChange: (e: any) => b.radioBar.set((s: any)=>({ ...s, name: e.target.value })) }},
          { optionProps: { label: 'Options (comma-separated)',  placeholder: 'Example: Red,Green,Blue', onChange: (e: any) => {
              const parsed = String(e.target.value).split(',').map((t)=>t.trim()).filter(Boolean)
              b.radioBar.set((s: any)=>({ ...s, buttons: parsed }))
            }}},
        ],
      }
    default:
      return { components: ['RadioBar', 'TextInput'], options: [typeSelector, questionTextField] }
  }
}

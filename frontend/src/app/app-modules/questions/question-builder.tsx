import { useState } from 'react'
import { DEFAULTS } from './question-defaults'
import { CreateConfig } from './question-types'


export function useQuestionBuilder() {
  const [selectedType, setSelectedType] = useState<string>('')  
  const [questionText, setQuestionText] = useState<string>(DEFAULTS.questionText)
  const [checkbox, setCheckbox] = useState(DEFAULTS.checkbox)
  const [textInput, setTextInput] = useState(DEFAULTS.textInput)
  const [radioBar, setRadioBar] = useState(DEFAULTS.radioBar)

  const buildConfig = (): CreateConfig => ({
    questionText,
    checkbox,
    textInput,
    radioBar,
  })

  const reset = () => {
    setSelectedType('')
    setQuestionText(DEFAULTS.questionText)
    setCheckbox(DEFAULTS.checkbox)
    setTextInput(DEFAULTS.textInput)
    setRadioBar(DEFAULTS.radioBar)
  }

  return {
    selectedType, setSelectedType,
    questionText, setQuestionText,
    checkbox: { value: checkbox, set: setCheckbox },
    textInput: { value: textInput, set: setTextInput },
    radioBar: { value: radioBar, set: setRadioBar },
    buildConfig,
    reset,
  }
}

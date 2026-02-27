import { useState } from 'react'
import { DEFAULTS } from './question-defaults'
import { CreateConfig } from './question-types'


export function useQuestionBuilder() {
  const [selectedType, setSelectedType] = useState<string>('')  
  const [questionText, setQuestionText] = useState<string>(DEFAULTS.questionText)
  const [checkbox, setCheckbox] = useState(DEFAULTS.checkbox)
  const [checkboxTiles, setCheckboxTiles] = useState(DEFAULTS.checkboxTiles)
  const [textInput, setTextInput] = useState(DEFAULTS.textInput)
  const [radioBar, setRadioBar] = useState(DEFAULTS.radioBar)
  const [dropDown, setDropDown] = useState(DEFAULTS.dropDown)

  const buildConfig = (): CreateConfig => ({
    questionText,
    checkbox,
    checkboxTiles,
    textInput,
    radioBar,
    dropDown,
  })

  const reset = () => {
    setSelectedType('')
    setQuestionText(DEFAULTS.questionText)
    setCheckbox(DEFAULTS.checkbox)
    setCheckboxTiles(DEFAULTS.checkboxTiles)
    setTextInput(DEFAULTS.textInput)
    setRadioBar(DEFAULTS.radioBar)
    setDropDown(DEFAULTS.dropDown)
  }

  return {
    selectedType, setSelectedType,
    questionText, setQuestionText,
    checkbox: { value: checkbox, set: setCheckbox },
    checkboxTiles: { value: checkboxTiles, set: setCheckboxTiles },
    textInput: { value: textInput, set: setTextInput },
    radioBar: { value: radioBar, set: setRadioBar },
    dropDown: { value: dropDown, set: setDropDown },
    buildConfig,
    reset,
  }
}

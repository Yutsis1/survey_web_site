import { useState } from 'react'
import { DEFAULTS } from './question-defaults'
import { CreateConfig } from './question-types'


export function useQuestionBuilder() {
  const [selectedType, setSelectedType] = useState<string>('')  
  const [questionText, setQuestionText] = useState<string>(DEFAULTS.questionText)
  const [switchControl, setSwitchControl] = useState(DEFAULTS.switch)
  const [checkboxTiles, setCheckboxTiles] = useState(DEFAULTS.checkboxTiles)
  const [textInput, setTextInput] = useState(DEFAULTS.textInput)
  const [radioBar, setRadioBar] = useState(DEFAULTS.radioBar)
  const [dropDown, setDropDown] = useState(DEFAULTS.dropDown)

  const buildConfig = (): CreateConfig => ({
    questionText,
    switch: switchControl,
    checkboxTiles,
    textInput,
    radioBar,
    dropDown,
  })

  const reset = () => {
    setSelectedType('')
    setQuestionText(DEFAULTS.questionText)
    setSwitchControl(DEFAULTS.switch)
    setCheckboxTiles(DEFAULTS.checkboxTiles)
    setTextInput(DEFAULTS.textInput)
    setRadioBar(DEFAULTS.radioBar)
    setDropDown(DEFAULTS.dropDown)
  }

  return {
    selectedType, setSelectedType,
    questionText, setQuestionText,
    switch: { value: switchControl, set: setSwitchControl },
    checkboxTiles: { value: checkboxTiles, set: setCheckboxTiles },
    textInput: { value: textInput, set: setTextInput },
    radioBar: { value: radioBar, set: setRadioBar },
    dropDown: { value: dropDown, set: setDropDown },
    buildConfig,
    reset,
  }
}

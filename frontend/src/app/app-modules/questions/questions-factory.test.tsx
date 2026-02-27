import { describe, expect, it } from 'vitest'
import { createNewQuestion } from './questions-factory'

describe('createNewQuestion', () => {
  it('creates a non-shrinkable TextInput layout', () => {
    const question = createNewQuestion(
      'TextInput',
      {
        questionText: 'Your name',
        textInput: {
          label: 'Name',
          placeholder: 'Type here',
        },
      },
      0
    )

    expect(question.layout).toMatchObject({
      w: 3,
      h: 3,
      minW: 3,
      minH: 3,
    })
  })

  it('creates a non-shrinkable RadioBar layout', () => {
    const question = createNewQuestion(
      'RadioBar',
      {
        questionText: 'Pick one',
        radioBar: {
          name: 'choices',
          buttons: ['A', 'B'],
        },
      },
      1
    )

    expect(question.layout).toMatchObject({
      w: 3,
      h: 3,
      minW: 3,
      minH: 3,
    })
  })

  it('creates a non-shrinkable CheckboxTiles layout with configured options', () => {
    const question = createNewQuestion(
      'CheckboxTiles',
      {
        questionText: 'Pick all that apply',
        checkboxTiles: {
          name: 'multi-select',
          buttons: ['A', 'B', 'C'],
        },
      },
      1
    )

    expect(question.component).toBe('CheckboxTiles')
    expect(question.layout).toMatchObject({
      w: 3,
      h: 3,
      minW: 3,
      minH: 3,
    })
    expect(question.option.optionProps).toMatchObject({
      name: 'multi-select',
      buttons: [
        { label: 'A', value: 'A' },
        { label: 'B', value: 'B' },
        { label: 'C', value: 'C' },
      ],
    })
  })

  it('creates a dropdown question with configured options and selected option', () => {
    const question = createNewQuestion(
      'DropDown',
      {
        questionText: 'Choose your size',
        dropDown: {
          options: ['Small', 'Medium', 'Large'],
          selectedOption: 'Medium',
        },
      },
      0
    )

    expect(question.component).toBe('DropDown')
    expect(question.questionText).toBe('Choose your size')
    expect(question.option.optionProps).toMatchObject({
      selectedOption: 'Medium',
      options: [
        { label: 'Small', value: 'Small' },
        { label: 'Medium', value: 'Medium' },
        { label: 'Large', value: 'Large' },
      ],
    })
  })

  it('falls back to first option when selected option is invalid', () => {
    const question = createNewQuestion(
      'DropDown',
      {
        questionText: 'Choose one',
        dropDown: {
          options: ['Alpha', 'Beta'],
          selectedOption: 'Gamma',
        },
      },
      1
    )

    expect(question.component).toBe('DropDown')
    expect(question.option.optionProps).toMatchObject({
      selectedOption: 'Alpha',
      options: [
        { label: 'Alpha', value: 'Alpha' },
        { label: 'Beta', value: 'Beta' },
      ],
    })
  })
})

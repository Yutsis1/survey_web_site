import { describe, expect, it } from 'vitest'
import { createNewQuestion } from './questions-factory'

describe('createNewQuestion', () => {
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

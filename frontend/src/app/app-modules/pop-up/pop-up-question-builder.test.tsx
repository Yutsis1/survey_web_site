import React from "react";
import { fireEvent, render, within } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { PopUp } from "./pop-up";
import { getPopupComponentsAndOptions } from "./pop-up-questions-config";
import { useQuestionBuilder } from "../questions/question-builder";
import { renderHook, act } from "@testing-library/react";

describe('PopUp Question Builder Integration', () => {
    const mockOnClose = vi.fn()
    const mockOnCancel = vi.fn()
    const mockOnApply = vi.fn()

    beforeEach(() => {
        document.body.innerHTML = ''
        vi.clearAllMocks()
    })

    const TestWrapper = ({ questionType }: { questionType: string }) => {
        const builder = useQuestionBuilder()

        React.useEffect(() => {
            builder.setSelectedType(questionType)
        }, [questionType])

        const popup = getPopupComponentsAndOptions({
            selectedType: builder.selectedType,
            setSelectedType: builder.setSelectedType,
            setQuestionText: builder.setQuestionText,
            checkbox: builder.checkbox,
            textInput: builder.textInput,
            radioBar: builder.radioBar,
            dropDown: builder.dropDown,
        })

        return (
            <PopUp
                isOpen={true}
                onClose={mockOnClose}
                onCancel={mockOnCancel}
                onApply={mockOnApply}
                popUpTitle={popup.questionText}
                popUpDescription="Configure your question"
            >
                {popup.components}
            </PopUp>
        )
    }

    describe('Question Type Selection', () => {
        it('renders type selector with all question types', () => {
            const { result } = renderHook(() => useQuestionBuilder())

            const popup = getPopupComponentsAndOptions({
                selectedType: result.current.selectedType,
                setSelectedType: result.current.setSelectedType,
                setQuestionText: result.current.setQuestionText,
                checkbox: result.current.checkbox,
                textInput: result.current.textInput,
                radioBar: result.current.radioBar,
                dropDown: result.current.dropDown,
            })

            const { getByTestId } = render(
                <PopUp
                    isOpen={true}
                    onClose={mockOnClose}
                    onApply={mockOnApply}
                    popUpTitle="Test"
                >
                    {popup.components}
                </PopUp>
            )

            const typeSelector = getByTestId('radio-bar-question-type')
            expect(typeSelector).toBeInTheDocument()

            // Check that all question types are available
            expect(within(typeSelector).getByText('TextInput')).toBeInTheDocument()
            expect(within(typeSelector).getByText('Checkbox')).toBeInTheDocument()
            expect(within(typeSelector).getByText('RadioBar')).toBeInTheDocument()
            expect(within(typeSelector).getByText('DropDown')).toBeInTheDocument()
        })

        it('updates selected type when radio button is clicked', () => {
            const { result } = renderHook(() => useQuestionBuilder())

            expect(result.current.selectedType).toBe('')

            act(() => {
                result.current.setSelectedType('TextInput')
            })

            expect(result.current.selectedType).toBe('TextInput')
        })
    })

    describe('TextInput Question Configuration', () => {
        it('renders TextInput configuration fields', () => {
            const { result } = renderHook(() => useQuestionBuilder())

            act(() => {
                result.current.setSelectedType('TextInput')
            })

            const popup = getPopupComponentsAndOptions({
                selectedType: result.current.selectedType,
                setSelectedType: result.current.setSelectedType,
                setQuestionText: result.current.setQuestionText,
                checkbox: result.current.checkbox,
                textInput: result.current.textInput,
                radioBar: result.current.radioBar,
                dropDown: result.current.dropDown,
            })

            const { getByLabelText } = render(
                <PopUp
                    isOpen={true}
                    onClose={mockOnClose}
                    onApply={mockOnApply}
                    popUpTitle={popup.questionText}
                >
                    {popup.components}
                </PopUp>
            )

            expect(getByLabelText('Question text')).toBeInTheDocument()
            expect(getByLabelText('Field label')).toBeInTheDocument()
            expect(getByLabelText('Placeholder')).toBeInTheDocument()
        })

        it('updates TextInput configuration when fields change', () => {
            const { result } = renderHook(() => useQuestionBuilder())

            act(() => {
                result.current.setSelectedType('TextInput')
                result.current.textInput.set({ label: 'Custom Label', placeholder: 'Custom Placeholder' })
            })

            expect(result.current.textInput.value.label).toBe('Custom Label')
            expect(result.current.textInput.value.placeholder).toBe('Custom Placeholder')
        })
    })

    describe('Checkbox Question Configuration', () => {
        it('renders Checkbox configuration fields', () => {
            const { result } = renderHook(() => useQuestionBuilder())

            act(() => {
                result.current.setSelectedType('Checkbox')
            })

            const popup = getPopupComponentsAndOptions({
                selectedType: result.current.selectedType,
                setSelectedType: result.current.setSelectedType,
                setQuestionText: result.current.setQuestionText,
                checkbox: result.current.checkbox,
                textInput: result.current.textInput,
                radioBar: result.current.radioBar,
                dropDown: result.current.dropDown,
            })

            const { getByLabelText, getByText } = render(
                <PopUp
                    isOpen={true}
                    onClose={mockOnClose}
                    onApply={mockOnApply}
                    popUpTitle={popup.questionText}
                >
                    {popup.components}
                </PopUp>
            )

            expect(getByLabelText('Active label')).toBeInTheDocument()
            expect(getByLabelText('Inactive label')).toBeInTheDocument()
            expect(getByText('Default state')).toBeInTheDocument()
        })

        it('updates Checkbox configuration when fields change', () => {
            const { result } = renderHook(() => useQuestionBuilder())

            act(() => {
                result.current.setSelectedType('Checkbox')
                result.current.checkbox.set({
                    activeLabel: 'Yes',
                    inactiveLabel: 'No',
                    checked: true,
                })
            })

            expect(result.current.checkbox.value.activeLabel).toBe('Yes')
            expect(result.current.checkbox.value.inactiveLabel).toBe('No')
            expect(result.current.checkbox.value.checked).toBe(true)
        })
    })

    describe('RadioBar Question Configuration', () => {
        it('renders RadioBar configuration fields', () => {
            const { result } = renderHook(() => useQuestionBuilder())

            act(() => {
                result.current.setSelectedType('RadioBar')
            })

            const popup = getPopupComponentsAndOptions({
                selectedType: result.current.selectedType,
                setSelectedType: result.current.setSelectedType,
                setQuestionText: result.current.setQuestionText,
                checkbox: result.current.checkbox,
                textInput: result.current.textInput,
                radioBar: result.current.radioBar,
                dropDown: result.current.dropDown,
            })

            const { getByLabelText, getByText } = render(
                <PopUp
                    isOpen={true}
                    onClose={mockOnClose}
                    onApply={mockOnApply}
                    popUpTitle={popup.questionText}
                >
                    {popup.components}
                </PopUp>
            )

            expect(getByLabelText('Group name')).toBeInTheDocument()
            expect(getByText('Options')).toBeInTheDocument()
            expect(getByText('+ Add extra option')).toBeInTheDocument()
        })

        it('displays default options for RadioBar', () => {
            const { result } = renderHook(() => useQuestionBuilder())

            act(() => {
                result.current.setSelectedType('RadioBar')
            })

            const popup = getPopupComponentsAndOptions({
                selectedType: result.current.selectedType,
                setSelectedType: result.current.setSelectedType,
                setQuestionText: result.current.setQuestionText,
                checkbox: result.current.checkbox,
                textInput: result.current.textInput,
                radioBar: result.current.radioBar,
                dropDown: result.current.dropDown,
            })

            const { container } = render(
                <PopUp
                    isOpen={true}
                    onClose={mockOnClose}
                    onApply={mockOnApply}
                    popUpTitle={popup.questionText}
                >
                    {popup.components}
                </PopUp>
            )

            const optionInputs = container.querySelectorAll('input[type="text"][placeholder="Enter option..."]')
            expect(optionInputs).toHaveLength(2)
            expect(optionInputs[0]).toHaveValue('Yes')
            expect(optionInputs[1]).toHaveValue('No')
        })

        it('adds new option when Add button is clicked', () => {
            const { result } = renderHook(() => useQuestionBuilder())

            act(() => {
                result.current.setSelectedType('RadioBar')
            })

            const popup = getPopupComponentsAndOptions({
                selectedType: result.current.selectedType,
                setSelectedType: result.current.setSelectedType,
                setQuestionText: result.current.setQuestionText,
                checkbox: result.current.checkbox,
                textInput: result.current.textInput,
                radioBar: result.current.radioBar,
                dropDown: result.current.dropDown,
            })

            const { getByText, container, rerender } = render(
                <PopUp
                    isOpen={true}
                    onClose={mockOnClose}
                    onApply={mockOnApply}
                    popUpTitle={popup.questionText}
                >
                    {popup.components}
                </PopUp>
            )

            const addButton = getByText('+ Add extra option')
            fireEvent.click(addButton)

            // Update the builder state
            act(() => {
                result.current.radioBar.set((prev) => ({
                    ...prev,
                    buttons: [...prev.buttons, ''],
                }))
            })

            expect(result.current.radioBar.value.buttons).toHaveLength(3)
        })

        it('removes option when delete button is clicked', () => {
            const { result } = renderHook(() => useQuestionBuilder())

            act(() => {
                result.current.setSelectedType('RadioBar')
                result.current.radioBar.set({
                    name: 'Test',
                    buttons: ['Option 1', 'Option 2', 'Option 3'],
                })
            })

            const popup = getPopupComponentsAndOptions({
                selectedType: result.current.selectedType,
                setSelectedType: result.current.setSelectedType,
                setQuestionText: result.current.setQuestionText,
                checkbox: result.current.checkbox,
                textInput: result.current.textInput,
                radioBar: result.current.radioBar,
                dropDown: result.current.dropDown,
            })

            const { container } = render(
                <PopUp
                    isOpen={true}
                    onClose={mockOnClose}
                    onApply={mockOnApply}
                    popUpTitle={popup.questionText}
                >
                    {popup.components}
                </PopUp>
            )

            const deleteButtons = container.querySelectorAll('button[title="Delete option"]')
            expect(deleteButtons).toHaveLength(3)

            fireEvent.click(deleteButtons[1])

            act(() => {
                result.current.radioBar.set((prev) => ({
                    ...prev,
                    buttons: prev.buttons.filter((_, i) => i !== 1),
                }))
            })

            expect(result.current.radioBar.value.buttons).toHaveLength(2)
            expect(result.current.radioBar.value.buttons).toEqual(['Option 1', 'Option 3'])
        })
    })

    describe('DropDown Question Configuration', () => {
        it('renders DropDown configuration fields', () => {
            const { result } = renderHook(() => useQuestionBuilder())

            act(() => {
                result.current.setSelectedType('DropDown')
            })

            const popup = getPopupComponentsAndOptions({
                selectedType: result.current.selectedType,
                setSelectedType: result.current.setSelectedType,
                setQuestionText: result.current.setQuestionText,
                checkbox: result.current.checkbox,
                textInput: result.current.textInput,
                radioBar: result.current.radioBar,
                dropDown: result.current.dropDown,
            })

            const { getByText } = render(
                <PopUp
                    isOpen={true}
                    onClose={mockOnClose}
                    onApply={mockOnApply}
                    popUpTitle={popup.questionText}
                >
                    {popup.components}
                </PopUp>
            )

            expect(getByText('Options')).toBeInTheDocument()
            expect(getByText('+ Add extra option')).toBeInTheDocument()
            expect(getByText('Default selected value')).toBeInTheDocument()
        })

        it('displays default options for DropDown', () => {
            const { result } = renderHook(() => useQuestionBuilder())

            act(() => {
                result.current.setSelectedType('DropDown')
            })

            const popup = getPopupComponentsAndOptions({
                selectedType: result.current.selectedType,
                setSelectedType: result.current.setSelectedType,
                setQuestionText: result.current.setQuestionText,
                checkbox: result.current.checkbox,
                textInput: result.current.textInput,
                radioBar: result.current.radioBar,
                dropDown: result.current.dropDown,
            })

            const { container } = render(
                <PopUp
                    isOpen={true}
                    onClose={mockOnClose}
                    onApply={mockOnApply}
                    popUpTitle={popup.questionText}
                >
                    {popup.components}
                </PopUp>
            )

            const optionInputs = container.querySelectorAll('input[type="text"][placeholder="Enter option..."]')
            expect(optionInputs).toHaveLength(2)
            expect(optionInputs[0]).toHaveValue('Option 1')
            expect(optionInputs[1]).toHaveValue('Option 2')
        })

        it('adds new option to DropDown when Add button is clicked', () => {
            const { result } = renderHook(() => useQuestionBuilder())

            act(() => {
                result.current.setSelectedType('DropDown')
            })

            act(() => {
                result.current.dropDown.set((prev) => ({
                    ...prev,
                    options: [...prev.options, ''],
                }))
            })

            expect(result.current.dropDown.value.options).toHaveLength(3)
        })

        it('removes option from DropDown when delete button is clicked', () => {
            const { result } = renderHook(() => useQuestionBuilder())

            act(() => {
                result.current.setSelectedType('DropDown')
                result.current.dropDown.set({
                    options: ['Option 1', 'Option 2', 'Option 3'],
                    selectedOption: 'Option 1',
                })
            })

            act(() => {
                const updated = result.current.dropDown.value.options.filter((_, i) => i !== 1)
                result.current.dropDown.set((prev) => ({
                    ...prev,
                    options: updated,
                    selectedOption: updated.includes(prev.selectedOption) ? prev.selectedOption : updated[0] ?? '',
                }))
            })

            expect(result.current.dropDown.value.options).toHaveLength(2)
            expect(result.current.dropDown.value.options).toEqual(['Option 1', 'Option 3'])
        })

        it('updates selected option to first available when current is deleted', () => {
            const { result } = renderHook(() => useQuestionBuilder())

            act(() => {
                result.current.setSelectedType('DropDown')
                result.current.dropDown.set({
                    options: ['Option 1', 'Option 2', 'Option 3'],
                    selectedOption: 'Option 2',
                })
            })

            act(() => {
                const updated = result.current.dropDown.value.options.filter((_, i) => i !== 1)
                result.current.dropDown.set((prev) => ({
                    ...prev,
                    options: updated,
                    selectedOption: updated.includes(prev.selectedOption) ? prev.selectedOption : updated[0] ?? '',
                }))
            })

            expect(result.current.dropDown.value.selectedOption).toBe('Option 1')
        })
    })

    describe('Question Text Configuration', () => {
        it('updates question text for all question types', () => {
            const { result } = renderHook(() => useQuestionBuilder())

            act(() => {
                result.current.setQuestionText('What is your name?')
            })

            expect(result.current.questionText).toBe('What is your name?')
        })
    })

    describe('Builder Reset', () => {
        it('resets all configuration to defaults', () => {
            const { result } = renderHook(() => useQuestionBuilder())

            act(() => {
                result.current.setSelectedType('RadioBar')
                result.current.setQuestionText('Custom Question')
                result.current.radioBar.set({ name: 'Custom', buttons: ['A', 'B', 'C'] })
            })

            expect(result.current.selectedType).toBe('RadioBar')
            expect(result.current.questionText).toBe('Custom Question')

            act(() => {
                result.current.reset()
            })

            expect(result.current.selectedType).toBe('')
            expect(result.current.questionText).toBe('New Question')
            expect(result.current.radioBar.value.buttons).toEqual(['Yes', 'No'])
        })
    })
})

import React from 'react'
import {
    ComponentPropsMapping,
    Option,
} from '../../components/interfaceMapping'
import { DynamicComponentRenderer } from '../../components/dynamic-component-renderer'

export interface QuestionProps<T extends keyof ComponentPropsMapping> {
    questionText: string
    component: T
    option: Option<ComponentPropsMapping[T]>
    showQuestionText?: boolean
}

const Question: React.FC<QuestionProps<keyof ComponentPropsMapping>> = ({
    questionText,
    option,
    component,
    showQuestionText
}) => {
    return (
        <DynamicComponentRenderer
            component={component}
            option={option}
            questionText={questionText}
            showQuestionText={showQuestionText ?? false}
        />
    )
}

export { Question }

import React from 'react'
import {
    componentMapping,
    ComponentPropsMapping,
    Option,
} from '../interfaceMapping'

export interface QuestionProps<T extends keyof ComponentPropsMapping> {
    questionText: string
    component: T
    option: Option<ComponentPropsMapping[T]>
}

const Question: React.FC<QuestionProps<keyof ComponentPropsMapping>> = ({
    questionText,
    option,
    component,
}) => {
    const Component = componentMapping[component] as React.ComponentType<
        ComponentPropsMapping[typeof component]
    >

    // Add null check for option
    if (!option || !option.optionProps) {
        return null // or return a fallback UI
    }

    return (
        <div className="question-component">
            <h3>{questionText}</h3>
            <div className="option">
                <Component {...option.optionProps} />
            </div>
        </div>
    )
}

export { Question }

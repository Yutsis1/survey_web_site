import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useEffect } from 'react';
import { fn } from 'storybook/test';

import { PopUp } from '@/app/app-modules/pop-up/pop-up';
import { getPopupComponentsAndOptions } from '@/app/app-modules/pop-up/pop-up-questions-config';
import { useQuestionBuilder } from '@/app/app-modules/questions/question-builder';

const QUESTION_TYPES = ['TextInput', 'Checkbox', 'RadioBar', 'CheckboxTiles', 'DropDown'] as const;

type QuestionType = (typeof QUESTION_TYPES)[number];

interface PopUpQuestionBuilderStoryProps {
  selectedType: QuestionType;
  popUpTitle: string;
  popUpDescription?: string;
  applyDisabled?: boolean;
}

function PopUpQuestionBuilderStory({
  selectedType, 
  popUpTitle,
  popUpDescription,
  applyDisabled = false,
}: PopUpQuestionBuilderStoryProps) {
  const {
    selectedType: builderSelectedType,
    setSelectedType,
    setQuestionText,
    checkbox,
    textInput,
    radioBar,
    checkboxTiles,
    dropDown,
  } = useQuestionBuilder();

  useEffect(() => {
    if (selectedType !== builderSelectedType) {
      setSelectedType(selectedType);
    }
  }, [selectedType, builderSelectedType, setSelectedType]);

  const popup = getPopupComponentsAndOptions({
    selectedType: builderSelectedType,
    setSelectedType,
    setQuestionText,
    checkbox,
    textInput,
    radioBar,
    checkboxTiles,
    dropDown,
  });

  return (
    <PopUp
      isOpen
      onClose={fn()}
      onCancel={fn()}
      onApply={fn()}
      applyDisabled={applyDisabled}
      popUpTitle={popUpTitle}
      popUpDescription={popUpDescription}
    >
      {popup.components}
    </PopUp>
  );
}

const meta = {
  title: 'Components/PopUpQuestionBuilder',
  component: PopUpQuestionBuilderStory,
  tags: ['autodocs'],
  args: {
    selectedType: 'TextInput',
    popUpTitle: 'Create a new question',
    popUpDescription: 'Pick a question type and configure the fields.',
    applyDisabled: false,
  },
  argTypes: {
    selectedType: {
      control: { type: 'select' },
      options: QUESTION_TYPES,
    },
  },
} satisfies Meta<typeof PopUpQuestionBuilderStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const TextInput: Story = {
  args: {
    selectedType: 'TextInput',
  },
};

export const Checkbox: Story = {
  args: {
    selectedType: 'Checkbox',
  },
};

export const RadioBar: Story = {
  args: {
    selectedType: 'RadioBar',
  },
};

export const DropDown: Story = {
  args: {
    selectedType: 'DropDown',
  },
};

export const CheckboxTiles: Story = {
  args: {
    selectedType: 'CheckboxTiles',
  },
};

export const ApplyDisabled: Story = {
  args: {
    selectedType: 'TextInput',
    applyDisabled: true,
  },
};

export const DarkTheme: Story = {
  args: {
    selectedType: 'TextInput',
    popUpTitle: 'Create a new question',
    popUpDescription: 'Pick a question type and configure the fields.',
    applyDisabled: false,
  },
  globals: {
    theme: 'dark',
  },
};

export const LightTheme: Story = {
  args: {
    selectedType: 'TextInput',
    popUpTitle: 'Create a new question',
    popUpDescription: 'Pick a question type and configure the fields.',
    applyDisabled: false,
  },
  globals: {
    theme: 'light',
  },
};

export const DarkThemeDropDown: Story = {
  args: {
    selectedType: 'DropDown',
    popUpTitle: 'Create a new question',
    popUpDescription: 'Pick a question type and configure the fields.',
    applyDisabled: false,
  },
  globals: {
    theme: 'dark',
  },
};

export const LightThemeRadioBar: Story = {
  args: {
    selectedType: 'RadioBar',
    popUpTitle: 'Create a new question',
    popUpDescription: 'Pick a question type and configure the fields.',
    applyDisabled: false,
  },
  globals: {
    theme: 'light',
  },
};

import { SurveyBuilderClient } from '../survey-builder-client'

interface SurveyBuilderByIdPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function SurveyBuilderByIdPage({ params }: SurveyBuilderByIdPageProps) {
  const { id } = await params
  return <SurveyBuilderClient initialSurveyId={id} />
}

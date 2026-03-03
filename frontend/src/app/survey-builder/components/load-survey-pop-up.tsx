import { PopUp } from '../../app-modules/pop-up/pop-up'
import { DropDown } from '@/components/app/dropDown/dropDown'

interface LoadSurveyPopUpProps {
  isOpen: boolean
  onClose: () => void
  onApply: () => void
  loadingSurveyOptions: boolean
  loadingSelectedSurvey: boolean
  surveyOptions: Array<{ value: string; label: string }>
  surveyOptionsError: string | null
  selectedSurveyId: string
  setSelectedSurveyId: (id: string) => void
}

export function LoadSurveyPopUp({
  isOpen,
  onClose,
  onApply,
  loadingSurveyOptions,
  loadingSelectedSurvey,
  surveyOptions,
  surveyOptionsError,
  selectedSurveyId,
  setSelectedSurveyId,
}: LoadSurveyPopUpProps) {
  const isApplyDisabled =
    loadingSurveyOptions ||
    loadingSelectedSurvey ||
    surveyOptions.length === 0 ||
    !selectedSurveyId

  return (
    <PopUp
      isOpen={isOpen}
      onClose={onClose}
      onCancel={onClose}
      onApply={onApply}
      applyDisabled={isApplyDisabled}
      popUpTitle="Load Survey"
      popUpDescription="Select a saved survey to load."
    >
      <div className="space-y-3">
        <DropDown
          options={surveyOptions}
          selectedOption={selectedSurveyId}
          onSelect={setSelectedSurveyId}
          label="Saved surveys"
          id="saved-surveys"
          name="saved-surveys"
          disabled={loadingSurveyOptions || loadingSelectedSurvey || surveyOptions.length === 0}
        />
        {loadingSurveyOptions && <p className="text-sm text-muted-foreground">Loading surveys...</p>}
        {surveyOptionsError && <p className="text-sm text-destructive">{surveyOptionsError}</p>}
        {!loadingSurveyOptions && !surveyOptionsError && surveyOptions.length === 0 && (
          <p className="text-sm text-muted-foreground">No surveys available</p>
        )}
      </div>
    </PopUp>
  )
}

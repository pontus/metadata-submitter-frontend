//@flow
import React from "react"
import WizardHeader from "../WizardComponents/WizardHeader"
import WizardSteps from "../WizardComponents/WizardSteps"

const WizardShowSummaryStep = () => {
  return (
    <>
      <WizardHeader headerText="Create new draft folder" />
      <WizardSteps />
      <WizardHeader headerText="Summary" />
    </>
  )
}

export default WizardShowSummaryStep

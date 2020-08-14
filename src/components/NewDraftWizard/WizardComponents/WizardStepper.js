//@flow
import React from "react"

import Button from "@material-ui/core/Button"
import Step from "@material-ui/core/Step"
import StepConnector from "@material-ui/core/StepConnector"
import StepLabel from "@material-ui/core/StepLabel"
import Stepper from "@material-ui/core/Stepper"
import { makeStyles, withStyles } from "@material-ui/core/styles"
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos"
import ArrowForwardIosIcon from "@material-ui/icons/ArrowForwardIos"
import Check from "@material-ui/icons/Check"
import clsx from "clsx"
import { useDispatch, useSelector } from "react-redux"

import type { CreateFolderFormRef } from "components/NewDraftWizard/WizardSteps/WizardCreateFolderStep"
import { decrement, increment } from "features/wizardStepSlice"

/*
 * Customized stepper inspired by https://material-ui.com/components/steppers/#customized-stepper
 */
const QontoConnector = withStyles(theme => ({
  alternativeLabel: {
    top: 10,
    left: "calc(-50% + 16px)",
    right: "calc(50% + 16px)",
  },
  active: {
    "& $line": {
      borderColor: theme.palette.primary.main,
    },
  },
  completed: {
    "& $line": {
      borderColor: theme.palette.primary.main,
    },
  },
  line: {
    borderColor: theme.palette.secondary.main,
    borderTopWidth: 3,
    borderRadius: 1,
  },
}))(StepConnector)

const useQontoStepIconStyles = makeStyles(theme => ({
  root: {
    color: theme.palette.secondary.main,
    display: "flex",
    height: 22,
    alignItems: "center",
  },
  active: {
    color: theme.palette.primary.main,
  },
  circle: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    backgroundColor: "currentColor",
  },
  completed: {
    color: theme.palette.primary.main,
    zIndex: 1,
    fontSize: 18,
  },
  floating: {
    border: "solid 1px #000",
    backgroundColor: "white",
    boxShadow: 0,
  },
}))

function QontoStepIcon(props: { active: boolean, completed: boolean }) {
  const classes = useQontoStepIconStyles()
  const { active, completed } = props

  return (
    <div
      className={clsx(classes.root, {
        [classes.active]: active,
      })}
    >
      {completed ? <Check className={classes.completed} /> : <div className={classes.circle} />}
    </div>
  )
}

const useStyles = makeStyles({
  stepper: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    borderBottom: "solid 1px #ccc",
  },
  stepperContainer: {
    width: "80%",
  },
  centeredStepButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 0,
    border: "none",
    width: "10%",
    backgroundColor: "rgba(139, 26, 79, 0.04)",
    "&:hover": {
      border: "none",
      backgroundColor: "rgba(139, 26, 79, 0.16)",
    },
    "&.Mui-disabled": {
      border: "none",
    },
  },
})

/**
 * Show info about wizard steps to user.
 * If createFolderForm is passed as reference it is used to trigger correct form when clicking next.
 */
const WizardStepper = ({ createFolderFormRef }: { createFolderFormRef?: CreateFolderFormRef }) => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const wizardStep = useSelector(state => state.wizardStep)
  const steps = ["Folder Name & Description", "Add Objects", "Summary"]
  return (
    <div className={classes.stepper}>
      <Button
        className={classes.centeredStepButton}
        disableElevation
        color="primary"
        variant="outlined"
        disabled={wizardStep < 1}
        onClick={() => dispatch(decrement())}
      >
        <ArrowBackIosIcon fontSize="large" />
        Back
      </Button>
      <Stepper
        activeStep={wizardStep}
        className={classes.stepperContainer}
        alternativeLabel
        connector={<QontoConnector />}
      >
        {steps.map(label => (
          <Step key={label}>
            <StepLabel StepIconComponent={QontoStepIcon}>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <Button
        disabled={createFolderFormRef?.current?.isSubmitting || wizardStep >= 2}
        className={classes.centeredStepButton}
        disableElevation
        color="primary"
        variant="outlined"
        onClick={async () => {
          if (createFolderFormRef?.current) {
            await createFolderFormRef.current.submitForm()
          }
          if (
            wizardStep !== 2 &&
            (!createFolderFormRef?.current || Object.entries(createFolderFormRef?.current?.errors).length === 0)
          ) {
            dispatch(increment())
          }
        }}
      >
        Next
        <ArrowForwardIosIcon fontSize="large" />
      </Button>
    </div>
  )
}

export default WizardStepper

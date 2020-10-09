//@flow
import React, { useState } from "react"

import MuiAccordion from "@material-ui/core/Accordion"
import MuiAccordionDetails from "@material-ui/core/AccordionDetails"
import MuiAccordionSummary from "@material-ui/core/AccordionSummary"
import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import ListItemText from "@material-ui/core/ListItemText"
import { makeStyles, withStyles } from "@material-ui/core/styles"
import Typography from "@material-ui/core/Typography"
import NoteAddIcon from "@material-ui/icons/NoteAdd"
import { useDispatch, useSelector } from "react-redux"

import WizardAlert from "./WizardAlert"

import { setObjectType } from "features/wizardObjectTypeSlice"
import { setSubmissionType } from "features/wizardSubmissionTypeSlice"

const useStyles = makeStyles(theme => ({
  index: {
    alignSelf: "flex-start",
    marginBottom: theme.spacing(2),
    width: theme.spacing(30),
  },
  submissionTypeList: {
    padding: 0,
  },
  submissionTypeListItem: {
    backgroundColor: theme.palette.secondary.main,
    "&.Mui-selected": {
      backgroundColor: theme.palette.secondary.main,
      boxShadow: `inset 10px 0px 0px 0px ${theme.palette.primary.main}`,
    },
  },
  nonSelectedAccordion: {
    backgroundColor: theme.palette.grey["800"],
  },
  selectedAccordion: {
    backgroundColor: theme.palette.primary.main,
  },
}))

/*
 * Customized accordion from https://material-ui.com/components/accordion/#customized-accordions
 */
const Accordion = withStyles({
  root: {
    borderTop: "1px solid rgba(0, 0, 0, .125)",
    boxShadow: "none",
    "&:before": {
      display: "none",
    },
    "&$expanded": {
      margin: "auto",
    },
  },
  expanded: {},
})(MuiAccordion)

const AccordionSummary = withStyles(theme => ({
  root: {
    height: 56,
    marginBottom: -1,
    "&$expanded": {
      minHeight: 56,
    },
  },
  content: {
    color: "#FFF",
    fontWeight: "bold",
    "&$expanded": {
      margin: `${theme.spacing(2)} 0`,
    },
    "& .MuiSvgIcon-root": {
      marginRight: theme.spacing(2),
    },
  },
  expanded: {},
}))(MuiAccordionSummary)

const AccordionDetails = withStyles({
  root: {
    display: "inherit",
    padding: 0,
  },
})(MuiAccordionDetails)

/*
 * Render list of submission types to be used in accordions
 */
const SubmissionTypeList = ({
  handleSubmissionTypeChange,
  isCurrentObjectType,
  currentSubmissionType,
}: {
  handleSubmissionTypeChange: string => void,
  isCurrentObjectType: boolean,
  currentSubmissionType: string,
}) => {
  const submissionTypes = ["form", "xml", "existing"]
  const submissionTypeMap = {
    form: "Fill Form",
    xml: "Upload XML File",
    existing: "Choose existing object",
  }
  const classes = useStyles()

  return (
    <List dense className={classes.submissionTypeList}>
      {submissionTypes.map(submissionType => (
        <ListItem
          selected={isCurrentObjectType && currentSubmissionType === submissionType}
          divider
          key={submissionType}
          button
          onClick={() => handleSubmissionTypeChange(submissionType)}
          className={classes.submissionTypeListItem}
        >
          <ListItemText primary={submissionTypeMap[submissionType]} primaryTypographyProps={{ variant: "subtitle1" }} />
        </ListItem>
      ))}
    </List>
  )
}

/**
 * Render accordion for choosing object type and submission type
 */
const WizardObjectIndex = () => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const objectTypes = ["study", "sample", "experiment", "run", "analysis", "dac", "policy", "dataset"]

  const [expandedObjectType, setExpandedObjectType] = useState("")
  const [clickedSubmissionType, setClickedSubmissionType] = useState("")
  const [cancelFormOpen, setCancelFormOpen] = useState(false)
  const currentObjectType = useSelector(state => state.objectType)
  const currentSubmissionType = useSelector(state => state.submissionType)

  const handlePanelChange = panel => (event, newExpanded) => {
    setExpandedObjectType(newExpanded ? panel : false)
  }

  const handleSubmissionTypeChange = (submissionType: string) => {
    if (currentSubmissionType === "") {
      dispatch(setSubmissionType(submissionType))
      dispatch(setObjectType(expandedObjectType))
    } else {
      setClickedSubmissionType(submissionType)
      setCancelFormOpen(true)
    }
  }

  const handleCancelling = (cancel: boolean) => {
    setClickedSubmissionType("")
    setCancelFormOpen(false)
    if (cancel) {
      dispatch(setSubmissionType(clickedSubmissionType))
      dispatch(setObjectType(expandedObjectType))
    }
  }

  return (
    <div className={classes.index}>
      {objectTypes.map(objectType => {
        const typeCapitalized = objectType[0].toUpperCase() + objectType.substring(1)
        const isCurrentObjectType = objectType === currentObjectType
        return (
          <Accordion
            key={objectType}
            square
            expanded={expandedObjectType === objectType}
            onChange={handlePanelChange(objectType)}
          >
            <AccordionSummary
              className={isCurrentObjectType ? classes.selectedAccordion : classes.nonSelectedAccordion}
              aria-controls="type-content"
              id="type-header"
            >
              <NoteAddIcon /> <Typography variant="subtitle1">{typeCapitalized}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <SubmissionTypeList
                handleSubmissionTypeChange={handleSubmissionTypeChange}
                isCurrentObjectType={isCurrentObjectType}
                currentSubmissionType={currentSubmissionType}
              />
            </AccordionDetails>
          </Accordion>
        )
      })}
      {cancelFormOpen && (
        <WizardAlert
          onAlert={handleCancelling}
          parentLocation="submission"
          alertType={currentSubmissionType}
        ></WizardAlert>
      )}
    </div>
  )
}

export default WizardObjectIndex
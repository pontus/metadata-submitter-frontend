//@flow
import React, { useEffect, useState } from "react"

import Button from "@material-ui/core/Button"
import FormControl from "@material-ui/core/FormControl"
import LinearProgress from "@material-ui/core/LinearProgress"
import { makeStyles } from "@material-ui/core/styles"
import TextField from "@material-ui/core/TextField"
import Alert from "@material-ui/lab/Alert"
import { useForm } from "react-hook-form"
import { useDispatch, useSelector } from "react-redux"

import WizardStatusMessageHandler from "./WizardStatusMessageHandler"

import { setDraftStatus, resetDraftStatus } from "features/draftStatusSlice"
import { resetErrorMessage } from "features/wizardErrorMessageSlice"
import { addObjectToFolder } from "features/wizardSubmissionFolderSlice"
import objectAPIService from "services/objectAPI"
import submissionAPIService from "services/submissionAPI"

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
    "& > *": {
      margin: theme.spacing(2),
    },
  },
  hiddenInput: {
    border: "0",
    clip: "rect(0, 0, 0, 0)",
    height: "1px",
    overflow: "hidden",
    padding: "0",
    position: "absolute !important",
    whiteSpace: "nowrap",
    width: "1px",
  },
  fileField: {
    display: "inline-flex",
  },
}))

/*
 * Return React Hook Form based form for uploading xml files. Handles form submitting, validating and error/success alerts.
 */
const WizardUploadObjectXMLForm = () => {
  const [successStatus, setSuccessStatus] = useState("")
  const [isSubmitting, setSubmitting] = useState(false)
  const [responseStatus, setResponseStatus] = useState([])
  const objectType = useSelector(state => state.objectType)
  const { id: folderId } = useSelector(state => state.submissionFolder)
  const dispatch = useDispatch()
  const classes = useStyles()

  const { register, errors, watch, handleSubmit, formState } = useForm({ mode: "onChange" })

  useEffect(() => {
    formState.isDirty && formState.isValid ? dispatch(setDraftStatus("notSaved")) : dispatch(resetDraftStatus())
  }, [formState.isDirty, formState.isValid, dispatch])

  const watchFile = watch("fileUpload")

  const onSubmit = async data => {
    setSubmitting(true)
    const file = data.fileUpload[0] || {}
    const waitForServertimer = setTimeout(() => {
      setSuccessStatus("info")
    }, 5000)

    const response = await objectAPIService.createFromXML(objectType, file)
    setResponseStatus(response)
    if (response.ok) {
      setSuccessStatus("success")
      dispatch(
        addObjectToFolder(folderId, {
          accessionId: response.data.accessionId,
          schema: objectType,
        })
      )
      dispatch(resetErrorMessage())
    } else {
      setSuccessStatus("error")
    }
    clearTimeout(waitForServertimer)
    setSubmitting(false)
    dispatch(resetDraftStatus())
  }

  const handleButton = () => {
    //document.getElementById("file-select-button") ? document.getElementById("file-select-button").click() : null
    // document.getElementById("file-select-button").click() //tested with change name of id and changing places of id and this function, no success.
    // document.getElementsByName("fileUpload")[0].click() //ok
    //console.log(document.getElementById("file-select-button")) //ok <input type="file" name="fileUpload" id="file-select-button" hidden="">
  }

  return (
    <div>
      {/* React Hook Form */}
      <form>
        <FormControl className={classes.root}>
          <div className={classes.fileField}>
            <TextField
              placeholder={watchFile ? watchFile[0]?.name : "Name"}
              inputProps={{ readOnly: true, tabIndex: -1 }}
            />
            <Button variant="contained" color="primary" component="label" onClick={() => handleButton()}>
              Choose file
            </Button>
            <input
              type="file"
              name="fileUpload"
              id="file-select-button"
              hidden
              ref={register({
                validate: {
                  isFile: value => value.length > 0,
                  isXML: value => value[0]?.type === "text/xml",
                  isValidXML: async value => {
                    const response = await submissionAPIService.validateXMLFile(objectType, value[0])
                    setResponseStatus(response)
                    if (!response.data.isValid) {
                      return `The file you attached is not valid ${objectType},
                      our server reported following error:
                      ${response.data.detail.reason}.`
                    }
                  },
                },
              })}
            />
          </div>
          {/* Errors */}
          {errors.fileUpload?.type === "isFile" && <Alert severity="error">Please attach a file.</Alert>}
          {errors.fileUpload?.type === "isXML" && <Alert severity="error">Please attach an XML file.</Alert>}
          {errors.fileUpload?.type === "isValidXML" && <Alert severity="error">{errors?.fileUpload?.message}</Alert>}
          {/* Progress bar */}
          {isSubmitting && <LinearProgress />}
        </FormControl>

        <Button
          variant="outlined"
          color="primary"
          className={classes.submitButton}
          disabled={isSubmitting || watchFile?.length === 0 || errors.fileUpload != null}
          onClick={handleSubmit(onSubmit)}
        >
          Save
        </Button>
      </form>

      {successStatus && (
        <WizardStatusMessageHandler
          successStatus={successStatus}
          response={responseStatus}
          prefixText=""
        ></WizardStatusMessageHandler>
      )}
    </div>
  )
}

export default WizardUploadObjectXMLForm

//@flow
import React, { useEffect, useState } from "react"

import Button from "@material-ui/core/Button"
import CircularProgress from "@material-ui/core/CircularProgress"
import Container from "@material-ui/core/Container"
import LinearProgress from "@material-ui/core/LinearProgress"
import { makeStyles } from "@material-ui/core/styles"
import Alert from "@material-ui/lab/Alert"
import Ajv from "ajv"
import { useForm, FormProvider } from "react-hook-form"
import { useDispatch, useSelector } from "react-redux"

import { addObjectToFolder } from "../../../features/wizardSubmissionFolderSlice"

import { ajvResolver } from "./ajvResolver"
import JSONSchemaParser from "./JSONSchemaParser"

import objectAPIService from "services/objectAPI"
import schemaAPIService from "services/schemaAPI"

const useStyles = makeStyles(theme => ({
  formComponents: {
    "& .MuiTextField-root": {
      width: "48%",
      margin: theme.spacing(1),
    },
    "& .MuiTypography-root": {
      margin: theme.spacing(1),
      ...theme.typography.subtitle1,
      fontWeight: "bold",
    },
    "& .MuiTypography-h2": {
      width: "100%",
      color: theme.palette.secondary.main,
      borderBottom: `2px solid ${theme.palette.secondary.main}`,
    },
    "& .MuiTypography-h3": {
      width: "100%",
    },
    "& .array": {
      margin: theme.spacing(1),
      width: "45%",
      "& .arrayRow": {
        display: "flex",
        alignItems: "center",
        marginBottom: theme.spacing(1),
        width: "100%",
        "& .MuiTextField-root": {
          width: "95%",
        },
      },
    },
  },
  formButton: {
    marginLeft: theme.spacing(1),
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}))

const checkResponseError = (response, prefixText) => {
  switch (response.status) {
    case 504:
      return `Unfortunately we couldn't connect to our server.`
    case 400:
      return `${prefixText}, details: ${response.data.detail}`
    default:
      return "Unfortunately an unexpected error happened on our servers"
  }
}

type FormContentProps = {
  resolver: typeof ajvResolver,
  formSchema: any,
  onSubmit: () => Promise<any>,
}

/*
 * Return react-hook-form based form which is rendered from schema and checked against resolver
 */
const FormContent = ({ resolver, formSchema, onSubmit }: FormContentProps) => {
  const classes = useStyles()
  const methods = useForm({ mode: "onBlur", resolver })
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className={classes.formComponents}>
        <div>{JSONSchemaParser.buildFields(formSchema)}</div>
        <div>
          <Button
            variant="contained"
            color="secondary"
            size="small"
            className={classes.formButton}
            onClick={methods.reset}
          >
            Clear form
          </Button>
          <Button variant="contained" color="primary" size="small" type="submit" className={classes.formButton}>
            Save
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}

/*
 * Container for json schema based form. Handles json schema loading, form rendering, form submitting and error/success alerts.
 */
const FillObjectDetailsForm = () => {
  const objectType = useSelector(state => state.objectType)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [successStatus, setSuccessStatus] = useState("info")
  const [formSchema, setFormSchema] = useState({})
  const [validationSchema, setValidationSchema] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const dispatch = useDispatch()
  const { id: folderId } = useSelector(state => state.submissionFolder)

  /*
   * Submit form with cleaned values and check for response errors
   */
  const onSubmit = async data => {
    setSubmitting(true)
    const waitForServertimer = setTimeout(() => {
      setSuccessStatus("info")
      setSuccessMessage(`For some reason, your file is still being saved
                to our database, please wait. If saving doesn't go through in two
                minutes, please try saving the file again.`)
    }, 5000)
    const cleanedValues = JSONSchemaParser.cleanUpFormValues(data)
    const response = await objectAPIService.createFromJSON(objectType, cleanedValues)
    if (response.ok) {
      setSuccessStatus("success")
      setSuccessMessage(`Submitted with accessionid ${response.data.accessionId}`)
      dispatch(
        addObjectToFolder(folderId, {
          accessionId: response.data.accessionId,
          schema: objectType,
        })
      )
    } else {
      setSuccessStatus("error")
      setSuccessMessage(checkResponseError(response, "Validation failed"))
    }
    clearTimeout(waitForServertimer)
    setSubmitting(false)
  }

  /*
   * Fetch json schema from either local storage or API, set schema and dereferenced version to component state.
   */
  useEffect(() => {
    const fetchSchema = async () => {
      let schema = localStorage.getItem(`cached_${objectType}_schema`)
      if (!schema || !new Ajv().validateSchema(JSON.parse(schema))) {
        const response = await schemaAPIService.getSchemaByObjectType(objectType)
        if (response.ok) {
          schema = response.data
          localStorage.setItem(`cached_${objectType}_schema`, JSON.stringify(schema))
        } else {
          setError(checkResponseError(response, "Unfortunately an error happened while catching form fields"))
          setIsLoading(false)
          return
        }
      } else {
        schema = JSON.parse(schema)
      }
      setFormSchema(await JSONSchemaParser.dereferenceSchema(schema))
      setValidationSchema(schema)
      setIsLoading(false)
    }
    fetchSchema()
  }, [objectType])

  if (isLoading) return <CircularProgress />
  if (error) return <Alert severity="error">{error}</Alert>
  return (
    <Container maxWidth="md">
      <FormContent formSchema={formSchema} resolver={ajvResolver(validationSchema)} onSubmit={onSubmit} />
      {submitting && <LinearProgress />}
      {successMessage && (
        <Alert
          severity={successStatus}
          onClose={() => {
            setSuccessMessage("")
          }}
        >
          {successMessage}
        </Alert>
      )}
    </Container>
  )
}

export default FillObjectDetailsForm

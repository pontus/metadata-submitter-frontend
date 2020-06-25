//@flow
import React from "react"
import Grid from "@material-ui/core/Grid"
import Card from "@material-ui/core/Card"
import CardHeader from "@material-ui/core/CardHeader"
import CardContent from "@material-ui/core/CardContent"
import { useLocation } from "react-router-dom"

const Page404 = () => {
  const location = useLocation()
  return (
    <Grid container direction="row" justify="center" alignItems="stretch">
      <Grid item xs={6}>
        <Card>
          <CardHeader title="404 Not Found" />
          <CardContent>
            Oops! Page <code>{location.pathname}</code> could not be found.
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default Page404

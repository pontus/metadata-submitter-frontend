import React from "react"

import "@testing-library/jest-dom/extend-expect"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Provider } from "react-redux"
import configureStore from "redux-mock-store"
import { toMatchDiffSnapshot } from "snapshot-diff"

import WizardUploadObjectXMLForm from "../components/NewDraftWizard/WizardForms/WizardUploadObjectXMLForm"

const mockStore = configureStore([])

expect.extend({ toMatchDiffSnapshot })

describe("WizardStepper", () => {
  const store = mockStore({
    submissionType: "form",
    submissionFolder: {
      description: "AWD",
      id: "FOL90524783",
      name: "Testname",
      published: false,
      drafts: [{ accessionId: "TESTID1234", schema: "study" }],
    },
  })

  it("should have send button disabled when there's no validated xml file", async () => {
    render(
      <Provider store={store}>
        <WizardUploadObjectXMLForm />
      </Provider>
    )
    const button = await screen.findByRole("button", { name: /submit/i })
    expect(button).toHaveAttribute("disabled")
  })

  it("should have uploaded file in input", async () => {
    const file = new File(["test"], "test.xml", { type: "text/xml" })
    render(
      <Provider store={store}>
        <WizardUploadObjectXMLForm />
      </Provider>
    )
    const input = await screen.findByRole("textbox")
    userEvent.upload(input, file)

    expect(input.files[0]).toStrictEqual(file)
    expect(input.files).toHaveLength(1)
  })
})

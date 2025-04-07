"use client"

import { TallyForm } from "@/components/tally-form"

// Replace this with your actual Tally form ID
const TALLY_FORM_ID = "wbRvOK"

export function TallyFormWrapper() {
  return (
    <div className="rounded-lg border bg-card p-6">
      <TallyForm 
        formId={TALLY_FORM_ID} 
        options={{
          dynamicHeight: true,
          transparentBackground: true,
          hideTitle: false
        }}
      />
    </div>
  )
} 
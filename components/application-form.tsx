"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { applyToProject } from "@/app/actions/applications"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface ApplicationFormProps {
  projectId: number
  projectTitle: string
  facultyName: string
  onCancel: () => void
}

export function ApplicationForm({ projectId, projectTitle, facultyName, onCancel }: ApplicationFormProps) {
  const router = useRouter()
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [wordCount, setWordCount] = useState(0)

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    setMessage(text)
    setWordCount(text.trim() === "" ? 0 : text.trim().split(/\s+/).length)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Please provide a message with your application",
        variant: "destructive",
      })
      return
    }

    if (wordCount < 50) {
      toast({
        title: "Error",
        description: "Your application message should be at least 50 words",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)

      const result = await applyToProject({
        projectId,
        message,
      })

      if (result.success) {
        toast({
          title: "Application Submitted",
          description: "Your application has been submitted successfully",
        })
        router.push("/dashboard/student/applications")
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to submit application",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error submitting application:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Apply for Research Project</CardTitle>
        <CardDescription>
          You are applying for "{projectTitle}" with {facultyName}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Application Message</h3>
            <p className="text-sm text-muted-foreground">
              Explain why you're interested in this project and what skills or experience you can bring. Your message
              should be at least 50 words.
            </p>
            <Textarea
              placeholder="I am interested in this project because..."
              className="min-h-[200px]"
              value={message}
              onChange={handleMessageChange}
              disabled={submitting}
              required
            />
            <div className="text-xs text-muted-foreground text-right">
              {wordCount} {wordCount === 1 ? "word" : "words"} {wordCount < 50 && wordCount > 0 && "(minimum 50 words)"}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting || wordCount < 50}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Application"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

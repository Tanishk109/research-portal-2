"use client"

import { useState } from "react"
import { Share2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"

type ShareButtonProps = {
  title: string
}

export function ShareButton({ title }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const url = window.location.href

    try {
      if (navigator.share) {
        await navigator.share({ title, url })
        return
      }

      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast({
        title: "Link copied",
        description: "Project link copied to your clipboard.",
      })
      window.setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      if ((error as Error).name === "AbortError") return

      toast({
        title: "Unable to share",
        description: "Please copy the page URL from your browser.",
        variant: "destructive",
      })
    }
  }

  return (
    <Button type="button" variant="outline" size="icon" onClick={handleShare} aria-label="Share project">
      {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
    </Button>
  )
}

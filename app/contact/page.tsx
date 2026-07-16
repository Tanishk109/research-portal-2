import Link from "next/link"
import { Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ContactPage() {
  return (
    <main className="container mx-auto max-w-3xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Contact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>For portal access, research listings, or application support, contact the academic coordinator.</p>
          <Button asChild>
            <a href="mailto:research.portal@muj.manipal.edu">
              <Mail className="mr-2 h-4 w-4" />
              Email support
            </a>
          </Button>
          <div>
            <Link href="/" className="text-primary hover:underline">
              Back to home
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

import { sql } from "@/lib/db"
import Image from "next/image"
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export const dynamic = "force-dynamic"

export default async function FacultyDirectory() {
  // Fetch all faculty with their profile info
  const faculty = await sql`
    SELECT u.first_name, u.last_name, u.email, fp.department, fp.specialization
    FROM users u
    JOIN faculty_profiles fp ON u.id = fp.user_id
    WHERE u.role = 'faculty'
    ORDER BY fp.department, u.last_name
  `

  // The search/filter will be client-side only for now
  // (If you want server-side search, let me know)

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 animate-gradient-x">
          Faculty Directory
        </h1>
        {/* Search bar placeholder (for future client-side search) */}
        <div className="flex justify-center mb-8">
          <Input
            type="text"
            placeholder="Search by name, department, or specialization... (coming soon)"
            className="w-full max-w-md shadow"
            disabled
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {faculty.map((f: any, i: number) => (
            <Card key={i} className="flex flex-col items-center p-6 bg-white/80 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="flex flex-col items-center pb-2">
                <Image src="/placeholder-user.jpg" alt="Faculty photo" width={80} height={80} className="rounded-full mb-4 border-2 border-primary-200" />
                <CardTitle className="text-xl font-semibold mb-1 text-center">{f.first_name} {f.last_name}</CardTitle>
                <div className="text-sm text-gray-600 mb-1 text-center">{f.specialization}</div>
                <div className="text-sm text-gray-500 mb-1 text-center">{f.department}</div>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <a href={`mailto:${f.email}`} className="text-blue-600 hover:underline text-sm mb-2">{f.email}</a>
              </CardContent>
              <CardFooter className="flex justify-center w-full">
                <Button asChild variant="outline" className="w-full">
                  <a href={`mailto:${f.email}`}>Contact</a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
} 
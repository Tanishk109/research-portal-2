"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export type FacultyDirectoryEntry = {
  id: string
  first_name: string
  last_name: string
  email: string
  profile_picture_url?: string | null
  department: string
  specialization: string
}

export function FacultyDirectoryClient({ faculty }: { faculty: FacultyDirectoryEntry[] }) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredFaculty = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return faculty

    return faculty.filter((member) =>
      [
        member.first_name,
        member.last_name,
        member.email,
        member.department,
        member.specialization,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query)),
    )
  }, [faculty, searchTerm])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 animate-gradient-x">
          Faculty Directory
        </h1>
        <div className="flex justify-center mb-8">
          <Input
            type="search"
            placeholder="Search by name, department, or specialization..."
            className="w-full max-w-md shadow"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {filteredFaculty.length === 0 ? (
            <div className="col-span-full text-center text-gray-600">
              {faculty.length === 0 ? "Faculty data is not available right now." : "No faculty match your search."}
            </div>
          ) : (
            filteredFaculty.map((member) => (
              <Card
                key={member.id}
                className="flex flex-col items-center p-6 bg-white/80 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <CardHeader className="flex flex-col items-center pb-2">
                  <Avatar className="mb-4 h-20 w-20 border-2 border-primary-200">
                    <AvatarImage
                      src={member.profile_picture_url || ""}
                      alt={`${member.first_name} ${member.last_name}`}
                    />
                    <AvatarFallback>
                      {`${member.first_name?.charAt(0) || ""}${member.last_name?.charAt(0) || ""}`}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-xl font-semibold mb-1 text-center">
                    {member.first_name} {member.last_name}
                  </CardTitle>
                  <div className="text-sm text-gray-600 mb-1 text-center">{member.specialization}</div>
                  <div className="text-sm text-gray-500 mb-1 text-center">{member.department}</div>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <a href={`mailto:${member.email}`} className="text-blue-600 hover:underline text-sm mb-2">
                    {member.email}
                  </a>
                </CardContent>
                <CardFooter className="flex justify-center gap-2 w-full">
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/faculty/${member.id}`}>View Profile</Link>
                  </Button>
                  <Button asChild className="w-full">
                    <a href={`mailto:${member.email}`}>Contact</a>
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload } from "lucide-react"
import { toast } from "sonner"
import type { FacultyProfileData } from "@/app/actions/profiles"
import FacultyDashboardHeader from "@/components/faculty-dashboard-header"

const MAX_PROFILE_IMAGE_BYTES = 2 * 1024 * 1024

function formatDateInputValue(value: unknown) {
  if (!value) {
    return ""
  }

  const textValue = String(value)
  if (/^\d{4}-\d{2}-\d{2}$/.test(textValue)) {
    return textValue
  }

  const date = new Date(textValue)
  if (Number.isNaN(date.getTime())) {
    return ""
  }

  return date.toISOString().slice(0, 10)
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export default function FacultyProfilePage() {
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isSavingPhoto, setIsSavingPhoto] = useState(false)
  const [formData, setFormData] = useState<FacultyProfileData>({
    firstName: "",
    lastName: "",
    email: "",
    profilePictureUrl: "",
    facultyId: "",
    department: "",
    specialization: "",
    dateOfJoining: "",
    dateOfBirth: "",
    phone: "",
    bio: "",
  })
  const mustCompleteProfile = searchParams?.get("completeProfile") === "1"
  const missingFields = searchParams?.get("missing")

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setIsLoading(true)
      const res = await fetch("/api/dashboard/faculty/profile")
      const result = await res.json()
      
      if (res.ok && result.success && result.profile) {
        const profileData = result.profile
        setFormData({
          firstName: (profileData as any).first_name || "",
          lastName: (profileData as any).last_name || "",
          email: profileData.email || "",
          profilePictureUrl: (profileData as any).profile_picture_url || "",
          facultyId: (profileData as any).faculty_id || "",
          department: profileData.department || "",
          specialization: profileData.specialization || "",
          dateOfJoining: formatDateInputValue((profileData as any).date_of_joining),
          dateOfBirth: formatDateInputValue((profileData as any).date_of_birth),
          phone: profileData.phone || "",
          bio: profileData.bio || "",
        })
      } else {
        toast.error("Failed to load profile")
      }
    } catch (error) {
      console.error("Error loading profile:", error)
      toast.error("Failed to load profile")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      const res = await fetch("/api/dashboard/faculty/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const result = await res.json()
      
      if (res.ok && result.success) {
        toast.success("Profile updated successfully")
        await loadProfile() // Reload to get updated data
      } else {
        toast.error(result.message || "Failed to update profile")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: keyof FacultyProfileData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget
    const file = input.files?.[0]

    if (!file) {
      return
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a PNG, JPG, or WebP image.")
      input.value = ""
      return
    }

    if (file.size > MAX_PROFILE_IMAGE_BYTES) {
      toast.error("Please upload a professional photo up to 2MB.")
      input.value = ""
      return
    }

    try {
      setIsSavingPhoto(true)
      const profilePictureUrl = await readFileAsDataUrl(file)
      const nextFormData = { ...formData, profilePictureUrl }
      const res = await fetch("/api/dashboard/faculty/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextFormData),
      })
      const result = await res.json()

      if (res.ok && result.success) {
        setFormData(nextFormData)
        window.dispatchEvent(new CustomEvent("profile-picture-updated", { detail: profilePictureUrl }))
        toast.success("Profile photo uploaded successfully")
      } else {
        toast.error(result.message || "Failed to upload profile photo")
      }
    } catch (error) {
      console.error("Error uploading profile photo:", error)
      toast.error("Failed to upload profile photo")
    } finally {
      setIsSavingPhoto(false)
      input.value = ""
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col faculty-shell">
        <FacultyDashboardHeader />
        <main className="flex-1 px-4 py-8 md:px-6">
          <div className="mx-auto max-w-5xl space-y-6">
            <div className="faculty-panel animate-pulse rounded-lg p-6">
              <div className="h-8 w-56 rounded bg-slate-200"></div>
              <div className="mt-3 h-4 w-80 rounded bg-slate-200"></div>
              <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 w-24 rounded bg-slate-200"></div>
                    <div className="h-10 rounded bg-slate-200"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col faculty-shell">
      <FacultyDashboardHeader />
      <main className="flex-1 px-4 py-8 md:px-6">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="faculty-hero rounded-lg p-6 text-white md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-100">Faculty Profile</p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">Personal Details</h1>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-100 md:text-base">
                  Keep your academic identity, contact details, and research background current across the portal.
                </p>
              </div>
              <Button onClick={handleSave} disabled={isSaving} className="w-full bg-white text-slate-950 shadow-lg shadow-slate-950/20 hover:bg-slate-100 md:w-auto">
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>

          {mustCompleteProfile && (
            <Card className="border-amber-200 bg-amber-50 text-amber-950">
              <CardHeader>
                <CardTitle className="text-base">Complete your faculty profile</CardTitle>
                <CardDescription className="text-amber-800">
                  Faculty modules unlock after required profile details are saved.
                  {missingFields ? ` Missing: ${missingFields}.` : ""}
                </CardDescription>
              </CardHeader>
            </Card>
          )}

        <Card className="faculty-panel-strong rounded-lg">
          <CardHeader>
            <div className="flex flex-col gap-1">
              <div>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal and academic information
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg border border-slate-200/80 bg-white/75 p-5 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Avatar className="h-24 w-24 border-4 border-white shadow-sm">
                  <AvatarImage
                    src={formData.profilePictureUrl || "/placeholder.svg?height=96&width=96"}
                    alt={`${formData.firstName} ${formData.lastName}`.trim() || "Faculty profile"}
                  />
                  <AvatarFallback className="bg-primary text-xl text-white">
                    {`${formData.firstName?.[0] || ""}${formData.lastName?.[0] || ""}`.toUpperCase() || "FA"}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Professional Picture</p>
                    <p className="text-sm text-muted-foreground">Use a clear, professional photo for your profile.</p>
                  </div>
                  <input
                    id="faculty-profile-photo"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="sr-only"
                    onChange={handleProfilePictureUpload}
                    disabled={isSavingPhoto}
                  />
                  <Button variant="outline" size="sm" asChild>
                    <Label htmlFor="faculty-profile-photo" className="cursor-pointer bg-white/80">
                      <Upload className="mr-2 h-4 w-4" />
                      {isSavingPhoto ? "Uploading..." : "Upload Photo"}
                    </Label>
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  className="bg-white/90"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  className="bg-white/90"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  className="bg-white/90"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="facultyId">Faculty ID</Label>
                <Input
                  id="facultyId"
                  className="bg-white/90"
                  value={formData.facultyId}
                  onChange={(e) => handleInputChange("facultyId", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => handleInputChange("department", value)}
                >
                  <SelectTrigger className="bg-white/90">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                    <SelectItem value="Electrical Engineering">Electrical Engineering</SelectItem>
                    <SelectItem value="Mechanical Engineering">Mechanical Engineering</SelectItem>
                    <SelectItem value="Civil Engineering">Civil Engineering</SelectItem>
                    <SelectItem value="Chemical Engineering">Chemical Engineering</SelectItem>
                    <SelectItem value="Biotechnology">Biotechnology</SelectItem>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Physics">Physics</SelectItem>
                    <SelectItem value="Chemistry">Chemistry</SelectItem>
                    <SelectItem value="Biology">Biology</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization</Label>
                <Input
                  id="specialization"
                  className="bg-white/90"
                  value={formData.specialization}
                  onChange={(e) => handleInputChange("specialization", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfJoining">Date of Joining</Label>
                <Input
                  id="dateOfJoining"
                  type="date"
                  className="bg-white/90"
                  value={formData.dateOfJoining}
                  onChange={(e) => handleInputChange("dateOfJoining", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  className="bg-white/90"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  className="bg-white/90"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                className="bg-white/90"
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                placeholder="Tell us about your research interests and experience..."
                rows={4}
              />
            </div>
          </CardContent>
          <div className="flex justify-end border-t border-slate-200/80 px-6 py-4">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </Card>
        </div>
      </main>
    </div>
  )
} 

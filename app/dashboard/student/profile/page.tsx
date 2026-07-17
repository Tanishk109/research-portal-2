"use client"

import type React from "react"
import dynamic from "next/dynamic"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Upload, X, Plus, FileText, Award } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { StudentProfileData } from "@/app/actions/profiles"
import { useToast } from "@/components/ui/use-toast"

const StudentDashboardHeader = dynamic(() => import("@/components/student-dashboard-header"), { ssr: false })
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024
const MAX_PROFILE_IMAGE_BYTES = 2 * 1024 * 1024

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function dataUrlToBlobUrl(dataUrl: string) {
  const [metadata, base64Data] = dataUrl.split(",")
  const mimeType = metadata.match(/^data:([^;]+);base64$/)?.[1] || "application/octet-stream"
  const binary = atob(base64Data || "")
  const bytes = new Uint8Array(binary.length)

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }

  return URL.createObjectURL(new Blob([bytes], { type: mimeType }))
}

export default function StudentProfilePage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profileData, setProfileData] = useState<StudentProfileData>({
    firstName: "",
    lastName: "",
    email: "",
    profilePictureUrl: "",
    registrationNumber: "",
    department: "",
    year: "",
    cgpa: 0,
    phone: "",
    bio: ""
  })
  const [cvData, setCvData] = useState<{ file_url?: string; file_name?: string; mime_type?: string; uploaded_at?: string } | null>(null)
  const [certificates, setCertificates] = useState<Array<{ id: string; name: string; file_url?: string; uploaded_at?: string }>>([])
  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState("")
  const [savingCertificates, setSavingCertificates] = useState(false)
  const [savingSkills, setSavingSkills] = useState(false)
  const [savingPhoto, setSavingPhoto] = useState(false)

  const profileCompletion = useMemo(() => {
    const requiredFields = [
      profileData.firstName,
      profileData.lastName,
      profileData.email,
      profileData.registrationNumber,
      profileData.department,
      profileData.year,
      profileData.cgpa ? String(profileData.cgpa) : "",
      profileData.phone,
      profileData.bio,
      profileData.profilePictureUrl,
    ]

    const completedRequired = requiredFields.filter((value) => String(value || "").trim().length > 0).length
    const baseScore = Math.round((completedRequired / requiredFields.length) * 70)
    const resumeScore = cvData?.file_url ? 10 : 0
    const certificateScore = certificates.length > 0 ? 10 : 0
    const skillsScore = skills.length > 0 ? 10 : 0

    return Math.min(100, baseScore + resumeScore + certificateScore + skillsScore)
  }, [certificates.length, cvData?.file_url, profileData, skills.length])

  const loadProfile = async (showLoading = false) => {
    if (showLoading) {
      setLoading(true)
    }

    try {
      const res = await fetch("/api/dashboard/student/profile")
      const result = await res.json()
      if (res.ok && result.success && result.profile) {
        setProfileData({
          firstName: result.profile.first_name || "",
          lastName: result.profile.last_name || "",
          email: result.profile.email || "",
          profilePictureUrl: result.profile.profile_picture_url || "",
          registrationNumber: result.profile.registration_number || "",
          department: result.profile.department || "",
          year: result.profile.year || "",
          cgpa: result.profile.cgpa || 0,
          phone: result.profile.phone || "",
          bio: result.profile.bio || ""
        })
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to load profile",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading profile:", error)
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      })
    } finally {
      if (showLoading) {
        setLoading(false)
      }
    }
  }

  // Load profile data on component mount
  useEffect(() => {
    loadProfile(true)
    loadCV()
    loadCertificates()
    loadSkills()
  }, [toast])

  // Load CV data
  const loadCV = async () => {
    try {
      const res = await fetch("/api/dashboard/student/cv")
      const result = await res.json()
      if (res.ok && result.success) {
        setCvData(result.data || null)
      }
    } catch (error) {
      console.error("Error loading CV:", error)
    }
  }

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget
    const file = input.files?.[0]

    if (!file) {
      return
    }

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please upload a PNG, JPG, or WebP image.",
        variant: "destructive",
      })
      input.value = ""
      return
    }

    if (file.size > MAX_PROFILE_IMAGE_BYTES) {
      toast({
        title: "Image too large",
        description: "Please upload a professional photo up to 2MB.",
        variant: "destructive",
      })
      input.value = ""
      return
    }

    setSavingPhoto(true)
    try {
      const profilePictureUrl = await readFileAsDataUrl(file)
      const nextProfileData = { ...profileData, profilePictureUrl }
      const res = await fetch("/api/dashboard/student/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextProfileData),
      })
      const result = await res.json()

      if (res.ok && result.success) {
        setProfileData(nextProfileData)
        window.dispatchEvent(new CustomEvent("profile-picture-updated", { detail: profilePictureUrl }))
        toast({
          title: "Success",
          description: "Profile photo uploaded successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to upload profile photo",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error uploading profile photo:", error)
      toast({
        title: "Error",
        description: "Failed to upload profile photo",
        variant: "destructive",
      })
    } finally {
      setSavingPhoto(false)
      input.value = ""
    }
  }

  // Load certificates
  const loadCertificates = async () => {
    try {
      const res = await fetch("/api/dashboard/student/certificates")
      const result = await res.json()
      if (res.ok && result.success && result.data) {
        setCertificates(result.data.map((cert: any) => ({
          id: cert.id,
          name: cert.name,
          file_url: cert.file_url,
          uploaded_at: cert.uploaded_at
        })))
      }
    } catch (error) {
      console.error("Error loading certificates:", error)
    }
  }

  // Load skills
  const loadSkills = async () => {
    try {
      const res = await fetch("/api/dashboard/student/skills")
      const result = await res.json()
      if (res.ok && result.success && result.data) {
        setSkills(result.data)
      }
    } catch (error) {
      console.error("Error loading skills:", error)
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/dashboard/student/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      })
      const result = await res.json()
      if (res.ok && result.success) {
        await loadProfile()
        toast({
          title: "Success",
          description: "Profile updated successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to update profile",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      if (file.size > MAX_UPLOAD_BYTES) {
        toast({
          title: "File too large",
          description: "Please upload a PDF resume up to 5MB.",
          variant: "destructive",
        })
        return
      }

      if (file.type !== "application/pdf") {
        toast({
          title: "PDF required",
          description: "Please upload your resume as a PDF file.",
          variant: "destructive",
        })
        e.target.value = ""
        return
      }

      try {
        const fileUrl = await readFileAsDataUrl(file)
        const res = await fetch("/api/dashboard/student/cv", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ file_url: fileUrl, file_name: file.name }),
        })
        const result = await res.json()
        if (res.ok && result.success) {
          setCvData(result.data || {
            file_url: fileUrl,
            file_name: file.name,
            mime_type: "application/pdf",
            uploaded_at: new Date().toISOString(),
          })
          toast({
            title: "Success",
            description: "Resume uploaded successfully",
          })
        } else {
          toast({
            title: "Error",
            description: result.message || "Failed to upload resume",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error uploading resume:", error)
        toast({
          title: "Error",
          description: "Failed to upload resume",
          variant: "destructive",
        })
      } finally {
        e.target.value = ""
      }
    }
  }

  const handleCertificateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      if (file.size > MAX_UPLOAD_BYTES) {
        toast({
          title: "File too large",
          description: "Please upload a certificate up to 5MB.",
          variant: "destructive",
        })
        return
      }

      const fileName = file.name.replace(/\.[^/.]+$/, "")
      
      setSavingCertificates(true)
      try {
        const fileUrl = await readFileAsDataUrl(file)
        const res = await fetch("/api/dashboard/student/certificates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ file_url: fileUrl, name: fileName }),
        })
        const result = await res.json()
        if (res.ok && result.success) {
          toast({
            title: "Success",
            description: "Certificate uploaded successfully",
          })
          await loadCertificates()
        } else {
          toast({
            title: "Error",
            description: result.message || "Failed to upload certificate",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error uploading certificate:", error)
        toast({
          title: "Error",
          description: "Failed to upload certificate",
          variant: "destructive",
        })
      } finally {
        setSavingCertificates(false)
      }
    }
  }

  const viewStoredFile = (fileUrl?: string) => {
    if (!fileUrl) {
      toast({
        title: "File unavailable",
        description: "No uploaded file is attached to this record.",
        variant: "destructive",
      })
      return
    }

    let viewUrl = fileUrl
    try {
      viewUrl = fileUrl.startsWith("data:") ? dataUrlToBlobUrl(fileUrl) : fileUrl
    } catch (error) {
      console.error("Error preparing file preview:", error)
      toast({
        title: "Unable to preview file",
        description: "The stored file appears to be malformed. Please upload it again.",
        variant: "destructive",
      })
      return
    }

    const opened = window.open(viewUrl, "_blank", "noopener,noreferrer")

    if (!opened) {
      toast({
        title: "Unable to open file",
        description: "Please allow pop-ups for this site and try again.",
        variant: "destructive",
      })
    }
  }

  const removeCV = async () => {
    try {
      const res = await fetch("/api/dashboard/student/cv", {
        method: "DELETE",
      })
      const result = await res.json()

      if (res.ok && result.success) {
        setCvData(null)
        toast({
          title: "Success",
          description: "Resume removed successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to remove resume",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error removing resume:", error)
      toast({
        title: "Error",
        description: "Failed to remove resume",
        variant: "destructive",
      })
    }
  }

  const removeCertificate = async (id: string) => {
    try {
      const res = await fetch(`/api/dashboard/student/certificates?id=${id}`, {
        method: "DELETE",
      })
      const result = await res.json()
      if (res.ok && result.success) {
        toast({
          title: "Success",
          description: "Certificate removed successfully",
        })
        await loadCertificates()
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to remove certificate",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error removing certificate:", error)
      toast({
        title: "Error",
        description: "Failed to remove certificate",
        variant: "destructive",
      })
    }
  }

  const addSkill = () => {
    if (newSkill && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill])
      setNewSkill("")
    }
  }

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill))
  }

  const handleSaveSkills = async () => {
    setSavingSkills(true)
    try {
      const res = await fetch("/api/dashboard/student/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills }),
      })
      const result = await res.json()
      if (res.ok && result.success) {
        toast({
          title: "Success",
          description: "Skills saved successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to save skills",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving skills:", error)
      toast({
        title: "Error",
        description: "Failed to save skills",
        variant: "destructive",
      })
    } finally {
      setSavingSkills(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col dashboard-shell">
        <StudentDashboardHeader />
        <main className="flex-1 px-4 py-8 md:px-6">
          <div className="mx-auto max-w-5xl">
            <div className="dashboard-panel flex h-64 items-center justify-center rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Loading profile...</span>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col dashboard-shell">
      <StudentDashboardHeader />
      <main className="flex-1 px-4 py-8 md:px-6">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="dashboard-hero rounded-lg p-6 text-white md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-100">Student Profile</p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">Academic Identity</h1>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-100 md:text-base">
                  Keep your profile, academic details, resume, certificates, and skills ready for faculty review.
                </p>
            </div>
              <div className="w-full rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur md:w-72">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-white">Profile Completion</span>
                  <span className="text-sm font-semibold text-cyan-100">{profileCompletion}%</span>
                </div>
                <Progress value={profileCompletion} className="h-2" />
              </div>
            </div>
          </div>

          <Tabs defaultValue="personal" className="space-y-6">
            <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-lg border border-slate-200 bg-white/90 p-1 shadow-sm md:grid-cols-4">
              <TabsTrigger value="personal">
                Personal Info
              </TabsTrigger>
              <TabsTrigger value="cv">
                Resume
              </TabsTrigger>
              <TabsTrigger value="certificates">
                Certificates
              </TabsTrigger>
              <TabsTrigger value="skills">
                Skills
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal">
              <Card className="dashboard-panel-strong rounded-lg">
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your personal details and academic information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="rounded-lg border border-slate-200/80 bg-white/75 p-5 shadow-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <Avatar className="h-24 w-24 border-4 border-white shadow-sm">
                        <AvatarImage
                          src={profileData.profilePictureUrl || "/placeholder.svg?height=96&width=96"}
                          alt={`${profileData.firstName} ${profileData.lastName}`.trim() || "Student profile"}
                        />
                        <AvatarFallback className="bg-primary text-white text-xl">
                          {`${profileData.firstName?.[0] || ""}${profileData.lastName?.[0] || ""}`.toUpperCase() || "ST"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-medium text-slate-900">Professional Picture</p>
                          <p className="text-sm text-muted-foreground">Use a clear, professional photo for your profile.</p>
                        </div>
                        <input
                          id="student-profile-photo"
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="sr-only"
                          onChange={handleProfilePictureUpload}
                          disabled={savingPhoto || loading}
                        />
                        <Button variant="outline" size="sm" asChild>
                          <Label htmlFor="student-profile-photo" className="cursor-pointer">
                            <Upload className="mr-2 h-4 w-4" />
                            {savingPhoto ? "Uploading..." : "Upload Photo"}
                          </Label>
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="first-name">First Name</Label>
                            <Input 
                              id="first-name" 
                              className="bg-white/90"
                              value={profileData.firstName}
                              onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                              disabled={loading}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="last-name">Last Name</Label>
                            <Input 
                              id="last-name" 
                              className="bg-white/90"
                              value={profileData.lastName}
                              onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                              disabled={loading}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                          <Input 
                            id="email" 
                            type="email" 
                            className="bg-white/90"
                            value={profileData.email}
                            onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                            disabled={loading}
                          />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reg-number">Registration Number</Label>
                          <Input 
                            id="reg-number" 
                            className="bg-white/90"
                            value={profileData.registrationNumber}
                            onChange={(e) => setProfileData({...profileData, registrationNumber: e.target.value})}
                            disabled={loading}
                          />
                      </div>
                    </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Select value={profileData.department} onValueChange={(value) => setProfileData({...profileData, department: value})} disabled={loading}>
                        <SelectTrigger id="department" className="bg-white/90">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Computer Science">Computer Science</SelectItem>
                          <SelectItem value="Electrical Engineering">Electrical Engineering</SelectItem>
                          <SelectItem value="Mechanical Engineering">Mechanical Engineering</SelectItem>
                          <SelectItem value="Civil Engineering">Civil Engineering</SelectItem>
                          <SelectItem value="Biotechnology">Biotechnology</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="year">Current Year</Label>
                      <Select value={profileData.year} onValueChange={(value) => setProfileData({...profileData, year: value})} disabled={loading}>
                        <SelectTrigger id="year" className="bg-white/90">
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">First Year</SelectItem>
                          <SelectItem value="2">Second Year</SelectItem>
                          <SelectItem value="3">Third Year</SelectItem>
                          <SelectItem value="4">Fourth Year</SelectItem>
                          <SelectItem value="pg">Postgraduate</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cgpa">CGPA</Label>
                      <Input 
                        id="cgpa" 
                        type="number" 
                        className="bg-white/90"
                        step="0.01" 
                        min="0" 
                        max="10" 
                        value={profileData.cgpa}
                        onChange={(e) => setProfileData({...profileData, cgpa: parseFloat(e.target.value) || 0})}
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input 
                        id="phone" 
                        type="tel" 
                        className="bg-white/90"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      placeholder="Write a short bio about yourself..."
                      className="min-h-[100px] bg-white/90"
                      value={profileData.bio}
                      onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                      disabled={loading}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button onClick={handleSaveProfile} disabled={saving} className="bg-primary hover:bg-primary/90">
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="cv">
              <Card className="dashboard-panel-strong rounded-lg">
                <CardHeader>
                  <CardTitle>Resume</CardTitle>
                  <CardDescription>Upload a professional PDF resume to share with faculty members reviewing applications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {cvData ? (
                    <div className="flex items-center justify-between rounded-lg border border-slate-200/80 bg-white/75 p-4">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-primary" />
                        <div>
                          <p className="font-medium">{cvData.file_name || "Uploaded Resume.pdf"}</p>
                          <p className="text-sm text-muted-foreground">
                            Uploaded on{" "}
                            {cvData?.uploaded_at ? new Date(cvData.uploaded_at).toLocaleDateString() : new Date().toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => viewStoredFile(cvData?.file_url)}>
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={removeCV}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white/60 p-8 text-center">
                      <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                      <h3 className="font-medium text-lg mb-1">Upload your resume</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Drag and drop your PDF resume, or click to browse
                      </p>
                      <p className="text-xs text-muted-foreground mb-6">PDF only, up to 5MB</p>
                      <div className="relative">
                        <Input
                          type="file"
                          id="cv-upload"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          accept="application/pdf,.pdf"
                          onChange={handleCVUpload}
                        />
                        <Button variant="outline">Select File</Button>
                      </div>
                    </div>
                  )}

                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="certificates">
              <Card className="dashboard-panel-strong rounded-lg">
                <CardHeader>
                  <CardTitle>Certificates & Achievements</CardTitle>
                  <CardDescription>Upload certificates and showcase your achievements</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4">
                    {certificates.map((cert) => (
                      <div key={cert.id} className="flex items-center justify-between rounded-lg border border-slate-200/80 bg-white/75 p-4">
                        <div className="flex items-center gap-3">
                          <Award className="h-8 w-8 text-accent" />
                          <div>
                            <p className="font-medium">{cert.name}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>• {cert.uploaded_at ? new Date(cert.uploaded_at).toLocaleDateString() : "Recently uploaded"}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => viewStoredFile(cert.file_url)}>
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => removeCertificate(cert.id)}
                            disabled={savingCertificates}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white/60 p-6 text-center">
                    <Award className="h-8 w-8 text-muted-foreground mb-3" />
                    <h3 className="font-medium mb-1">Add a new certificate</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Upload certificates, awards, or other achievements
                    </p>
                    <div className="relative">
                      <Input
                        type="file"
                        id="cert-upload"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleCertificateUpload}
                      />
                      <Button variant="outline">Upload Certificate</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="skills">
              <Card className="dashboard-panel-strong rounded-lg">
                <CardHeader>
                  <CardTitle>Skills & Expertise</CardTitle>
                  <CardDescription>Add your technical and soft skills to highlight your expertise</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="gap-1 px-2 py-1">
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="ml-1 rounded-full hover:bg-muted p-1"
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Remove {skill}</span>
                        </button>
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        placeholder="Add a new skill (e.g. Python, Leadership, etc.)"
                        className="bg-white/90"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            addSkill()
                          }
                        }}
                      />
                    </div>
                    <Button type="button" variant="outline" onClick={addSkill} disabled={!newSkill}>
                      <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                  </div>

                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button 
                    className="bg-primary hover:bg-primary/90"
                    onClick={handleSaveSkills}
                    disabled={savingSkills}
                  >
                    {savingSkills ? "Saving..." : "Save Changes"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

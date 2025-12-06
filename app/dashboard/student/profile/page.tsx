"use client"

import type React from "react"
import dynamic from "next/dynamic"
import useSWR from "swr"
import Image from "next/image"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Upload, X, Plus, FileText, Award, Save } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { StudentProfileData } from "@/app/actions/profiles"
import { useToast } from "@/hooks/use-toast"

const StudentDashboardHeader = dynamic(() => import("@/components/student-dashboard-header"), { ssr: false })

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function StudentProfilePage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profileData, setProfileData] = useState<StudentProfileData>({
    firstName: "",
    lastName: "",
    email: "",
    registrationNumber: "",
    department: "",
    year: "",
    cgpa: 0,
    phone: "",
    bio: ""
  })
  const [profileCompletion, setProfileCompletion] = useState(65)
  const [uploadedCV, setUploadedCV] = useState<File | null>(null)
  const [certificates, setCertificates] = useState([
    { id: 1, name: "Python Programming Certificate", type: "Technical", date: "2022-05-15" },
    { id: 2, name: "Best Student Award", type: "Academic", date: "2023-01-10" },
  ])
  const [skills, setSkills] = useState(["Python", "Machine Learning", "Data Analysis", "Java", "Web Development"])
  const [newSkill, setNewSkill] = useState("")

  const { data, error, isLoading: swrLoading } = useSWR("/api/dashboard/student/profile", fetcher, { refreshInterval: 30000 })

  // Load profile data on component mount
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/dashboard/student/profile")
        const result = await res.json()
        if (res.ok && result.success && result.profile) {
          setProfileData({
            firstName: result.profile.first_name || "",
            lastName: result.profile.last_name || "",
            email: result.profile.email || "",
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
        setLoading(false)
      }
    }

    loadProfile()
  }, [toast])

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

  const handleCVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedCV(e.target.files[0])
      setProfileCompletion(Math.min(profileCompletion + 10, 100))
    }
  }

  const handleCertificateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const newCert = {
        id: certificates.length + 1,
        name: e.target.files[0].name.replace(/\.[^/.]+$/, ""),
        type: "Other",
        date: new Date().toISOString().split("T")[0],
      }
      setCertificates([...certificates, newCert])
      setProfileCompletion(Math.min(profileCompletion + 5, 100))
    }
  }

  const removeCertificate = (id: number) => {
    setCertificates(certificates.filter((cert) => cert.id !== id))
    setProfileCompletion(Math.max(profileCompletion - 5, 0))
  }

  const addSkill = () => {
    if (newSkill && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill])
      setNewSkill("")
      setProfileCompletion(Math.min(profileCompletion + 2, 100))
    }
  }

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill))
    setProfileCompletion(Math.max(profileCompletion - 2, 0))
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <StudentDashboardHeader />
        <main className="flex-1 p-6 md:p-10">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Loading profile...</span>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <StudentDashboardHeader />
      <main className="flex-1 p-6 md:p-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-primary">Student Profile</h1>
              <p className="text-muted-foreground">Manage your personal information, CV, and certificates</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground">Profile Completion</div>
              <Progress value={profileCompletion} className="w-32 h-2" />
              <span className="text-sm font-medium">{profileCompletion}%</span>
            </div>
          </div>

          <Tabs defaultValue="personal" className="space-y-6">
            <TabsList className="bg-white border">
              <TabsTrigger value="personal" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                Personal Info
              </TabsTrigger>
              <TabsTrigger value="cv" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                CV & Resume
              </TabsTrigger>
              <TabsTrigger
                value="certificates"
                className="data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                Certificates
              </TabsTrigger>
              <TabsTrigger value="skills" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                Skills
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your personal details and academic information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="flex flex-col items-center gap-2">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src="/placeholder.svg?height=96&width=96" alt="Alex Johnson" />
                        <AvatarFallback className="bg-secondary text-white text-xl">AJ</AvatarFallback>
                      </Avatar>
                      <Button variant="outline" size="sm" className="mt-2">
                        Change Photo
                      </Button>
                    </div>
                    <div className="flex-1 grid gap-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="first-name">First Name</Label>
                            <Input 
                              id="first-name" 
                              value={profileData.firstName}
                              onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                              disabled={loading}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="last-name">Last Name</Label>
                            <Input 
                              id="last-name" 
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
                            value={profileData.email}
                            onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                            disabled={loading}
                          />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reg-number">Registration Number</Label>
                          <Input 
                            id="reg-number" 
                            value={profileData.registrationNumber}
                            onChange={(e) => setProfileData({...profileData, registrationNumber: e.target.value})}
                            disabled={loading}
                          />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Select value={profileData.department} onValueChange={(value) => setProfileData({...profileData, department: value})} disabled={loading}>
                        <SelectTrigger id="department">
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
                        <SelectTrigger id="year">
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
                      className="min-h-[100px]"
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
              <Card>
                <CardHeader>
                  <CardTitle>CV & Resume</CardTitle>
                  <CardDescription>Upload your CV or resume to share with faculty members</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {uploadedCV ? (
                    <div className="border rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-primary" />
                        <div>
                          <p className="font-medium">{uploadedCV.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(uploadedCV.size / 1024 / 1024).toFixed(2)} MB • Uploaded on{" "}
                            {new Date().toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => setUploadedCV(null)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="border border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center">
                      <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                      <h3 className="font-medium text-lg mb-1">Upload your CV</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Drag and drop your CV or resume file, or click to browse
                      </p>
                      <p className="text-xs text-muted-foreground mb-6">PDF, DOCX or ODT up to 5MB</p>
                      <div className="relative">
                        <Input
                          type="file"
                          id="cv-upload"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          accept=".pdf,.docx,.odt"
                          onChange={handleCVUpload}
                        />
                        <Button variant="outline">Select File</Button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="cv-description">Description</Label>
                    <Textarea
                      id="cv-description"
                      placeholder="Add a brief description of your CV..."
                      className="min-h-[80px]"
                      defaultValue="My CV highlights my academic achievements, technical skills, and relevant coursework in Computer Science with a focus on machine learning and data analysis."
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button className="bg-primary hover:bg-primary/90">Save Changes</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="certificates">
              <Card>
                <CardHeader>
                  <CardTitle>Certificates & Achievements</CardTitle>
                  <CardDescription>Upload certificates and showcase your achievements</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4">
                    {certificates.map((cert) => (
                      <div key={cert.id} className="border rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Award className="h-8 w-8 text-accent" />
                          <div>
                            <p className="font-medium">{cert.name}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Badge variant="outline" className="text-xs">
                                {cert.type}
                              </Badge>
                              <span>• {new Date(cert.date).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => removeCertificate(cert.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center">
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
                <CardFooter className="flex justify-end">
                  <Button className="bg-primary hover:bg-primary/90">Save Changes</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="skills">
              <Card>
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

                  <div className="space-y-2">
                    <Label htmlFor="skill-description">Skills Description</Label>
                    <Textarea
                      id="skill-description"
                      placeholder="Describe your skills and expertise in more detail..."
                      className="min-h-[100px]"
                      defaultValue="I have strong programming skills in Python and Java, with experience in machine learning frameworks like TensorFlow and PyTorch. I'm also proficient in data analysis using pandas and numpy, and have good problem-solving abilities."
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button className="bg-primary hover:bg-primary/90">Save Changes</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

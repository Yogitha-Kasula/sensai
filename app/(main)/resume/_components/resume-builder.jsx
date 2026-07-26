"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { saveResume, improveWithAI } from "@/actions/resume";
import { parseResumeMarkdown, generateResumeMarkdown } from "@/lib/resume-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Download, Plus, Trash2, Sparkles, Wand2, Edit, Monitor, AlertTriangle } from "lucide-react";
import { BarLoader } from "react-spinners";
import dynamic from "next/dynamic";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const resumeSchema = z.object({
  contactInfo: z.object({
    name: z.string().optional(),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    mobile: z.string().regex(/^[0-9\s+()-]*$/, "Invalid phone number").optional(),
    linkedin: z.string().url("Invalid URL").optional().or(z.literal("")),
    twitter: z.string().url("Invalid URL").optional().or(z.literal("")),
    countryCode: z.string().optional()
  }).superRefine((data, ctx) => {
    if (data.countryCode === "+91" && data.mobile) {
      const digits = data.mobile.replace(/\D/g, '');
      if (digits.length !== 10) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Indian phone number must be exactly 10 digits",
          path: ["mobile"],
        });
      }
    }
  }).optional(),
  summary: z.string().optional(),
  skills: z.string().optional(),
  experience: z.array(z.any()).optional(),
  education: z.array(z.any()).optional(),
  projects: z.array(z.any()).optional(),
});

export default function ResumeBuilder({ initialContent }) {
  const [activeTab, setActiveTab] = useState("form");
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [markdownContent, setMarkdownContent] = useState(initialContent ? initialContent.replace(/<!-- RESUME_DATA: .*? -->/g, "").trim() : "");
  const [isAddingExp, setIsAddingExp] = useState(false);
  const [activeExpIndex, setActiveExpIndex] = useState(null);
  const [resumeMode, setResumeMode] = useState("preview");
  
  const { theme } = useTheme();

  const initialData = parseResumeMarkdown(initialContent);

  const { register, control, handleSubmit, getValues, setValue, watch, formState: { errors } } = useForm({
    defaultValues: initialData,
    resolver: zodResolver(resumeSchema),
    mode: "onTouched",
  });

  const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({ control, name: "experience" });
  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({ control, name: "education" });
  const { fields: projFields, append: appendProj, remove: removeProj } = useFieldArray({ control, name: "projects" });

  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      let md = activeTab === "markdown" ? markdownContent : generateResumeMarkdown(data);
      
      const jsonString = JSON.stringify(data);
      md += `\n<!-- RESUME_DATA: ${jsonString} -->\n`;

      await saveResume(md);
      toast.success("Resume saved successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to save resume");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = () => {
    if (activeTab === "markdown") {
      // If we're in markdown mode, just save, don't validate form
      onSubmit(getValues());
    } else {
      // Will trigger validation
      handleSubmit(onSubmit, (errs) => {
        toast.error("Please fix the validation errors before saving.");
      })();
    }
  };

  const handleImproveWithAI = async (type, index = null) => {
    setIsImproving(true);
    try {
      let currentText = "";
      let fieldPath = "";
      
      if (type === "summary") {
        currentText = getValues("summary");
        fieldPath = "summary";
      } else if (type === "experience") {
        currentText = getValues(`experience.${index}.description`);
        fieldPath = `experience.${index}.description`;
      }
      
      if (!currentText) {
        toast.error("Please write something first to improve it.");
        return;
      }
      
      const improvedText = await improveWithAI({ current: currentText, type });
      setValue(fieldPath, improvedText);
      toast.success("Content improved by AI!");
    } catch (error) {
      toast.error(error.message || "Failed to improve content");
    } finally {
      setIsImproving(false);
    }
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      if (typeof window !== "undefined") {
        if (!window.html2pdf) {
          await new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }
        
        // 1. Create an inline-styled overlay to hide the screen from flashing
        const overlay = document.createElement("div");
        overlay.style.position = "fixed";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100vw";
        overlay.style.height = "100vh";
        overlay.style.backgroundColor = document.documentElement.classList.contains("dark") ? "#020617" : "#ffffff";
        overlay.style.zIndex = "999999";
        overlay.style.display = "flex";
        overlay.style.flexDirection = "column";
        overlay.style.justifyContent = "center";
        overlay.style.alignItems = "center";
        const textColor = document.documentElement.classList.contains("dark") ? "#ffffff" : "#000000";
        overlay.innerHTML = `
          <div style="width: 40px; height: 40px; border: 4px solid #3b82f6; border-top-color: transparent; border-radius: 50%; animation: pdf-spin 1s linear infinite;"></div>
          <h2 style="font-family: Arial, sans-serif; font-size: 20px; color: ${textColor}; margin-top: 20px;">Preparing PDF...</h2>
          <style>@keyframes pdf-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
        `;
        document.body.appendChild(overlay);

        // Wait a frame for overlay to render
        await new Promise(resolve => setTimeout(resolve, 50));

        // 2. Detach ALL stylesheets to prevent html2canvas from crashing on oklch
        const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'));
        const overlayStyles = Array.from(overlay.querySelectorAll('style'));
        const stashedStyles = styles.map(s => ({ node: s, parent: s.parentNode }));
        
        styles.forEach(s => {
          if (!overlayStyles.includes(s)) {
            s.remove();
          }
        });

        // 3. Convert the element to a raw HTML string.
        const element = document.getElementById("resume-pdf");
        const htmlStr = element.outerHTML;

        const opt = {
          margin:       [15, 15],
          filename:     'resume.pdf',
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  { scale: 2, useCORS: true },
          jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        await window.html2pdf().set(opt).from(htmlStr).save();

        // 4. Restore Stylesheets safely
        stashedStyles.forEach(s => {
          try {
            if (!overlayStyles.includes(s.node)) {
              s.parent.appendChild(s.node);
            }
          } catch(e) {}
        });

        // Wait a frame for styles to apply
        await new Promise(resolve => setTimeout(resolve, 50));

        // 5. Remove overlay
        if (document.body.contains(overlay)) {
          document.body.removeChild(overlay);
        }
      }
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error(error?.message ? `PDF Error: ${error.message}` : "Failed to generate PDF.");
    } finally {
      setIsDownloading(false);
    }
  };

  const formValues = watch();

  // Sync markdown content when form values change (only when in form tab)
  useEffect(() => {
    if (activeTab === "form") {
      setMarkdownContent(generateResumeMarkdown(formValues));
    }
  }, [formValues, activeTab]);

  return (
    <div className="max-w-5xl mx-auto flex flex-col h-full relative">
      <div className="flex justify-between items-center mb-6 no-print">
        <h1 className="text-4xl font-bold font-gradient">Resume Builder</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
          <Button onClick={handleDownloadPDF} disabled={isDownloading}>
            <Download className="h-4 w-4 mr-2" />
            {isDownloading ? "Downloading..." : "Download PDF"}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 no-print">
        <Button variant={activeTab === "form" ? "secondary" : "ghost"} onClick={() => setActiveTab("form")}>
          Form
        </Button>
        <Button variant={activeTab === "markdown" ? "secondary" : "ghost"} onClick={() => setActiveTab("markdown")}>
          Markdown
        </Button>
      </div>

      {isImproving && (
        <div className="fixed inset-0 z-50 bg-background/50 flex items-center justify-center backdrop-blur-sm no-print">
          <div className="flex flex-col items-center gap-4">
            <BarLoader color="gray" width={"100%"} />
            <p className="font-semibold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-500" />
              Improving with AI...
            </p>
          </div>
        </div>
      )}

      {/* Markdown Tab */}
      {activeTab === "markdown" && (
        <div className="flex-1 flex flex-col gap-4 min-h-[600px] no-print" data-color-mode={theme === "dark" ? "dark" : "light"}>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <Button 
                variant="ghost" 
                size="sm"
                className="w-fit text-muted-foreground hover:text-foreground hover:bg-transparent px-0"
                onClick={() => setResumeMode(resumeMode === "preview" ? "edit" : "preview")}
              >
                {resumeMode === "preview" ? (
                  <>
                    <Edit className="h-4 w-4 mr-2" /> Edit Resume
                  </>
                ) : (
                  <>
                    <Monitor className="h-4 w-4 mr-2" /> Show Preview
                  </>
                )}
              </Button>
            </div>

            {resumeMode === "edit" && (
              <div className="border border-yellow-500/50 text-yellow-500 p-3 rounded-md flex items-center gap-3 text-sm bg-yellow-500/10 w-full">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <p>You will lose edited markdown if you update the form data.</p>
              </div>
            )}
          </div>

          <MDEditor
            value={markdownContent}
            onChange={(v) => setMarkdownContent(v || "")}
            height={600}
            preview={resumeMode}
          />
        </div>
      )}

      {/* Form Tab */}
      {activeTab === "form" && (
        <div className="space-y-8 no-print pb-20">
          
          {/* Contact Information */}
          <section>
            <h2 className="text-xl font-bold mb-4">Contact Information</h2>
            <Card>
              <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input placeholder="John Doe" {...register("contactInfo.name")} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input placeholder="your@email.com" {...register("contactInfo.email")} type="email" className={errors.contactInfo?.email ? "border-red-500" : ""} />
                  {errors.contactInfo?.email && <p className="text-xs text-red-500">{errors.contactInfo.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Mobile Number</Label>
                  <div className="flex">
                    <Controller
                      control={control}
                      name="contactInfo.countryCode"
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="w-[100px] rounded-r-none border-r-0 focus:ring-0 focus:ring-offset-0 bg-transparent">
                            <SelectValue placeholder="+91" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="+1">+1 (US)</SelectItem>
                            <SelectItem value="+44">+44 (UK)</SelectItem>
                            <SelectItem value="+91">+91 (IN)</SelectItem>
                            <SelectItem value="+61">+61 (AU)</SelectItem>
                            <SelectItem value="+81">+81 (JP)</SelectItem>
                            <SelectItem value="+86">+86 (CN)</SelectItem>
                            <SelectItem value="+49">+49 (DE)</SelectItem>
                            <SelectItem value="+33">+33 (FR)</SelectItem>
                            <SelectItem value="+971">+971 (AE)</SelectItem>
                            <SelectItem value="+65">+65 (SG)</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <Input 
                      className={`rounded-l-none ${errors.contactInfo?.mobile ? "border-red-500" : ""}`} 
                      placeholder="98765 43210" 
                      type="tel" 
                      {...register("contactInfo.mobile")}
                      onInput={(e) => {
                        let val = e.target.value.replace(/[^0-9\s+()-]/g, '');
                        if (watch("contactInfo.countryCode") === "+91") {
                          let digits = val.replace(/\D/g, '');
                          if (digits.length > 10) {
                            digits = digits.substring(0, 10);
                          }
                          val = digits;
                        }
                        e.target.value = val;
                      }}
                    />
                  </div>
                  {errors.contactInfo?.mobile && <p className="text-xs text-red-500">{errors.contactInfo.mobile.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>LinkedIn URL</Label>
                  <Input 
                    placeholder="https://linkedin.com/in/your-profile" 
                    type="url"
                    {...register("contactInfo.linkedin")} 
                    className={errors.contactInfo?.linkedin ? "border-red-500" : ""} 
                    onBlur={(e) => {
                      register("contactInfo.linkedin").onBlur(e);
                      let val = e.target.value;
                      if (val && !val.startsWith('http')) {
                        val = 'https://' + (val.includes('linkedin.com') ? val : 'linkedin.com/in/' + val);
                        setValue("contactInfo.linkedin", val, { shouldValidate: true });
                      }
                    }}
                  />
                  {errors.contactInfo?.linkedin && <p className="text-xs text-red-500">{errors.contactInfo.linkedin.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Twitter/X Profile</Label>
                  <Input 
                    placeholder="https://twitter.com/your-handle" 
                    type="url"
                    {...register("contactInfo.twitter")} 
                    className={errors.contactInfo?.twitter ? "border-red-500" : ""} 
                    onBlur={(e) => {
                      register("contactInfo.twitter").onBlur(e);
                      let val = e.target.value;
                      if (val && !val.startsWith('http')) {
                        val = 'https://' + (val.includes('twitter.com') || val.includes('x.com') ? val : 'twitter.com/' + val);
                        setValue("contactInfo.twitter", val, { shouldValidate: true });
                      }
                    }}
                  />
                  {errors.contactInfo?.twitter && <p className="text-xs text-red-500">{errors.contactInfo.twitter.message}</p>}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Professional Summary */}
          <section>
            <h2 className="text-xl font-bold mb-4">Professional Summary</h2>
            <Card>
              <CardContent className="pt-6">
                <Textarea 
                  placeholder="Write a compelling professional summary..." 
                  className="min-h-[150px] mb-2" 
                  {...register("summary")} 
                />
                <Button variant="secondary" size="sm" onClick={() => handleImproveWithAI("summary")} type="button">
                  <Wand2 className="h-4 w-4 mr-2" /> Improve with AI
                </Button>
              </CardContent>
            </Card>
          </section>

          {/* Skills */}
          <section>
            <h2 className="text-xl font-bold mb-4">Skills</h2>
            <Card>
              <CardContent className="pt-6">
                <Textarea 
                  placeholder="List your key skills (e.g. JavaScript, React, Node.js)" 
                  className="min-h-[100px]" 
                  {...register("skills")} 
                />
              </CardContent>
            </Card>
          </section>

          {/* Work Experience */}
          <section>
            <h2 className="text-xl font-bold mb-4">Work Experience</h2>
            <div className="space-y-4">
              {expFields.map((field, index) => {
                const isEditing = activeExpIndex === index;

                if (isEditing) {
                  return (
                    <Card key={field.id} className="border-border">
                      <CardContent className="pt-6 space-y-4">
                        <h3 className="font-semibold mb-4">Edit Experience</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input placeholder="Title/Position" {...register(`experience.${index}.title`)} />
                          <Input placeholder="Organization/Company" {...register(`experience.${index}.company`)} />
                          <div className="flex-1">
                            <Input type="month" {...register(`experience.${index}.startDate`)} />
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <Input type="month" disabled={watch(`experience.${index}.isCurrent`)} {...register(`experience.${index}.endDate`)} />
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <input type="checkbox" id={`current-${index}`} {...register(`experience.${index}.isCurrent`)} className="rounded bg-background" />
                          <Label htmlFor={`current-${index}`}>Current Experience</Label>
                        </div>
                        
                        <div className="space-y-2 mt-4">
                          <Textarea placeholder="Description of your experience" className="min-h-[100px]" {...register(`experience.${index}.description`)} />
                          <div className="flex justify-between items-center mt-4">
                            <Button variant="ghost" size="sm" onClick={() => handleImproveWithAI("experience", index)} type="button">
                              <Sparkles className="h-4 w-4 mr-2" /> Improve with AI
                            </Button>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" onClick={() => setActiveExpIndex(null)} type="button">Cancel</Button>
                              <Button size="sm" onClick={() => setActiveExpIndex(null)} type="button">Save Entry</Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                }

                return (
                  <Card key={field.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setActiveExpIndex(index)}>
                    <CardContent className="pt-6 flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{watch(`experience.${index}.title`) || "Untitled"}</h3>
                        <p className="text-sm text-muted-foreground">{watch(`experience.${index}.company`) || "No company"}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {watch(`experience.${index}.startDate`)} - {watch(`experience.${index}.isCurrent`) ? "Present" : watch(`experience.${index}.endDate`)}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={(e) => { e.stopPropagation(); removeExp(index); }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}

              {isAddingExp && (
                <Card className="border-border">
                  <CardContent className="pt-6 space-y-4">
                    <h3 className="font-semibold mb-4">Add Experience</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input placeholder="Title/Position" {...register(`experience.${expFields.length}.title`)} />
                      <Input placeholder="Organization/Company" {...register(`experience.${expFields.length}.company`)} />
                      <div className="flex-1">
                        <Input type="month" {...register(`experience.${expFields.length}.startDate`)} />
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <Input type="month" disabled={watch(`experience.${expFields.length}.isCurrent`)} {...register(`experience.${expFields.length}.endDate`)} />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <input type="checkbox" id={`current-new`} {...register(`experience.${expFields.length}.isCurrent`)} className="rounded bg-background" />
                      <Label htmlFor={`current-new`}>Current Experience</Label>
                    </div>
                    
                    <div className="space-y-2 mt-4">
                      <Textarea placeholder="Description of your experience" className="min-h-[100px]" {...register(`experience.${expFields.length}.description`)} />
                      <div className="flex justify-between items-center mt-4">
                        <Button variant="ghost" size="sm" onClick={() => handleImproveWithAI("experience", expFields.length)} type="button">
                          <Sparkles className="h-4 w-4 mr-2" /> Improve with AI
                        </Button>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setIsAddingExp(false)} type="button">Cancel</Button>
                          <Button size="sm" onClick={() => { 
                            appendExp(getValues(`experience.${expFields.length}`)); 
                            setIsAddingExp(false);
                            // Clear the temp values using setValue (since react-hook-form keeps them in memory for that index)
                            setValue(`experience.${expFields.length}`, undefined);
                          }} type="button">
                            <Plus className="h-4 w-4 mr-2" /> Add Entry
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {!isAddingExp && activeExpIndex === null && (
              <Button variant="outline" className="w-full mt-4" onClick={() => setIsAddingExp(true)} type="button">
                <Plus className="h-4 w-4 mr-2" /> Add Experience
              </Button>
            )}
          </section>

          {/* Education */}
          <section>
            <h2 className="text-xl font-bold mb-4">Education</h2>
            <div className="space-y-4">
              {eduFields.map((field, index) => (
                <Card key={field.id}>
                  <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>School/University</Label>
                      <Input placeholder="University Name" {...register(`education.${index}.school`)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Degree/Course</Label>
                      <Input placeholder="Bachelor of Science in Computer Science" {...register(`education.${index}.degree`)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Start Year</Label>
                      <Input type="number" placeholder="2018" {...register(`education.${index}.startYear`)} />
                    </div>
                    <div className="space-y-2">
                      <Label>End Year</Label>
                      <Input type="number" placeholder="2022" {...register(`education.${index}.endYear`)} />
                    </div>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 w-fit md:col-span-2" onClick={() => removeEdu(index)}>
                      <Trash2 className="h-4 w-4 mr-2" /> Remove Education
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4" onClick={() => appendEdu({ school: "", degree: "", startYear: "", endYear: "" })}>
              <Plus className="h-4 w-4 mr-2" /> Add Education
            </Button>
          </section>

          {/* Projects */}
          <section>
            <h2 className="text-xl font-bold mb-4">Projects</h2>
            <div className="space-y-4">
              {projFields.map((field, index) => (
                <Card key={field.id}>
                  <CardContent className="pt-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Project Name</Label>
                        <Input placeholder="Project Title" {...register(`projects.${index}.name`)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Link (Optional)</Label>
                        <Input placeholder="https://github.com/your-repo" {...register(`projects.${index}.link`)} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea placeholder="Describe the project..." {...register(`projects.${index}.description`)} />
                    </div>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 w-fit" onClick={() => removeProj(index)}>
                      <Trash2 className="h-4 w-4 mr-2" /> Remove Project
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4" onClick={() => appendProj({ name: "", link: "", description: "" })}>
              <Plus className="h-4 w-4 mr-2" /> Add Project
            </Button>
          </section>
        </div>
      )}

      {/* Print View Container */}
      <div id="resume-pdf" className="w-full absolute top-0 left-[-9999px] print:static print:left-auto" style={{ backgroundColor: '#ffffff', color: '#000000' }}>
        <style dangerouslySetInnerHTML={{__html: `
          #resume-pdf * {
            border-color: #e5e7eb !important;
            color: inherit;
            background-color: inherit;
          }
        `}} />
        <div style={{ maxWidth: "56rem", margin: "0 auto", padding: "2rem", fontFamily: "'Times New Roman', Times, serif", backgroundColor: '#ffffff', color: '#111827' }}>
          
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <h1 style={{ color: '#111827', fontSize: "28px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "8px" }}>
              {formValues?.contactInfo?.name ? formValues.contactInfo.name : (formValues?.contactInfo?.email ? formValues.contactInfo.email.split('@')[0].replace(/[._]/g, ' ') : "YOUR NAME")}
            </h1>
            <div style={{ color: '#4b5563', fontSize: "12px", display: "flex", justifyContent: "center", gap: "12px" }}>
              {formValues?.contactInfo?.email && <span>{formValues.contactInfo.email}</span>}
              {formValues?.contactInfo?.mobile && <span>• {formValues?.contactInfo?.countryCode} {formValues.contactInfo.mobile}</span>}
              {formValues?.contactInfo?.linkedin && <span>• {formValues.contactInfo.linkedin}</span>}
              {formValues?.contactInfo?.twitter && <span>• {formValues.contactInfo.twitter}</span>}
            </div>
          </div>

          {/* Summary */}
          {formValues?.summary && (
            <div style={{ marginBottom: "20px" }}>
              <h2 style={{ color: '#111827', fontSize: "14px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px", borderBottom: "1px solid #d1d5db", paddingBottom: "4px" }}>Professional Summary</h2>
              <p style={{ color: '#1f2937', fontSize: "12px", lineHeight: "1.5", whiteSpace: "pre-wrap" }}>{formValues.summary}</p>
            </div>
          )}

          {/* Experience */}
          {formValues?.experience?.length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <h2 style={{ color: '#111827', fontSize: "14px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px", borderBottom: "1px solid #d1d5db", paddingBottom: "4px" }}>Professional Experience</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {formValues.experience.map((exp, i) => exp && (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "2px" }}>
                      <h3 style={{ color: '#111827', fontWeight: "700", fontSize: "13px" }}>{exp?.company}</h3>
                      <span style={{ color: '#4b5563', fontSize: "12px", fontWeight: "600" }}>
                        {exp?.startDate || "Present"} - {exp?.isCurrent ? "Present" : exp?.endDate || ""}
                      </span>
                    </div>
                    <div style={{ color: '#374151', fontSize: "12px", fontWeight: "600", fontStyle: "italic", marginBottom: "6px" }}>{exp?.title}</div>
                    <div style={{ color: '#1f2937', fontSize: "12px", lineHeight: "1.5", whiteSpace: "pre-wrap", paddingLeft: "12px", borderLeft: "2px solid #e5e7eb" }}>
                      {exp?.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {formValues?.education?.length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <h2 style={{ color: '#111827', fontSize: "14px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px", borderBottom: "1px solid #d1d5db", paddingBottom: "4px" }}>Education</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {formValues.education.map((edu, i) => edu && (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "2px" }}>
                      <h3 style={{ color: '#111827', fontWeight: "700", fontSize: "13px" }}>{edu?.school}</h3>
                      <span style={{ color: '#4b5563', fontSize: "12px", fontWeight: "600" }}>
                        {edu?.startYear} - {edu?.endYear}
                      </span>
                    </div>
                    <div style={{ color: '#374151', fontSize: "12px", fontStyle: "italic" }}>{edu?.degree}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {formValues?.skills && (
            <div style={{ marginBottom: "20px" }}>
              <h2 style={{ color: '#111827', fontSize: "14px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px", borderBottom: "1px solid #d1d5db", paddingBottom: "4px" }}>Technical Skills</h2>
              <p style={{ color: '#1f2937', fontSize: "12px", lineHeight: "1.5", whiteSpace: "pre-wrap" }}>{formValues.skills}</p>
            </div>
          )}

          {/* Projects */}
          {formValues?.projects?.length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <h2 style={{ color: '#111827', fontSize: "14px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px", borderBottom: "1px solid #d1d5db", paddingBottom: "4px" }}>Projects</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {formValues.projects.map((proj, i) => proj && (
                  <div key={i}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "2px" }}>
                      <h3 style={{ color: '#111827', fontWeight: "700", fontSize: "13px" }}>{proj?.name}</h3>
                      {proj?.link && <span style={{ color: '#2563eb', fontSize: "11px" }}>{proj.link}</span>}
                    </div>
                    <div style={{ color: '#1f2937', fontSize: "12px", lineHeight: "1.5", whiteSpace: "pre-wrap" }}>{proj?.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

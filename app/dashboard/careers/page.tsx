"use client";

import React, { useEffect, useState } from "react";
import { Plus, Trash2, FileText, Pencil } from "lucide-react";
import { apiFetch, formatApiError, API_URL } from "../../../lib/apiClient";
import { toast } from "react-toastify";
import Modal from "../components/Modal";
import ArticleEditor from "../components/ArticleEditor";

const STATUSES = ["NEW", "REVIEWING", "SHORTLISTED", "REJECTED", "HIRED"];
const API_BASE = API_URL;

export default function CareersPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [generalApps, setGeneralApps] = useState<any[]>([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [viewApp, setViewApp] = useState<any | null>(null);
  const [viewTitle, setViewTitle] = useState("");
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [descriptionHtml, setDescriptionHtml] = useState("<p></p>");
  const [descFileName, setDescFileName] = useState<string | null>(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [editJob, setEditJob] = useState<any | null>(null);
  const [editDescriptionHtml, setEditDescriptionHtml] = useState("<p></p>");
  const [editDescFileName, setEditDescFileName] = useState<string | null>(null);

  function fetchJobs() {
    apiFetch<any>("/api/jobs")
      .then((res) => setJobs(Array.isArray(res.data) ? res.data : []))
      .catch(() => setJobs([]));
  }

  function fetchApplications(jobId: string) {
    apiFetch<any>(`/api/jobs/${jobId}/applications`)
      .then((res) => setApplications(Array.isArray(res.data) ? res.data : []))
      .catch(() => setApplications([]));
  }

  function fetchGeneralApplications() {
    apiFetch<any>("/api/jobs/general/applications")
      .then((res) => setGeneralApps(Array.isArray(res.data) ? res.data : []))
      .catch(() => setGeneralApps([]));
  }

  useEffect(() => {
    fetchJobs();
    fetchGeneralApplications();
  }, []);

  function handleCreate(form: HTMLFormElement) {
    const fd = new FormData(form);

    // Inject rich-text description HTML from editor state
    fd.delete("description");
    fd.append("description", descriptionHtml);

    // Requirements: send as JSON string (validator will parse it)
    const requirementsRaw = String(fd.get("requirements") || "");
    fd.delete("requirements");
    if (requirementsRaw.trim()) {
      const arr = requirementsRaw.split("\n").map((r) => r.trim()).filter(Boolean);
      fd.append("requirements", JSON.stringify(arr));
    }

    const token = localStorage.getItem("accessToken");
    fetch(`${API_BASE}/api/jobs`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd,
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.message || "Failed to create job");
        }
        return res.json();
      })
      .then(() => {
        setOpenAdd(false);
        setDescriptionHtml("<p></p>");
        setDescFileName(null);
        fetchJobs();
      })
      .catch((err) => toast.error(err.message || "Failed to create job"));
  }

  function openEditModal(job: any) {
    setEditJob(job);
    setEditDescriptionHtml(job.description || "<p></p>");
    setEditDescFileName(job.descriptionFileName || null);
    setOpenEdit(true);
  }

  function handleUpdate(form: HTMLFormElement) {
    if (!editJob) return;
    const fd = new FormData(form);

    fd.delete("description");
    fd.append("description", editDescriptionHtml);

    const requirementsRaw = String(fd.get("requirements") || "");
    fd.delete("requirements");
    if (requirementsRaw.trim()) {
      const arr = requirementsRaw.split("\n").map((r) => r.trim()).filter(Boolean);
      fd.append("requirements", JSON.stringify(arr));
    }

    const token = localStorage.getItem("accessToken");
    fetch(`${API_BASE}/api/jobs/${editJob.id}`, {
      method: "PATCH",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd,
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.message || "Failed to update job");
        }
        return res.json();
      })
      .then(() => {
        setOpenEdit(false);
        setEditJob(null);
        fetchJobs();
        toast.success("Job updated successfully");
      })
      .catch((err) => toast.error(err.message || "Failed to update job"));
  }

  function handleDelete(jobId: string) {
    apiFetch(`/api/jobs/${jobId}`, { method: "DELETE" })
      .then(() => {
        if (selectedJob?.id === jobId) {
          setSelectedJob(null);
          setApplications([]);
        }
        fetchJobs();
      })
      .catch((err) => toast.error(formatApiError(err)));
  }

  function selectJob(job: any) {
    setSelectedJob(job);
    fetchApplications(job.id);
  }

  function updateStatus(appId: string, status: string) {
    apiFetch(`/api/jobs/applications/${appId}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    })
      .then(() => {
        if (selectedJob) fetchApplications(selectedJob.id);
      })
      .catch((err) => toast.error(formatApiError(err)));
  }

  function updateGeneralStatus(appId: string, status: string) {
    apiFetch(`/api/jobs/general/applications/${appId}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    })
      .then(() => fetchGeneralApplications())
      .catch((err) => toast.error(formatApiError(err)));
  }

  function openApplicant(app: any, title: string) {
    setViewApp(app);
    setViewTitle(title);
    setOpenView(true);
  }

  async function downloadFile(path: string, filename?: string | null) {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast.error("You are not logged in.");
        return;
      }
      const res = await fetch(`${API_BASE}${path}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Download failed");
      }
      const dispo = res.headers.get("content-disposition") || "";
      const match = dispo.match(/filename=\"?([^\";]+)\"?/i);
      const headerName = match?.[1];
      const contentType = res.headers.get("content-type") || "";
      let finalName = headerName || filename || "download";
      if (!finalName.includes(".") && contentType.includes("pdf")) finalName += ".pdf";
      if (!finalName.includes(".") && contentType.includes("word")) finalName += ".doc";
      if (!finalName.includes(".") && contentType.includes("officedocument")) finalName += ".docx";
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = finalName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Download failed.");
    }
  }

  return (
    <div className="min-h-screen bg-[#FBFBFB] text-[#0D2323]">
      <main className="p-8 lg:p-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-[2px] bg-[#00A991]" />
                <span className="text-[10px] font-black tracking-[0.3em] text-[#00A991] uppercase">Careers</span>
              </div>
              <h1 className="text-4xl font-black tracking-tight text-[#0D2323] uppercase">Job Openings</h1>
            </div>
            <button
              onClick={() => {
                setDescriptionHtml("<p></p>");
                setDescFileName(null);
                setOpenAdd(true);
              }}
              className="flex items-center gap-2 bg-[#0D2323] text-white px-6 py-3 text-[11px] font-black"
            >
              <Plus size={14} /> Add Job
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8">
            <div className="bg-white border border-[#F2F2F2]">
              {jobs.length === 0 ? (
                <div className="p-10 text-center text-gray-300">No jobs yet</div>
              ) : (
                <ul className="divide-y divide-[#F2F2F2]">
                  {jobs.map((j) => (
                    <li key={j.id} className={`px-6 py-5 flex items-center justify-between ${selectedJob?.id === j.id ? "bg-[#FAFAFA]" : ""}`}>
                      <button onClick={() => selectJob(j)} className="text-left">
                        <div className="text-[12px] font-black">{j.title}</div>
                        <div className="text-[11px] text-gray-400">{j.location || ""} {j.employment ? `• ${j.employment}` : ""}</div>
                        {j.descriptionFileUrl && (
                          <div className="mt-1 flex items-center gap-1 text-[10px] text-[#00A991]">
                            <FileText size={10} />
                            {j.descriptionFileName || "Job Description"}
                          </div>
                        )}
                      </button>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => openEditModal(j)}
                          className="text-gray-300 hover:text-[#00A991]"
                          title="Edit job"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(j.id)}
                          className="text-gray-300 hover:text-red-600"
                          title="Delete job"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bg-white border border-[#F2F2F2] p-6">
              {!selectedJob ? (
                <div className="text-gray-400 text-[11px]">Select a job to view applications.</div>
              ) : (
                <div>
                  <div className="text-[12px] font-black uppercase">Applications</div>
                  <div className="text-[10px] text-gray-400 mb-4">{selectedJob.title}</div>
                  {applications.length === 0 ? (
                    <div className="text-gray-300">No applications yet</div>
                  ) : (
                    <ul className="space-y-4">
                      {applications.map((a) => (
                        <li key={a.id} className="border border-[#F2F2F2] p-4">
                          <div className="text-[12px] font-black">{a.name}</div>
                          <div className="text-[11px] text-gray-400">{a.email} {a.phone ? `• ${a.phone}` : ""}</div>
                          <div className="mt-2 text-[11px] text-gray-500">
                            <button
                              type="button"
                              onClick={() => downloadFile(`/api/jobs/applications/${a.id}/download/resume`, a.resumeName)}
                              className="text-[#00A991]"
                            >
                              Resume
                            </button>
                            {a.supportingUrl && (
                              <span> • <button
                                type="button"
                                onClick={() => downloadFile(`/api/jobs/applications/${a.id}/download/supporting`, a.supportingName)}
                                className="text-[#00A991]"
                              >Supporting Doc</button></span>
                            )}
                          </div>
                          <div className="mt-3 flex items-center gap-2">
                            <span className="text-[10px] font-black tracking-[0.2em] text-gray-400">STATUS</span>
                            <select
                              value={a.status}
                              onChange={(e) => updateStatus(a.id, e.target.value)}
                              className="border border-[#F2F2F2] px-3 py-1 text-[11px] font-bold"
                            >
                              {STATUSES.map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => openApplicant(a, selectedJob.title)}
                              className="ml-auto text-[10px] font-black tracking-[0.2em] text-[#00A991]"
                            >
                              View
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 bg-white border border-[#F2F2F2] p-6">
            <div className="text-[12px] font-black uppercase">General Applications (Send Your CV)</div>
            {generalApps.length === 0 ? (
              <div className="mt-4 text-gray-300">No general applications yet</div>
            ) : (
              <ul className="mt-4 space-y-4">
                {generalApps.map((a) => (
                  <li key={a.id} className="border border-[#F2F2F2] p-4">
                    <div className="text-[12px] font-black">{a.name}</div>
                    <div className="text-[11px] text-gray-400">{a.email} {a.phone ? `• ${a.phone}` : ""}</div>
                    <div className="mt-2 text-[11px] text-gray-500">
                      {a.resumeUrl ? (
                        <button
                          type="button"
                          onClick={() => downloadFile(`/api/jobs/general/applications/${a.id}/download/resume`, a.resumeName)}
                          className="text-[#00A991]"
                        >
                          Resume
                        </button>
                      ) : (
                        <span className="text-gray-400">No resume</span>
                      )}
                      {a.supportingUrl && (
                        <span> • <button
                          type="button"
                          onClick={() => downloadFile(`/api/jobs/general/applications/${a.id}/download/supporting`, a.supportingName)}
                          className="text-[#00A991]"
                        >Supporting Doc</button></span>
                      )}
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-[10px] font-black tracking-[0.2em] text-gray-400">STATUS</span>
                      <select
                        value={a.status}
                        onChange={(e) => updateGeneralStatus(a.id, e.target.value)}
                        className="border border-[#F2F2F2] px-3 py-1 text-[11px] font-bold"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => openApplicant(a, "General Application")}
                        className="ml-auto text-[10px] font-black tracking-[0.2em] text-[#00A991]"
                      >
                        View
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Add Job Modal */}
          <Modal open={openAdd} onClose={() => setOpenAdd(false)} title="Add Job Opening">
            <form
              onSubmit={(e) => { e.preventDefault(); handleCreate(e.currentTarget); }}
              className="space-y-4"
              encType="multipart/form-data"
            >
              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">Title</label>
                <input name="title" required className="w-full border-2 border-[#F2F2F2] px-4 py-3 text-xs font-bold" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">Department</label>
                  <input name="department" className="w-full border-2 border-[#F2F2F2] px-4 py-3 text-xs font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">Location</label>
                  <input name="location" className="w-full border-2 border-[#F2F2F2] px-4 py-3 text-xs font-bold" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">Employment Type</label>
                <input name="employment" className="w-full border-2 border-[#F2F2F2] px-4 py-3 text-xs font-bold" placeholder="Full-time, Contract, etc." />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">Due Date</label>
                <input type="date" name="dueDate" className="w-full border-2 border-[#F2F2F2] px-4 py-3 text-xs font-bold" />
              </div>

              {/* Rich-text description using the same ArticleEditor as news */}
              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">Description</label>
                <ArticleEditor value={descriptionHtml} onChange={setDescriptionHtml} />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">Requirements (one per line)</label>
                <textarea name="requirements" rows={4} className="w-full border-2 border-[#F2F2F2] px-4 py-3 text-xs" />
              </div>

              {/* Job description file upload */}
              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">
                  Job Description File <span className="text-gray-300 font-bold">(PDF or Word — optional, downloadable by applicants)</span>
                </label>
                <input
                  type="file"
                  name="descriptionFile"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setDescFileName(e.target.files?.[0]?.name || null)}
                  className="w-full border-2 border-[#F2F2F2] px-4 py-3 text-xs"
                />
                {descFileName && (
                  <div className="flex items-center gap-2 text-[11px] text-[#00A991]">
                    <FileText size={12} />
                    {descFileName}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-[#F2F2F2]">
                <button type="button" onClick={() => setOpenAdd(false)} className="text-[10px] font-black text-gray-400">Cancel</button>
                <button type="submit" className="bg-[#0D2323] text-white px-8 py-3 text-[10px] font-black">Publish</button>
              </div>
            </form>
          </Modal>

          {/* Edit Job Modal */}
          <Modal open={openEdit} onClose={() => setOpenEdit(false)} title="Edit Job Opening">
            {editJob && (
              <form
                onSubmit={(e) => { e.preventDefault(); handleUpdate(e.currentTarget); }}
                className="space-y-4"
                encType="multipart/form-data"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">Title</label>
                  <input
                    name="title"
                    required
                    defaultValue={editJob.title}
                    className="w-full border-2 border-[#F2F2F2] px-4 py-3 text-xs font-bold"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">Department</label>
                    <input
                      name="department"
                      defaultValue={editJob.department || ""}
                      className="w-full border-2 border-[#F2F2F2] px-4 py-3 text-xs font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">Location</label>
                    <input
                      name="location"
                      defaultValue={editJob.location || ""}
                      className="w-full border-2 border-[#F2F2F2] px-4 py-3 text-xs font-bold"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">Employment Type</label>
                  <input
                    name="employment"
                    defaultValue={editJob.employment || ""}
                    className="w-full border-2 border-[#F2F2F2] px-4 py-3 text-xs font-bold"
                    placeholder="Full-time, Contract, etc."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">Due Date</label>
                    <input
                      type="date"
                      name="dueDate"
                      defaultValue={editJob.dueDate ? editJob.dueDate.slice(0, 10) : ""}
                      className="w-full border-2 border-[#F2F2F2] px-4 py-3 text-xs font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">Status</label>
                    <select
                      name="status"
                      defaultValue={editJob.status || "OPEN"}
                      className="w-full border-2 border-[#F2F2F2] px-4 py-3 text-xs font-bold"
                    >
                      <option value="OPEN">Open</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">Description</label>
                  <ArticleEditor value={editDescriptionHtml} onChange={setEditDescriptionHtml} />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">Requirements (one per line)</label>
                  <textarea
                    name="requirements"
                    rows={4}
                    defaultValue={
                      Array.isArray(editJob.requirements)
                        ? editJob.requirements.join("\n")
                        : ""
                    }
                    className="w-full border-2 border-[#F2F2F2] px-4 py-3 text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">
                    Job Description File <span className="text-gray-300 font-bold">(leave empty to keep existing)</span>
                  </label>
                  {editJob.descriptionFileUrl && !editDescFileName && (
                    <div className="flex items-center gap-2 text-[11px] text-[#00A991] mb-1">
                      <FileText size={12} />
                      Current: {editJob.descriptionFileName || "Job Description"}
                    </div>
                  )}
                  <input
                    type="file"
                    name="descriptionFile"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setEditDescFileName(e.target.files?.[0]?.name || null)}
                    className="w-full border-2 border-[#F2F2F2] px-4 py-3 text-xs"
                  />
                  {editDescFileName && (
                    <div className="flex items-center gap-2 text-[11px] text-[#00A991]">
                      <FileText size={12} />
                      New file: {editDescFileName}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t border-[#F2F2F2]">
                  <button type="button" onClick={() => setOpenEdit(false)} className="text-[10px] font-black text-gray-400">Cancel</button>
                  <button type="submit" className="bg-[#00A991] text-white px-8 py-3 text-[10px] font-black">Save Changes</button>
                </div>
              </form>
            )}
          </Modal>

          {/* Applicant detail Modal */}
          <Modal open={openView} onClose={() => setOpenView(false)} title="Applicant Details">
            {viewApp && (
              <div className="space-y-4 text-[#0D2323]">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00A991]">{viewTitle}</div>
                  <div className="text-[18px] font-black">{viewApp.name}</div>
                  <div className="text-[12px] text-gray-500">{viewApp.email}{viewApp.phone ? ` • ${viewApp.phone}` : ""}</div>
                </div>

                {viewApp.coverLetter && (
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Cover Letter</div>
                    <p className="mt-2 text-[12px] text-gray-600 whitespace-pre-wrap">{viewApp.coverLetter}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[12px]">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">LinkedIn</div>
                    <div className="mt-1 text-gray-600">{viewApp.linkedinUrl || "—"}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Portfolio</div>
                    <div className="mt-1 text-gray-600">{viewApp.portfolioUrl || "—"}</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 text-[11px]">
                  {viewApp.resumeUrl && (
                    <button
                      type="button"
                      onClick={() => downloadFile(`/api/jobs/${viewTitle === "General Application" ? "general/applications" : "applications"}/${viewApp.id}/download/resume`, viewApp.resumeName)}
                      className="bg-[#00A991] !text-[#0D2323] !opacity-100 px-4 py-2 font-black uppercase tracking-[0.2em] inline-flex items-center justify-center"
                    >
                      Download CV
                    </button>
                  )}
                  {viewApp.supportingUrl && (
                    <button
                      type="button"
                      onClick={() => downloadFile(`/api/jobs/${viewTitle === "General Application" ? "general/applications" : "applications"}/${viewApp.id}/download/supporting`, viewApp.supportingName)}
                      className="border border-[#00A991] text-[#00A991] px-4 py-2 font-black uppercase tracking-[0.2em]"
                    >
                      Supporting Doc
                    </button>
                  )}
                </div>
              </div>
            )}
          </Modal>
        </div>
      </main>
    </div>
  );
}

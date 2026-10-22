import { useEffect, useMemo, useRef, useState } from "react";
import { useCategoriesData, useProjectsData } from "../hooks/useApiData";

const PhotoIcon = ({ className = "h-5 w-5" }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="m8 14 2-2 4 4" />
    <path d="m14 12 3-3 4 4" />
    <circle cx="9" cy="9" r="1.5" />
  </svg>
);

const TrashIcon = ({ className = "h-5 w-5" }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 7h16" />
    <path d="M10 11v7" />
    <path d="M14 11v7" />
    <path d="M6 7l1 14h10l1-14" />
    <path d="M9 7V4h6v3" />
  </svg>
);

const SearchIcon = ({ className = "h-5 w-5" }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

function Projects() {
  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [editDraft, setEditDraft] = useState(null);
  const [editImages, setEditImages] = useState([]);
  const [editImageFile, setEditImageFile] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("everzone:navbar-visibility", {
        detail: { hidden: activeProjectId != null },
      })
    );

    return () => {
      window.dispatchEvent(
        new CustomEvent("everzone:navbar-visibility", {
          detail: { hidden: false },
        })
      );
    };
  }, [activeProjectId]);

  const [newDraft, setNewDraft] = useState({
    title: "",
    name: "",
    category_id: "",
    location: "",
    duration: "",
    area: "",
    description: "",
    image: "",
  });

  const {
    projects,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
  } = useProjectsData(true);

  const {
    categories,
    error: categoriesError,
    loading: categoriesLoading,
    fetchCategories,
    createCategory,
  } = useCategoriesData(false);

  const didSeedCategoriesRef = useRef(false);

  const PROJECT_IMAGE_URL = "/guesthouse.jpg";

  const normalizeRemoteImage = (value) =>
    typeof value === "string" && /^https?:\/\//i.test(value) ? value : null;

  useEffect(() => {
    if (newDraft.category_id) return;
    const firstId = categories?.[0]?.id;
    if (!firstId) return;
    setNewDraft((prev) => ({ ...prev, category_id: String(firstId) }));
  }, [categories, newDraft.category_id]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (didSeedCategoriesRef.current) return;
    if (categoriesLoading) return;
    if (categoriesError) return;

    const desired = ["Residential", "Commercial", "Industrial"];
    const existing = new Set(
      (categories ?? [])
        .map((c) => (c?.name ?? "").trim().toLowerCase())
        .filter(Boolean)
    );
    const missing = desired.filter((name) => !existing.has(name.toLowerCase()));

    if (missing.length === 0) {
      didSeedCategoriesRef.current = true;
      return;
    }

    const token = localStorage.getItem("access_token");
    if (!token) return;

    didSeedCategoriesRef.current = true;

    (async () => {
      for (const name of missing) {
        await createCategory({ name, description: null });
      }
      await fetchCategories();
    })();
  }, [categories, categoriesLoading, categoriesError, createCategory, fetchCategories]);

  const categoryTabs = useMemo(() => {
    const names = (categories ?? [])
      .map((c) => c?.name)
      .filter(Boolean);
    return ["All", ...names];
  }, [categories]);

  const showcaseProjects = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return (projects ?? []).filter((project) => {
      if (activeCategory !== "All" && project?.category_name !== activeCategory) {
        return false;
      }

      if (!query) return true;

      return String(project?.name ?? "").toLowerCase().includes(query);
    });
  }, [activeCategory, projects, searchQuery]);

  const fileSummary = useMemo(() => {
    if (files.length === 0) return "";
    if (files.length === 1) return files[0]?.name ?? "";
    return `${files.length} files selected`;
  }, [files]);

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const addFiles = (fileList) => {
    const next = Array.from(fileList ?? []).filter((f) => f && f.type?.startsWith("image/"));
    if (next.length === 0) return;
    setFiles(next);
  };

  const onDrop = (e) => {
    e.preventDefault();
    addFiles(e.dataTransfer?.files);
  };

  const onBrowse = (e) => {
    addFiles(e.target.files);
  };

  const activeProject = useMemo(() => {
    if (!activeProjectId) return null;
    return (projects ?? []).find((p) => p.id === activeProjectId) ?? null;
  }, [activeProjectId, projects]);

  const closeEditProject = () => {
    setActiveProjectId(null);
    setEditDraft(null);
    setEditImageFile(null);
    setShowDeleteModal(false);
    setEditImages([]);
  };

  const openEditProject = (project) => {
    setActiveProjectId(project.id);
    setEditDraft({
      title: project.title ?? "",
      name: project.name ?? "",
      category_id: project.category_id ? String(project.category_id) : "",
      location: project.location ?? "",
      duration: project.duration ?? "",
      area: project.area ?? "",
      description: project.description ?? "",
      image: normalizeRemoteImage(project.image) ?? "",
    });
    const seed = project.image || PROJECT_IMAGE_URL;
    setEditImages([seed, seed, seed, seed]);
  };

  const openEditFilePicker = () => {
    editFileInputRef.current?.click();
  };

  const addEditImages = (fileList) => {
    const nextFiles = Array.from(fileList ?? []).filter((f) => f && f.type?.startsWith("image/"));
    if (nextFiles.length === 0) return;

    // Store the first file for uploading
    setEditImageFile(nextFiles[0]);

    const urls = nextFiles.map((f) => URL.createObjectURL(f));
    setEditImages((prev) => {
      const merged = [...urls, ...prev].slice(0, 4);
      return merged;
    });
  };

  const onEditDrop = (e) => {
    e.preventDefault();
    addEditImages(e.dataTransfer?.files);
  };

  const onEditBrowse = (e) => {
    addEditImages(e.target.files);
  };

  const resetCreateForm = () => {
    setFiles([]);
    setNewDraft((prev) => ({
      ...prev,
      title: "",
      name: "",
      location: "",
      duration: "",
      area: "",
      description: "",
      image: "",
    }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const canCreate =
    newDraft.title.trim() &&
    newDraft.name.trim() &&
    String(newDraft.category_id || "").trim() &&
    newDraft.description.trim();

  const handleCreate = async () => {
    if (!canCreate) return;
    const categoryId = Number.parseInt(newDraft.category_id, 10);
    if (!Number.isFinite(categoryId) || categoryId <= 0) return;

    setActionLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', newDraft.name.trim());
      formData.append('title', newDraft.title.trim());
      formData.append('category_id', categoryId);
      formData.append('location', newDraft.location.trim() || '');
      formData.append('duration', newDraft.duration.trim() || '');
      formData.append('area', newDraft.area.trim() || '');
      formData.append('description', newDraft.description.trim());
      
      // Add file if one was selected, otherwise add URL
      if (files.length > 0) {
        formData.append('image', files[0]);
      } else if (newDraft.image.trim()) {
        formData.append('image', newDraft.image.trim());
      }

      const result = await createProject(formData);

      if (result?.success) {
        resetCreateForm();
        await fetchProjects();
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleSave = async () => {
    if (!activeProjectId || !editDraft) return;
    const categoryId = Number.parseInt(editDraft.category_id, 10);
    if (!Number.isFinite(categoryId) || categoryId <= 0) return;

    setActionLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', (editDraft.name ?? "").trim());
      formData.append('title', (editDraft.title ?? "").trim());
      formData.append('category_id', categoryId);
      formData.append('location', (editDraft.location ?? "").trim() || '');
      formData.append('duration', (editDraft.duration ?? "").trim() || '');
      formData.append('area', (editDraft.area ?? "").trim() || '');
      formData.append('description', (editDraft.description ?? "").trim());
      
      // Add file if one was selected, otherwise add existing image
      if (editImageFile) {
        formData.append('image', editImageFile);
      } else if (editDraft.image) {
        formData.append('image', (editDraft.image ?? "").trim());
      }

      const result = await updateProject(activeProjectId, formData);

      if (result?.success) {
        await fetchProjects();
        closeEditProject();
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!activeProjectId) return;

    setActionLoading(true);
    try {
      const result = await deleteProject(activeProjectId);
      if (result?.success) {
        await fetchProjects();
        closeEditProject();
      }
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="relative left-1/2 right-1/2 w-screen -ml-[50vw] -mr-[50vw] min-h-screen bg-white pb-8">
      <div aria-hidden="true" className="h-[54px] w-full bg-[#2c6480]" />

      <div className="relative z-10 mx-auto -mt-6 w-full">
        <div className="w-full overflow-hidden rounded-t-[44px] bg-white">
          <div className="w-full px-8 py-10 sm:px-14 lg:px-20">
            <h1 className="text-3xl font-semibold text-slate-800 sm:text-4xl">
              Projects Management
            </h1>

            <h2 className="mt-10 text-xl font-semibold text-slate-600">Upload New Project</h2>

            <section className="mt-4 rounded-2xl bg-slate-50 p-6">
              

          <div className="mt-4 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
            {/* Left: form fields */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-slate-600">
                  Project title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter title of the project"
                  value={newDraft.title}
                  onChange={(e) => setNewDraft((prev) => ({ ...prev, title: e.target.value }))}
                  required
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-base text-slate-700 focus:border-slate-300 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-600">
                  Owner Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter owner's name"
                  value={newDraft.name}
                  onChange={(e) => setNewDraft((prev) => ({ ...prev, name: e.target.value }))}
                  required
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-base text-slate-700 focus:border-slate-300 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-600">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={newDraft.category_id}
                  onChange={(e) => setNewDraft((prev) => ({ ...prev, category_id: e.target.value }))}
                  required
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-base text-slate-700 focus:border-slate-300 focus:outline-none"
                >
                  {(categories ?? []).length ? (
                    (categories ?? []).map((c) => (
                      <option key={c.id} value={String(c.id)}>
                        {c.name}
                      </option>
                    ))
                  ) : (
                    <option value="">No categories</option>
                  )}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-600">Location</label>
                <input
                  type="text"
                  placeholder="Enter project location"
                  value={newDraft.location}
                  onChange={(e) => setNewDraft((prev) => ({ ...prev, location: e.target.value }))}
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-base text-slate-700 focus:border-slate-300 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-600">Project Duration</label>
                <input
                  type="text"
                  placeholder="e.g. 1 Jan 2025 to 31 Dec 2025"
                  value={newDraft.duration}
                  onChange={(e) => setNewDraft((prev) => ({ ...prev, duration: e.target.value }))}
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-base text-slate-700 focus:border-slate-300 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-600">Area</label>
                <input
                  type="text"
                  placeholder="e.g. 500 square meters"
                  value={newDraft.area}
                  onChange={(e) => setNewDraft((prev) => ({ ...prev, area: e.target.value }))}
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-base text-slate-700 focus:border-slate-300 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-sm font-semibold text-slate-600">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Enter description of the project"
                  value={newDraft.description}
                  onChange={(e) => setNewDraft((prev) => ({ ...prev, description: e.target.value }))}
                  required
                  className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-3 text-base text-slate-700 focus:border-slate-300 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-sm font-semibold text-slate-600">Project Image URL (optional)</label>
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={newDraft.image}
                  onChange={(e) => setNewDraft((prev) => ({ ...prev, image: e.target.value }))}
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-base text-slate-700 focus:border-slate-300 focus:outline-none"
                />
              </div>

              {(error || categoriesError) ? (
                <div className="sm:col-span-2 rounded-md bg-red-50 p-4">
                  <div className="text-sm text-red-700">{error || categoriesError}</div>
                </div>
              ) : null}
            </div>

            {/* Right: upload */}
            <div className="space-y-4">
              <div
                role="button"
                tabIndex={0}
                onClick={openFilePicker}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") openFilePicker();
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDrop}
                className="flex min-h-[300px] items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-white px-6 sm:min-h-[360px] lg:min-h-[420px]"
                aria-label="Upload project photos"
              >
                <div className="flex flex-col items-center gap-2 text-center text-sm text-slate-400">
                  <span className="grid h-12 w-12 place-items-center text-slate-400 mb-10 mr-10 ">
                    <PhotoIcon className="h-20 w-20" />
                  </span> 
                  <p className="text-sm text-slate-400">
                    Drag and drop your images here or{" "}
                    <button
                      type="button"
                      onClick={openFilePicker}
                      className="inline text-[#7ac943] underline"
                    >
                      browse
                    </button>
                  </p>
                  {fileSummary ? (
                    <p className="mt-2 max-w-[28ch] truncate text-[11px] text-slate-500">
                      {fileSummary}
                    </p>
                  ) : null}
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={onBrowse}
              />

              <button
                type="button"
                onClick={handleCreate}
                disabled={actionLoading || !canCreate || !(categories ?? []).length}
                className="group flex w-full items-stretch overflow-hidden rounded-full border border-[#1f4f64] bg-[#2c6480] shadow-sm transition hover:bg-[#2a5f79] disabled:cursor-not-allowed disabled:opacity-60 disabled:pointer-events-none"
              >
                <span className="flex-1 py-4 text-center text-base font-semibold text-white transition group-hover:text-[#8dcf22]">
                  {actionLoading ? "Uploading..." : "Upload Project"}
                </span>
              </button>
            </div>
          </div>
          </section>

            {/* Projects showcase / preview */}
            <section className="mt-10">
              <div className="flex items-baseline gap-3 text-slate-700">
                <span className="text-4xl font-semibold tracking-tight">{projects.length}</span>
                <span className="text-[22px] font-normal text-slate-500">Projects</span>
              </div>

              <div className="mt-6 flex flex-col gap-4 xl:flex-row xl:flex-nowrap xl:items-center xl:gap-5">
                <label className="flex h-[42px] w-full items-center rounded-full border border-slate-300 bg-white px-4 text-slate-400 shadow-[0_1px_2px_rgba(15,23,42,0.04)] xl:w-[700px] xl:flex-none">
                  <SearchIcon className="h-5 w-5 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Project by name"
                    className="w-full bg-transparent px-3 text-[15px] text-slate-600 placeholder:text-slate-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className={[
                      "text-[18px] leading-none text-slate-400 transition hover:text-slate-600",
                      searchQuery ? "opacity-100" : "pointer-events-none opacity-0",
                    ].join(" ")}
                    aria-label="Clear project search"
                  >
                    X
                  </button>
                </label>

                <div className="flex flex-wrap gap-4 xl:flex-none">
                {categoryTabs.map((tab) => {
                  const active = tab === activeCategory;
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveCategory(tab)}
                      className={
                        active
                          ? "rounded-full bg-[#8fd11f] px-8 py-3 text-sm font-semibold text-slate-900 shadow-[0_4px_12px_rgba(143,209,31,0.18)]"
                          : "rounded-full border border-slate-300 bg-white px-8 py-3 text-sm font-medium text-slate-500"
                      }
                    >
                      {tab}
                    </button>
                  );
                })}
                </div>
              </div>

              <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {showcaseProjects.map((p) => (
                  <article
                    key={p.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                  >
                    <div className="bg-slate-100">
                      <img
                        src={p.image || PROJECT_IMAGE_URL}
                        alt={p.title}
                        className="aspect-[4/3] w-full object-cover"
                        loading="lazy"
                        draggable={false}
                      />
                    </div>

                    <div className="flex items-center justify-between gap-4 px-6 py-5">
                      <div className="min-w-0">
                        <h3 className="truncate text-lg font-semibold text-slate-800">{p.title}</h3>
                        <p className="mt-1 truncate text-sm text-slate-400">{p.name}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => openEditProject(p)}
                        className="shrink-0 rounded-full bg-[#2c6480] px-10 py-3 text-sm font-semibold text-white"
                      >
                        Edit
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {activeProject && editDraft ? (
              <div className="fixed inset-0 z-[80]">
                <button
                  type="button"
                  className="absolute inset-0 bg-black/40"
                  aria-label="Close project editor"
                  onClick={closeEditProject}
                />

                <aside className="absolute right-0 top-0 h-full w-full max-w-[760px] bg-white shadow-2xl">
                  <div className="flex h-full flex-col">
                    <div className="flex items-start justify-between gap-4 px-10 py-8">
                      <h3 className="text-4xl font-semibold tracking-tight text-slate-700">
                        Edit Project
                      </h3>

                      <button
                        type="button"
                        onClick={closeEditProject}
                        aria-label="Close"
                        className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-xl text-slate-700"
                      >
                        ×
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-10 pb-10">
                      {/* Images */}
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={openEditFilePicker}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") openEditFilePicker();
                        }}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={onEditDrop}
                        className="rounded-2xl border-2 border-dashed border-slate-200 p-6"
                        aria-label="Edit project images"
                      >
                        <div className="flex flex-wrap items-start justify-center gap-5">
                          {(editImages.length ? editImages : [PROJECT_IMAGE_URL, PROJECT_IMAGE_URL, PROJECT_IMAGE_URL, PROJECT_IMAGE_URL]).map(
                            (src, idx) => (
                              <div
                                key={`${src}-${idx}`}
                                className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
                              >
                                <img
                                  src={src}
                                  alt=""
                                  className="h-[78px] w-[120px] object-cover"
                                  loading="lazy"
                                  draggable={false}
                                />
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditImages((prev) => prev.filter((_, i) => i !== idx));
                                  }}
                                  className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-white/90 text-sm font-semibold text-slate-600 shadow"
                                  aria-label="Remove image"
                                >
                                  ×
                                </button>
                              </div>
                            )
                          )}
                        </div>

                        <div className="mt-6 text-center text-sm text-slate-500">
                          Drag and drop to change your image here or{" "}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditFilePicker();
                            }}
                            className="text-[#7ac943]"
                          >
                            browse
                          </button>
                        </div>
                      </div>

                      <input
                        ref={editFileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={onEditBrowse}
                      />

                      {/* Form */}
                      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                          <label className="text-sm font-semibold text-slate-600">Project title</label>
                          <input
                            type="text"
                            value={editDraft.title}
                            onChange={(e) =>
                              setEditDraft((prev) => ({ ...prev, title: e.target.value }))
                            }
                            className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-base text-slate-700 focus:border-slate-300 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-semibold text-slate-600">Owner Name</label>
                          <input
                            type="text"
                            value={editDraft.name}
                            onChange={(e) =>
                              setEditDraft((prev) => ({ ...prev, name: e.target.value }))
                            }
                            className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-base text-slate-700 focus:border-slate-300 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-semibold text-slate-600">Category</label>
                          <select
                            value={editDraft.category_id}
                            onChange={(e) =>
                              setEditDraft((prev) => ({ ...prev, category_id: e.target.value }))
                            }
                            className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-base text-slate-700 focus:border-slate-300 focus:outline-none"
                          >
                            {(categories ?? []).length ? (
                              (categories ?? []).map((c) => (
                                <option key={c.id} value={String(c.id)}>
                                  {c.name}
                                </option>
                              ))
                            ) : (
                              <option value="">No categories</option>
                            )}
                          </select>
                        </div>

                        <div>
                          <label className="text-sm font-semibold text-slate-600">Location</label>
                          <input
                            type="text"
                            value={editDraft.location}
                            onChange={(e) =>
                              setEditDraft((prev) => ({ ...prev, location: e.target.value }))
                            }
                            className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-base text-slate-700 focus:border-slate-300 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-semibold text-slate-600">Project Duration</label>
                          <input
                            type="text"
                            value={editDraft.duration}
                            onChange={(e) =>
                              setEditDraft((prev) => ({ ...prev, duration: e.target.value }))
                            }
                            className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-base text-slate-700 focus:border-slate-300 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-semibold text-slate-600">Area</label>
                          <input
                            type="text"
                            value={editDraft.area}
                            onChange={(e) =>
                              setEditDraft((prev) => ({ ...prev, area: e.target.value }))
                            }
                            className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-base text-slate-700 focus:border-slate-300 focus:outline-none"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="text-sm font-semibold text-slate-600">Description</label>
                          <textarea
                            rows={5}
                            value={editDraft.description}
                            onChange={(e) =>
                              setEditDraft((prev) => ({ ...prev, description: e.target.value }))
                            }
                            className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-3 text-base text-slate-700 focus:border-slate-300 focus:outline-none"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="text-sm font-semibold text-slate-600">
                            Project Image URL (optional)
                          </label>
                          <input
                            type="url"
                            placeholder="https://example.com/image.jpg"
                            value={editDraft.image}
                            onChange={(e) =>
                              setEditDraft((prev) => ({ ...prev, image: e.target.value }))
                            }
                            className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-base text-slate-700 focus:border-slate-300 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 border-t border-slate-100 px-10 py-8">
                      <button
                        type="button"
                        className="inline-flex items-center gap-3 rounded-full border border-[#ff7f79] bg-[#fff3f2] px-6 py-3 text-sm font-semibold text-[#ff6b63] transition hover:bg-[#ffe8e5] disabled:pointer-events-none disabled:opacity-60"
                        onClick={() => setShowDeleteModal(true)}
                        disabled={actionLoading}
                      >
                        <TrashIcon className="h-5 w-5" />
                        Delete Project
                      </button>

                      <button
                        type="button"
                        className="rounded-full bg-[#2c6480] px-10 py-3 text-sm font-semibold text-white"
                        onClick={handleSave}
                        disabled={actionLoading}
                      >
                        {actionLoading ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </div>
                </aside>

                {showDeleteModal ? (
                  <div className="absolute inset-0 z-[90] flex items-center justify-center bg-black/85 px-4">
                    <button
                      type="button"
                      className="absolute inset-0"
                      aria-label="Close delete confirmation"
                      onClick={() => setShowDeleteModal(false)}
                    />

                    <div className="relative w-full max-w-[424px] rounded-2xl bg-white px-10 py-9 shadow-2xl">
                      <h2 className="text-[30px] font-semibold tracking-tight text-slate-700">
                        Confirm Delete
                      </h2>

                      <div className="mt-9 space-y-2 text-[17px] leading-8 text-slate-500">
                        <p>Are you sure you want to delete this?</p>
                        <p>This cannot be undone.</p>
                      </div>

                      <div className="mt-10 flex items-center justify-center gap-4">
                        <button
                          type="button"
                          onClick={() => setShowDeleteModal(false)}
                          className="min-w-[142px] rounded-full border border-slate-200 bg-white px-8 py-4 text-[17px] font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-700"
                        >
                          Cancel
                        </button>

                        <button
                          type="button"
                          onClick={handleDelete}
                          disabled={actionLoading}
                          className="inline-flex min-w-[142px] items-center justify-center gap-2 rounded-full border border-[#ff7f79] bg-[#fff3f2] px-8 py-4 text-[17px] font-semibold text-[#ff6b63] transition hover:bg-[#ffe8e5] disabled:pointer-events-none disabled:opacity-60"
                        >
                          <TrashIcon className="h-5 w-5" />
                          {actionLoading ? "Deleting..." : "Yes"}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Projects;
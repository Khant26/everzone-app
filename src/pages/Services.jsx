import { useEffect, useMemo, useRef, useState } from "react";
import { useServicesData } from "../hooks/useApiData";

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

function Services() {
  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [activeServiceId, setActiveServiceId] = useState(null);
  const [editDraft, setEditDraft] = useState(null);
  const [editImages, setEditImages] = useState([]);
  const [editImageFile, setEditImageFile] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("everzone:navbar-visibility", {
        detail: { hidden: activeServiceId != null },
      })
    );

    return () => {
      window.dispatchEvent(
        new CustomEvent("everzone:navbar-visibility", {
          detail: { hidden: false },
        })
      );
    };
  }, [activeServiceId]);

  const {
    services,
    error,
    fetchServices,
    createService,
    updateService,
    deleteService,
  } = useServicesData(true);

  const SERVICE_IMAGE_URL = "/services_placeholder.jpg";

  const fileSummary = useMemo(() => {
    if (files.length === 0) return "";
    if (files.length === 1) return files[0]?.name ?? "";
    return `${files.length} files selected`;
  }, [files]);

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const openEditFilePicker = () => {
    editFileInputRef.current?.click();
  };

  const normalizeRemoteImage = (value) =>
    typeof value === "string" && /^https?:\/\//i.test(value) ? value : null;

  const addFiles = (fileList) => {
    const next = Array.from(fileList ?? []).filter((f) => f && f.type?.startsWith("image/"));
    if (next.length === 0) return;
    setFiles(next);
  };

  const addEditImages = (fileList) => {
    const nextFiles = Array.from(fileList ?? []).filter((f) => f && f.type?.startsWith("image/"));
    if (nextFiles.length === 0) return;

    const file = nextFiles[0];
    const url = URL.createObjectURL(file);
    setEditImageFile(file);
    setEditImages((prev) => {
      prev.forEach((src) => {
        if (typeof src === "string" && src.startsWith("blob:")) URL.revokeObjectURL(src);
      });
      return [url];
    });
  };

  const onDrop = (e) => {
    e.preventDefault();
    addFiles(e.dataTransfer?.files);
  };

  const onBrowse = (e) => {
    addFiles(e.target.files);
  };

  const activeService = useMemo(() => {
    if (!activeServiceId) return null;
    return services.find((s) => s.id === activeServiceId) ?? null;
  }, [activeServiceId, services]);

  const filteredServices = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return services;

    return services.filter((service) => {
      const haystack = [service?.title, service?.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [searchQuery, services]);

  const closeEditService = () => {
    setActiveServiceId(null);
    setEditDraft(null);
    setEditImageFile(null);
    setShowDeleteModal(false);
    setEditImages((prev) => {
      prev.forEach((src) => {
        if (typeof src === "string" && src.startsWith("blob:")) URL.revokeObjectURL(src);
      });
      return [];
    });
  };

  const openEditService = (service) => {
    setActiveServiceId(service.id);
    setEditDraft({
      title: service.title ?? "",
      description: service.description ?? "",
      image: normalizeRemoteImage(service.image),
    });
    setEditImages([service.image || SERVICE_IMAGE_URL]);
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
    setNewTitle("");
    setNewDescription("");
    setNewImageUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCreate = async () => {
    const title = newTitle.trim();
    const description = newDescription.trim();
    if (!title || !description) return;

    setActionLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      
      // Add file if one was selected, otherwise add URL
      if (files.length > 0) {
        formData.append('image', files[0]);
      } else if (newImageUrl.trim()) {
        formData.append('image', newImageUrl.trim());
      }

      const result = await createService(formData);

      if (result?.success) {
        resetCreateForm();
        await fetchServices();
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleSave = async () => {
    if (!activeServiceId || !editDraft) return;
    const title = (editDraft.title ?? "").trim();
    const description = (editDraft.description ?? "").trim();
    if (!title || !description) return;

    setActionLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      
      // Add file if one was selected, otherwise add existing image
      if (editImageFile) {
        formData.append('image', editImageFile);
      } else if (editDraft.image) {
        formData.append('image', editDraft.image);
      }

      const result = await updateService(activeServiceId, formData);

      if (result?.success) {
        await fetchServices();
        closeEditService();
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!activeServiceId) return;

    setActionLoading(true);
    try {
      const result = await deleteService(activeServiceId);
      if (result?.success) {
        await fetchServices();
        closeEditService();
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
            <h1 className="text-3xl font-semibold text-slate-800 sm:text-4xl">Service Management</h1>

            <h2 className="mt-10 text-xl font-semibold text-slate-600">Upload New Service</h2>

            <section className="mt-4 rounded-2xl bg-slate-50 p-6">
              <div className="mt-4 grid gap-6 lg:grid-cols-[1.3fr_2fr]">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={openFilePicker}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") openFilePicker();
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={onDrop}
                  className="flex h-60 items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-white"
                  aria-label="Upload service photo"
                >
                  <div className="flex flex-col items-center gap-2 text-center text-xs text-slate-400">
                    <span className="grid h-10 w-10 mb-5 mr-10 place-items-center text-slate-400">
                      <PhotoIcon className="h-15 w-15" />
                    </span>

                    <div className="mt-6 text-center text-sm text-slate-500">
                      Drag and drop your image here or{" "}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openFilePicker();
                        }}
                        className="text-[#7ac943]"
                      >
                        browse
                      </button>
                    </div>
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

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600">
                      Service Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter title of the service"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      required
                      className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:border-slate-300 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600">
                      Service Description <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your service Description"
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      required
                      className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:border-slate-300 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600">Service Image URL (optional)</label>
                    <input
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:border-slate-300 focus:outline-none"
                    />
                  </div>

                  {error ? (
                    <div className="rounded-md bg-red-50 p-4">
                      <div className="text-sm text-red-700">{error}</div>
                    </div>
                  ) : null}

                  <div className="flex justify-center lg:justify-end">
                    <button
                      type="button"
                      onClick={handleCreate}
                      disabled={actionLoading || !newTitle.trim() || !newDescription.trim()}
                      className="group w-full max-w-[540px] rounded-full bg-[#1f4f64] p-[2px] shadow-sm transition hover:bg-[#234f66] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <span className="flex w-full items-stretch overflow-hidden rounded-full bg-[#2c6480] transition group-hover:bg-[#2a5f79]">
                        <span className="flex-1 py-4 text-center text-base font-semibold text-white transition group-hover:text-[#8dcf22]">
                          {actionLoading ? "Uploading..." : "Upload Service"}
                        </span>                     
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <div className="mt-10 flex items-baseline gap-3 text-slate-700">
              <span className="text-4xl font-semibold tracking-tight">{services.length}</span>
              <span className="text-[22px] font-normal text-slate-500">Services</span>
            </div>

            <div className="mt-6 flex flex-col gap-4 xl:flex-row xl:flex-nowrap xl:items-center xl:gap-5">
              <label className="flex h-[42px] w-full items-center rounded-full border border-slate-300 bg-white px-4 text-slate-400 shadow-[0_1px_2px_rgba(15,23,42,0.04)] xl:w-[700px] xl:flex-none">
                <SearchIcon className="h-5 w-5 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Service by name"
                  className="w-full bg-transparent px-3 text-[15px] text-slate-600 placeholder:text-slate-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className={[
                    "text-[18px] leading-none text-slate-400 transition hover:text-slate-600",
                    searchQuery ? "opacity-100" : "pointer-events-none opacity-0",
                  ].join(" ")}
                  aria-label="Clear service search"
                >
                  X
                </button>
              </label>
            </div>

            <section className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {filteredServices.map((svc) => (
                <article
                  key={svc.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="bg-slate-100">
                    <img
                      src={svc.image || SERVICE_IMAGE_URL}
                      alt={svc.title}
                      className="aspect-[4/3] w-full object-cover"
                      loading="lazy"
                      draggable={false}
                    />
                  </div>

                  <div className="flex h-full flex-col px-6 py-6">
                    <h3 className="text-xl font-semibold text-slate-800">{svc.title}</h3>
                    <p className="mt-4 text-[15px] leading-7 text-slate-600">
                      {svc.description}
                    </p>

                    <div className="mt-8 flex justify-end">
                      <button
                        type="button"
                        onClick={() => openEditService(svc)}
                        className="rounded-full bg-[#2c6480] px-12 py-4 text-sm font-semibold text-white"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </section>

            {activeService && editDraft ? (
              <div className="fixed inset-0 z-[80]">
                <button
                  type="button"
                  className="absolute inset-0 bg-black/40"
                  aria-label="Close service editor"
                  onClick={closeEditService}
                />

                <aside className="absolute right-0 top-0 h-full w-full max-w-[760px] bg-white shadow-2xl">
                  <div className="flex h-full flex-col">
                    <div className="flex items-start justify-between gap-4 px-10 py-8">
                      <h3 className="text-4xl font-semibold tracking-tight text-slate-700">
                        Edit Service
                      </h3>

                      <button
                        type="button"
                        onClick={closeEditService}
                        aria-label="Close"
                        className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-xl text-slate-700"
                      >
                        ×
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-10 pb-10">
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
                        aria-label="Edit service image"
                      >
                        <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                          <img
                            src={(editImages[0] ?? editDraft.image ?? SERVICE_IMAGE_URL)}
                            alt=""
                            className="h-[180px] w-full object-cover"
                            loading="lazy"
                            draggable={false}
                          />

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditImages((prev) => {
                                prev.forEach((src) => {
                                  if (typeof src === "string" && src.startsWith("blob:")) URL.revokeObjectURL(src);
                                });
                                return [];
                              });
                              setEditDraft((prev) => ({ ...(prev ?? {}), image: null }));
                            }}
                            className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-white/90 text-sm font-semibold text-slate-600 shadow"
                            aria-label="Remove image"
                          >
                            ×
                          </button>
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
                        className="hidden"
                        onChange={onEditBrowse}
                      />

                      <div className="mt-10 space-y-6">
                        <div>
                          <label className="text-sm font-semibold text-slate-600">Service Title</label>
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
                          <label className="text-sm font-semibold text-slate-600">Service Description</label>
                          <textarea
                            rows={6}
                            value={editDraft.description}
                            onChange={(e) =>
                              setEditDraft((prev) => ({ ...prev, description: e.target.value }))
                            }
                            className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-3 text-base text-slate-700 focus:border-slate-300 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-semibold text-slate-600">Service Image URL (optional)</label>
                          <input
                            type="url"
                            value={editDraft.image ?? ""}
                            onChange={(e) => {
                              const next = e.target.value;
                              setEditDraft((prev) => ({
                                ...prev,
                                image: normalizeRemoteImage(next.trim()),
                              }));
                              setEditImages((prev) => {
                                prev.forEach((src) => {
                                  if (typeof src === "string" && src.startsWith("blob:")) URL.revokeObjectURL(src);
                                });
                                return [];
                              });
                            }}
                            placeholder="https://example.com/image.jpg"
                            className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-base text-slate-700 focus:border-slate-300 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 border-t border-slate-100 px-10 py-8">
                      <button
                        type="button"
                        onClick={() => setShowDeleteModal(true)}
                        disabled={actionLoading}
                        className="inline-flex items-center gap-3 rounded-full border border-[#ff7f79] bg-[#fff3f2] px-6 py-3 text-sm font-semibold text-[#ff6b63] transition hover:bg-[#ffe8e5] disabled:pointer-events-none disabled:opacity-60"
                      >
                        <TrashIcon className="h-5 w-5" />
                        Delete Service
                      </button>

                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={actionLoading}
                        className="rounded-full bg-[#2c6480] px-10 py-3 text-sm font-semibold text-white"
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

export default Services;
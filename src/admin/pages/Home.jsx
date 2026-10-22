import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useContactFormsData, useProjectsData, useServicesData } from "../hooks/useApiData";

const STARRED_INQUIRIES_STORAGE_KEY = "everzone_admin_starred_inquiries";

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const readStarredInquiryIds = () => {
  if (typeof window === "undefined") return new Set();

  try {
    const rawValue = window.localStorage.getItem(STARRED_INQUIRIES_STORAGE_KEY);
    if (!rawValue) return new Set();
    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.map((value) => String(value)));
  } catch {
    return new Set();
  }
};

const writeStarredInquiryIds = (ids) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    STARRED_INQUIRIES_STORAGE_KEY,
    JSON.stringify(Array.from(ids))
  );
};

const StarIcon = ({ filled = false, className = "h-4 w-4" }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 20 20"
    className={className}
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth={filled ? undefined : "1.7"}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m10 2.7 2.273 4.606 5.083.739-3.678 3.585.868 5.062L10 14.298 5.454 16.692l.868-5.062-3.678-3.585 5.083-.739L10 2.702Z" />
  </svg>
);

const SearchIcon = ({ className = "h-4 w-4" }) => (
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

const CalendarIcon = ({ className = "h-4 w-4" }) => (
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
    <path d="M8 3v3" />
    <path d="M16 3v3" />
    <path d="M4 9h16" />
    <rect x="4" y="5" width="16" height="15" rx="2" />
  </svg>
);

const ChevronDownIcon = ({ className = "h-4 w-4" }) => (
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
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const normalizeContactForm = (form) => {
  const status = String(form?.status ?? "pending").toLowerCase();

  return {
    id: form.id,
    name: form.name ?? "Unknown",
    email: form.email ?? "-",
    phone: form.phone || "-",
    subject: form.subject?.trim() || `Inquiry from ${form.name ?? "Unknown"}`,
    message: form.message ?? "",
    receivedAt: form.time || form.created_at || new Date().toISOString(),
    starred: false,
    read: status !== "pending",
    status,
  };
};

const getStatusForReadState = (nextRead, previousStatus) => {
  if (!nextRead) return "pending";
  return previousStatus === "responded" || previousStatus === "archived"
    ? previousStatus
    : "reviewed";
};

function Home() {
  const navigate = useNavigate();
  const [currentTime] = useState(Date.now);
  const { contactForms, loading, error, updateStatus } = useContactFormsData();
  const { services } = useServicesData();
  const { projects } = useProjectsData();
  const [inquiry, setInquiry] = useState([]);
  const [filter, setFilter] = useState("All");
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const [activeInquiryId, setActiveInquiryId] = useState(null);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("everzone:navbar-visibility", {
        detail: { hidden: activeInquiryId != null },
      })
    );

    return () => {
      window.dispatchEvent(
        new CustomEvent("everzone:navbar-visibility", {
          detail: { hidden: false },
        })
      );
    };
  }, [activeInquiryId]);

  useEffect(() => {
    const starredIds = readStarredInquiryIds();
    // This local editable view intentionally synchronizes with newly fetched API data.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInquiry(
      (contactForms || []).map((form) => {
        const normalized = normalizeContactForm(form);
        return {
          ...normalized,
          starred: starredIds.has(String(normalized.id)),
        };
      })
    );
  }, [contactForms]);

  const monthOptions = useMemo(() => {
    const seen = new Set();

    return inquiry
      .map((item) => new Date(item.receivedAt))
      .filter((date) => !Number.isNaN(date.getTime()))
      .sort((left, right) => right.getTime() - left.getTime())
      .map((date) => {
        const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        const label = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
        return { value, label };
      })
      .filter((option) => {
        if (seen.has(option.value)) return false;
        seen.add(option.value);
        return true;
      });
  }, [inquiry]);

  const filteredInquiries = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return inquiry.filter((item) => {
      if (filter === "Read") return item.read;
      if (filter === "Unread") return !item.read;
      if (showStarredOnly && !item.starred) return false;
      if (selectedMonth !== "all") {
        const date = new Date(item.receivedAt);
        const itemMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        if (itemMonth !== selectedMonth) return false;
      }
      if (!query) return true;

      const haystack = [item.name, item.email, item.phone, item.subject, item.message]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [filter, inquiry, searchQuery, selectedMonth, showStarredOnly]);

  const totalPages = Math.max(1, Math.ceil(filteredInquiries.length / pageSize));

  const currentPage = Math.min(page, totalPages);
  const pagedInquiries = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredInquiries.slice(start, start + pageSize);
  }, [currentPage, filteredInquiries]);

  const formatTableDateParts = (value) => {
    const date = new Date(value);
    const dd = String(date.getDate()).padStart(2, "0");
    const month = monthNames[date.getMonth()] ?? "";
    const yyyy = date.getFullYear();
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    const period = date.getHours() >= 12 ? "PM" : "AM";

    return {
      dateTimeLine: `${dd} ${month} ${yyyy} ${hh}:${min} ${period}`.toUpperCase(),
    };
  };

  const formatRelativeTime = (value) => {
    const diff = currentTime - new Date(value).getTime();
    const formatUnit = (amount, unit) => {
      const safeAmount = Math.max(1, amount);
      return `${safeAmount} ${unit}${safeAmount === 1 ? "" : "s"} ago`;
    };

    const minutes = Math.max(1, Math.round(diff / 60000));
    if (minutes < 60) return formatUnit(minutes, "minute");
    const hours = Math.round(minutes / 60);
    if (hours < 24) return formatUnit(hours, "hour");
    const days = Math.round(hours / 24);
    if (days < 30) return formatUnit(days, "day");
    const months = Math.round(days / 30);
    if (months < 12) return formatUnit(months, "month");
    const years = Math.round(months / 12);
    return formatUnit(years, "year");
  };

  const formatDetailDateParts = (value) => {
    const date = new Date(value);
    const day = String(date.getDate()).padStart(2, "0");
    const month = monthNames[date.getMonth()] ?? "";
    const year = date.getFullYear();
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    const period = date.getHours() >= 12 ? "PM" : "AM";

    return {
      dateTimeLine: `${day} ${month} ${year} ${hh}:${min} ${period}`.toUpperCase(),
    };
  };

  const setFilterAndResetPage = (value) => {
    setFilter(value);
    setPage(1);
  };

  const toggleStarredFilter = () => {
    setShowStarredOnly((prev) => !prev);
    setPage(1);
  };

  const updateStarredInquiryIds = (nextInquiry) => {
    writeStarredInquiryIds(
      new Set(nextInquiry.filter((item) => item.starred).map((item) => String(item.id)))
    );
  };

  const toggleStarred = (id) => {
    setInquiry((prev) => {
      const nextInquiry = prev.map((item) =>
        item.id === id ? { ...item, starred: !item.starred } : item
      );
      updateStarredInquiryIds(nextInquiry);
      return nextInquiry;
    });
  };

  const syncInquiryStatus = async (id, nextRead) => {
    const selectedInquiry = inquiry.find((item) => item.id === id);
    if (!selectedInquiry) return;

    const previousStatus = selectedInquiry.status;
    const nextStatus = getStatusForReadState(nextRead, previousStatus);

    setInquiry((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, read: nextRead, status: nextStatus } : item
      )
    );

    const result = await updateStatus(id, nextStatus);

    if (!result.success) {
      setInquiry((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, read: previousStatus !== "pending", status: previousStatus }
            : item
        )
      );
      return;
    }

    if (result.data) {
      setInquiry((prev) =>
        prev.map((item) => (item.id === id ? normalizeContactForm(result.data) : item))
      );
    }
  };

  const toggleRead = (id) => {
    const selectedInquiry = inquiry.find((item) => item.id === id);
    if (!selectedInquiry) return;
    void syncInquiryStatus(id, !selectedInquiry.read);
  };

  const openInquiry = (id) => {
    setActiveInquiryId(id);
    const selectedInquiry = inquiry.find((item) => item.id === id);
    if (selectedInquiry && !selectedInquiry.read) {
      void syncInquiryStatus(id, true);
    }
  };

  const closeInquiry = () => {
    setActiveInquiryId(null);
  };

  const activeInquiry = useMemo(() => {
    if (activeInquiryId == null) return null;
    return inquiry.find((it) => it.id === activeInquiryId) ?? null;
  }, [activeInquiryId, inquiry]);

  useEffect(() => {
    if (!activeInquiry) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") closeInquiry();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeInquiry]);

  const getPaginationItems = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const items = [1];
    const left = Math.max(2, currentPage - 1);
    const right = Math.min(totalPages - 1, currentPage + 1);

    if (left > 2) items.push("…");
    for (let p = left; p <= right; p += 1) items.push(p);
    if (right < totalPages - 1) items.push("…");

    items.push(totalPages);
    return items;
  };

        return (
          <div className="relative left-1/2 right-1/2 w-screen -ml-[50vw] -mr-[50vw] min-h-screen bg-white pb-8">
            <div aria-hidden="true" className="h-[54px] w-full bg-[#2c6480]" />

            <div className="relative z-10 mx-auto -mt-6 w-full overflow-hidden rounded-t-[44px] bg-white px-8 pb-10 pt-10 sm:px-14 lg:px-20">
            <h1 className="text-3xl font-semibold text-slate-800">Dashboard</h1>

            <div className="mt-6 flex flex-wrap gap-4">
              {[
                { label: "Services", value: services.length, to: "/Services" },
                { label: "Projects", value: projects.length, to: "/Projects" },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => navigate(item.to)}
                  className="group flex min-w-[150px] cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-left shadow-sm transition duration-150 hover:-translate-y-0.5 hover:border-[#2c6480] hover:bg-slate-50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2c6480]/30"
                >
                  <span className="text-lg font-semibold text-slate-900">{item.value}</span>
                  <span className="text-sm font-medium text-slate-600">{item.label}</span>
                  <span className="ml-auto text-slate-700 transition-transform duration-150 group-hover:translate-x-0.5">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 20 20"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M6 14L14 6" />
                      <path d="M8 6h6v6" />
                    </svg>
                  </span>
                </button>
              ))}
            </div>

            <section className="mt-10 rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="px-6 py-5">
                <div className="flex items-center gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-700">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 6h16v12H4z" />
                      <path d="m22 6-10 7L2 6" />
                    </svg>
                  </span>
                  <h2 className="text-lg font-semibold text-slate-800">Inquiries</h2>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={toggleStarredFilter}
                    aria-pressed={showStarredOnly}
                    className={[
                      "inline-flex h-11 shrink-0 items-center gap-1 rounded-full border px-4 text-sm font-medium shadow-sm transition",
                      showStarredOnly
                        ? "border-transparent bg-[#8dcf22] text-[#1f2a12]"
                        : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700",
                    ].join(" ")}
                  >
                    <span>Starred</span>
                    <StarIcon filled={showStarredOnly} className="h-4 w-4" />
                  </button>

                  <div className="flex min-w-[240px] flex-1 items-center rounded-full border border-slate-200 bg-white shadow-sm">
                    <label className="relative min-w-0 flex-1">
                      <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">
                        <SearchIcon />
                      </span>
                      <input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setPage(1);
                        }}
                        placeholder="Search by name"
                        className="h-11 w-full bg-transparent pl-11 pr-4 text-sm text-slate-700 outline-none"
                      />
                    </label>
                  </div>

                  <div className="flex shrink-0 items-center rounded-full border border-slate-200 bg-white pr-2 shadow-sm">
                    <label className="relative inline-flex h-11 shrink-0 items-center rounded-full px-4 text-sm font-medium text-slate-500 transition hover:text-slate-700">
                      <CalendarIcon className="h-4 w-4" />
                      <select
                        value={selectedMonth}
                        onChange={(e) => {
                          setSelectedMonth(e.target.value);
                          setPage(1);
                        }}
                        className="h-11 appearance-none bg-transparent pl-2 pr-8 text-sm font-medium text-slate-500 outline-none"
                        aria-label="Filter inquiries by month"
                      >
                        <option value="all">All Time</option>
                        {monthOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDownIcon className="pointer-events-none absolute right-4 h-4 w-4" />
                    </label>
                  </div>

                  <div
                    className="flex items-center rounded-full bg-[#2c6480] p-1 shadow-sm"
                    role="group"
                    aria-label="Filter inquiries"
                  >
                    {["All", "Unread", "Read"].map((value) => {
                      const isActive = filter === value;
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setFilterAndResetPage(value)}
                          aria-pressed={isActive}
                          className={[
                            "min-w-[74px] rounded-full px-4 py-2 text-[11px] font-semibold transition",
                            isActive
                              ? "bg-[#8dcf22] text-[#1f2a12]"
                              : "bg-transparent text-white/85 hover:text-white",
                          ].join(" ")}
                        >
                          {value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200">
                <div className="w-full overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-slate-50 text-xs font-semibold text-slate-500">
                        <th className="border-b border-slate-200 px-6 py-3">Name</th>
                        <th className="border-b border-slate-200 px-6 py-3">Email</th>
                        <th className="border-b border-slate-200 px-6 py-3">Phone</th>
                        <th className="border-b border-slate-200 px-6 py-3">
                          Date and Time Received
                        </th>
                        <th className="border-b border-slate-200 px-6 py-3">Received</th>
                        <th className="border-b border-slate-200 px-4 py-3" />
                      </tr>
                    </thead>

                    <tbody>
                      {loading ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-6 py-10 text-sm font-medium text-slate-500"
                          >
                            Loading inquiries...
                          </td>
                        </tr>
                      ) : error && inquiry.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-6 py-10 text-sm font-medium text-red-500"
                          >
                            {error}
                          </td>
                        </tr>
                      ) : pagedInquiries.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-6 py-10 text-sm font-medium text-slate-500"
                          >
                            No inquiries found.
                          </td>
                        </tr>
                      ) : (
                        pagedInquiries.map((item) => {
                          const dateParts = formatTableDateParts(item.receivedAt);
                          return (
                            <tr
                              key={item.id}
                              className="cursor-pointer border-b border-slate-200 bg-white transition hover:bg-slate-50"
                              onClick={() => openInquiry(item.id)}
                              title="Click to view details"
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <button
                                    type="button"
                                    aria-label={item.starred ? "Remove star" : "Star inquiry"}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleStarred(item.id);
                                    }}
                                    className={[
                                      "grid h-7 w-7 place-items-center rounded-full transition",
                                      item.starred
                                        ? "text-[#7ac943]"
                                        : "text-slate-300 hover:text-slate-500",
                                    ].join(" ")}
                                  >
                                    <StarIcon filled={item.starred} className="h-4 w-4" />
                                  </button>
                                  <span className="text-sm font-semibold text-slate-900">
                                    {item.name}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm font-medium text-slate-700">
                                {item.email}
                              </td>
                              <td className="px-6 py-4 text-sm font-medium text-slate-700">
                                {item.phone}
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm font-medium text-slate-700">
                                  {dateParts.dateTimeLine}
                                </div>
                                <div className="text-xs text-slate-400">
                                  {formatRelativeTime(item.receivedAt)}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm font-medium text-slate-700">
                                <div className="flex flex-col gap-1">
                                  <span>{formatRelativeTime(item.receivedAt)}</span>
                                  {!item.read ? (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-red-500">
                                      <span className="h-2.5 w-2.5 rounded-full bg-red-500" aria-hidden="true" />
                                      <span>Unread</span>
                                    </span>
                                  ) : null}
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <button
                                  type="button"
                                  className="text-xl font-bold text-slate-400"
                                  aria-label="Open inquiry"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openInquiry(item.id);
                                  }}
                                >
                                  ›
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-center px-6 py-5">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage <= 1}
                      className={[
                        "grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-base font-semibold",
                        currentPage <= 1
                          ? "text-slate-300"
                          : "text-slate-700 hover:bg-slate-50",
                      ].join(" ")}
                      aria-label="Previous page"
                    >
                      ‹
                    </button>

                    <div
                      className="flex items-center rounded-xl bg-[#2c6480] p-1"
                      role="group"
                      aria-label="Pagination"
                    >
                      {getPaginationItems().map((it, i) => {
                        if (it === "…") {
                          return (
                            <div
                              key={`ellipsis-${i}`}
                              className="flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-semibold text-white/70"
                              aria-hidden="true"
                            >
                              …
                            </div>
                          );
                        }

                        const isActive = it === currentPage;
                        return (
                          <button
                            key={it}
                            type="button"
                            onClick={() => setPage(it)}
                            aria-current={isActive ? "page" : undefined}
                            className={[
                              "flex h-8 min-w-8 items-center justify-center rounded-lg px-3 text-xs font-semibold transition",
                              isActive
                                ? "bg-[#7ac943] text-white"
                                : "bg-transparent text-white/85 hover:text-white",
                            ].join(" ")}
                          >
                            {it}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage >= totalPages}
                      className={[
                        "grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-base font-semibold",
                        currentPage >= totalPages
                          ? "text-slate-300"
                          : "text-slate-700 hover:bg-slate-50",
                      ].join(" ")}
                      aria-label="Next page"
                    >
                      ›
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {activeInquiry ? (
              <div className="fixed inset-0 z-[80]">
                <button
                  type="button"
                  className="absolute inset-0 bg-black/40"
                  aria-label="Close inquiry detail"
                  onClick={closeInquiry}
                />

                <aside className="absolute right-0 top-0 h-full w-full max-w-[520px] bg-white shadow-2xl">
                  <div className="flex items-start justify-between gap-4 px-10 py-8">
                    <div>
                      <h3 className="text-3xl font-extrabold tracking-tight text-slate-900">
                        Inquiry Detail
                      </h3>

                      <div className="mt-8">
                        <div className="text-base font-bold text-slate-700">
                          {activeInquiry.subject}
                        </div>
                        {(() => {
                          const parts = formatDetailDateParts(activeInquiry.receivedAt);
                          return (
                            <div className="mt-3 text-base font-semibold leading-tight text-slate-600">
                              <div>{parts.dateTimeLine}</div>
                              <div>{formatRelativeTime(activeInquiry.receivedAt)}</div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={closeInquiry}
                      aria-label="Close"
                      className="grid h-10 w-10 place-items-center rounded-full border-2 border-black text-xl font-bold"
                    >
                      ×
                    </button>
                  </div>

                  <div className="px-10 pb-10">
                    <h4 className="text-2xl font-extrabold text-slate-900">
                      Inquired Person
                    </h4>

                    <div className="mt-6 grid grid-cols-2 gap-y-5">
                      <div className="text-base font-semibold text-slate-600">Name</div>
                      <div className="text-base font-semibold text-slate-700">
                        {activeInquiry.name}
                      </div>

                      <div className="text-base font-semibold text-slate-600">Email</div>
                      <div className="text-base font-semibold text-slate-700">
                        {activeInquiry.email}
                      </div>

                      <div className="text-base font-semibold text-slate-600">
                        Phone Number
                      </div>
                      <div className="text-base font-semibold text-slate-700">
                        {activeInquiry.phone}
                      </div>
                    </div>

                    <h4 className="mt-10 text-2xl font-extrabold text-slate-900">Message</h4>
                    <p className="mt-4 text-base font-semibold text-slate-600">
                      {activeInquiry.message}
                    </p>

                    <button
                      type="button"
                      className="mt-8 border border-black bg-white px-4 py-2 text-sm font-semibold"
                      onClick={() => toggleRead(activeInquiry.id)}
                    >
                      Mark as {activeInquiry.read ? "Unread" : "Read"}
                    </button>

                    <button
                      type="button"
                      className="ml-3 mt-8 border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                      onClick={() => toggleStarred(activeInquiry.id)}
                    >
                      {activeInquiry.starred ? "Remove Star" : "Star Inquiry"}
                    </button>
                  </div>
                </aside>
              </div>
      ) : null}
    </div>
  </div>
  );
}

export default Home;
import React, { useState } from "react";
import apiClient from "../services/api";
import { useTranslation } from "react-i18next";

function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const { t } = useTranslation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    try {
      const response = await apiClient.post("/contact-forms", formData);
      console.log("Success:", response.data);
      setStatus("success");
      setFormData({ name: "", email: "", phone: "", message: "" });
      setTimeout(() => setStatus("idle"), 5000);
    } catch (err) {
      console.error("Error submitting form:", err);
      setStatus("error");
      setErrorMessage(err.response?.data?.message || t("contactUs.errorMsg"));
    }
  };

  return (
    // Outer page wrapper with background color matching your site
    <div className="min-h-screen bg-white pt-10 md:pt-16 pb-24">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* 1. The Blue Box (Only the top padding is visible!) */}
        <div className="bg-[#113243] rounded-t-[3rem] pt-6 md:pt-8 w-full shadow-[0_10px_40px_-15px_rgba(17,50,67,0.2)]">
          {/* 2. The White Card (Covers the left, right, and bottom of the blue box) */}
          <div className="bg-white rounded-t-[2.5rem] md:rounded-t-[3rem] w-full h-full pt-12 md:pt-16 pb-12 px-6 lg:px-16 relative">
            {/* Floating Social Icons (Positioned perfectly to the left of the map) */}
            <div className="absolute bottom-24 left-2 lg:left-6 flex flex-col gap-5 text-slate-400 z-20 hidden lg:flex">
              <a
                href="https://www.facebook.com/share/1EJekSHxiE/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-[#84cc16] hover:scale-110"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="#"
                className="transition hover:text-[#84cc16] hover:scale-110"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.301 2.246.464 3.443.464 6.627 0 12-4.975 12-11.111C24 4.974 18.627 0 12 0zm1.191 14.963l-3.056-3.255-5.963 3.255 6.546-6.963 3.162 3.255 5.853-3.255-6.542 6.963z" />
                </svg>
              </a>
              <a
                href="#"
                className="transition hover:text-[#84cc16] hover:scale-110"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>

            <div className="flex flex-col gap-16 lg:gap-20">
              {/* Top Section: Split Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
                {/* Left Side: Contact Information */}
                <div className="flex flex-col justify-start pt-2">
                  <h1 className="text-4xl md:text-5xl font-semibold text-[#113243] mb-6">
                    {t("contactUs.title")}
                  </h1>
                  <p className="text-slate-500 text-[15px] leading-relaxed mb-12 max-w-md">
                    {t("contactUs.subtitle")}
                  </p>

                  {/* Contact Details List */}
                  <div className="space-y-8 text-slate-500">
                    {/* Location */}
                    <div className="flex items-start gap-5">
                      <div className="mt-0.5 shrink-0 text-[#84cc16]">
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                          />
                        </svg>
                      </div>
                      <span className="text-[15px] leading-relaxed">
                        {t("contactUs.location")}
                      </span>
                    </div>

                    {/* Email */}
                    <div className="flex items-center gap-5">
                      <div className="shrink-0 text-[#84cc16]">
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                          />
                        </svg>
                      </div>
                      <span className="text-[15px]">
                        {t("contactUs.email")}
                      </span>
                    </div>

                    {/* Phone */}
                    <div className="flex items-center gap-5">
                      <div className="shrink-0 text-[#84cc16]">
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.864-1.041l-3.286-.481c-.498-.073-.993.17-1.25.597l-1.598 2.66c-3.04-1.5-5.5-3.96-7-7l2.66-1.598c.427-.257.67-.752.597-1.25l-.481-3.286c-.075-.512-.525-.864-1.041-.864H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                          />
                        </svg>
                      </div>
                      <span className="text-[15px]">
                        {t("contactUs.phone")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Contact Form */}
                <div>
                  {/* Alerts */}
                  {status === "success" && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-2xl flex items-center gap-3">
                      <span className="font-medium">
                        {t("contactUs.successMsg")}
                      </span>
                    </div>
                  )}
                  {status === "error" && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-3">
                      <span className="font-medium">{errorMessage}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-6 py-4 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#7fc41b] focus:border-transparent text-slate-700 placeholder-slate-400 bg-white"
                      placeholder={t("contactUs.namePlaceholder")}
                    />

                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-6 py-4 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#7fc41b] focus:border-transparent text-slate-700 placeholder-slate-400 bg-white"
                      placeholder={t("contactUs.emailPlaceholder")}
                    />

                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-6 py-4 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#7fc41b] focus:border-transparent text-slate-700 placeholder-slate-400 bg-white"
                      placeholder={t("contactUs.phonePlaceholder")}
                    />

                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows="4"
                      className="w-full px-6 py-5 rounded-[2rem] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#7fc41b] focus:border-transparent text-slate-700 placeholder-slate-400 bg-white resize-none"
                      placeholder={t("contactUs.messagePlaceholder")}
                    ></textarea>

                    <div className="flex justify-end mt-2">
                      <button
                        type="submit"
                        disabled={status === "submitting"}
                        className={`px-8 py-3.5 rounded-full font-medium text-[15px] text-white transition-all shadow-sm
                          ${
                            status === "submitting"
                              ? "bg-slate-400 cursor-not-allowed"
                              : "bg-[#113243] hover:bg-[#18445a]"
                          }`}
                      >
                        {status === "submitting"
                          ? t("contactUs.sendingBtn")
                          : t("contactUs.sendBtn")}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Bottom Section: Map and Copyright */}
              <div className="flex flex-col gap-4 mt-4">
                {/* Google Map */}
                <div className="w-full h-[400px] md:h-[450px] rounded-[2rem] overflow-hidden bg-slate-200 shadow-sm border border-slate-100">
                  <iframe
                    src="https://maps.google.com/maps?q=Yangon,%20Myanmar&t=&z=15&ie=UTF8&iwloc=&output=embed"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactUs;
``;

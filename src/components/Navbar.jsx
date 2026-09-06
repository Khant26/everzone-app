import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import logoImg from "../assets/logo.jpg";

function Navbar() {
  const { t, i18n } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const linkClass =
    "text-sm font-medium text-slate-600 transition hover:text-[#84cc16]";
  const mobileLinkClass =
    "text-base font-medium text-white transition hover:text-[#84cc16]";

  const changeLanguage = async (language) => {
    await i18n.changeLanguage(language);
    localStorage.setItem("lng", language);
    setIsMobileMenuOpen(false); // Close menu on language change
  };

  const getLanguageClass = (language, isMobile = false) => {
    const activeColor = "text-[#84cc16]";
    const inactiveColor = isMobile
      ? `text-slate-300 hover:text-white`
      : `text-slate-500 hover:text-slate-900`;
    return i18n.resolvedLanguage === language ? activeColor : inactiveColor;
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <header className="sticky top-0 z-50 bg-white py-4 shadow-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-8 relative">
        {/* LEFT: Logo */}
        <a href="#home" className="flex items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#84cc16] overflow-hidden p-1">
            <img
              src={logoImg}
              alt="Ever Zone Logo"
              className="w-full h-full object-contain"
            />
          </div>
        </a>

        {/* CENTER: Desktop Navigation Links */}
        <ul className="hidden md:flex items-center gap-8">
          <li>
            <a href="#home" className={linkClass}>
              {t("navbar.home")}
            </a>
          </li>
          <li>
            <a href="#about" className={linkClass}>
              {t("navbar.aboutUs")}
            </a>
          </li>
          <li>
            <a href="#services" className={linkClass}>
              {t("navbar.services")}
            </a>
          </li>
          <li>
            <a href="#projects" className={linkClass}>
              {t("navbar.projects")}
            </a>
          </li>
          <li>
            <a href="#contact" className={linkClass}>
              {t("navbar.contactUs")}
            </a>
          </li>
        </ul>

        {/* RIGHT: Desktop Language Switcher */}
        <div className="hidden md:flex items-center gap-4 text-sm font-bold">
          <button
            type="button"
            onClick={() => changeLanguage("en")}
            className={getLanguageClass("en")}
          >
            EN
          </button>
          <span className="text-slate-300">|</span>
          <button
            type="button"
            onClick={() => changeLanguage("my")}
            className={getLanguageClass("my")}
          >
            MM
          </button>
        </div>

        {/* Hamburger Menu Button (Mobile Only) */}
        <button
          onClick={toggleMobileMenu}
          className="md:hidden text-slate-600 hover:text-[#84cc16]"
        >
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            {isMobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

        {/* Mobile Dropdown Menu (Matches Figma) */}
        {isMobileMenuOpen && (
          <div className="absolute top-[100%] left-0 w-full bg-[#113243] shadow-xl md:hidden flex flex-col py-8 rounded-b-3xl">
            <ul className="flex flex-col items-center gap-6 mb-8">
              <li>
                <a
                  href="#home"
                  onClick={toggleMobileMenu}
                  className={mobileLinkClass}
                >
                  {t("navbar.home")}
                </a>
              </li>
              <li>
                <a
                  href="#about"
                  onClick={toggleMobileMenu}
                  className={mobileLinkClass}
                >
                  {t("navbar.aboutUs")}
                </a>
              </li>
              <li>
                <a
                  href="#services"
                  onClick={toggleMobileMenu}
                  className={mobileLinkClass}
                >
                  {t("navbar.services")}
                </a>
              </li>
              <li>
                <a
                  href="#projects"
                  onClick={toggleMobileMenu}
                  className={mobileLinkClass}
                >
                  {t("navbar.projects")}
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  onClick={toggleMobileMenu}
                  className={mobileLinkClass}
                >
                  {t("navbar.contactUs")}
                </a>
              </li>
            </ul>
            <div className="flex items-center justify-center gap-4 text-base font-bold border-t border-slate-600/50 pt-6 mx-10">
              <button
                type="button"
                onClick={() => changeLanguage("en")}
                className={getLanguageClass("en", true)}
              >
                EN
              </button>
              <span className="text-slate-500">|</span>
              <button
                type="button"
                onClick={() => changeLanguage("my")}
                className={getLanguageClass("my", true)}
              >
                MM
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

export default Navbar;

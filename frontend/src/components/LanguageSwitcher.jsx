import React from 'react';
import { useI18n } from '../i18n/i18n';

const LanguageSwitcher = ({ className = '' }) => {
  const { lang, setLang } = useI18n();
  return (
    <div className={`flex items-center gap-2 ${className}`} aria-label="Language switcher">
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value)}
        className="px-3 py-2 rounded-lg bg-white/80 border border-gray-300 text-sm"
        aria-label="Language"
      >
        <option value="en">English</option>
        <option value="hi">हिंदी</option>
        <option value="es">Español</option>
        <option value="fr">Français</option>
      </select>
    </div>
  );
};

export default LanguageSwitcher;

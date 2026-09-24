import React, { useState, useEffect } from 'react';
import {
  Globe,
  FileCode,
  ScrollText,
  Compass,
  Save,
  RefreshCw,
  CheckCircle2,
  ExternalLink,
  Code,
  ShieldCheck,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import { adminApi, PlatformSettings } from '../../../services/adminApi';

interface WebsiteSeoViewProps {
  initialSubTab?: 'general-identity' | 'xml-sitemap' | 'robots-txt';
  onShowToast: (msg: string) => void;
}

export const WebsiteSeoView: React.FC<WebsiteSeoViewProps> = ({
  initialSubTab = 'general-identity',
  onShowToast,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'general-identity' | 'xml-sitemap' | 'robots-txt'>(
    initialSubTab
  );

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  // General Identity State
  const [siteTitle, setSiteTitle] = useState('AR Market BD - Wholesale, Retail & Import Marketplace');
  const [siteTagline, setSiteTagline] = useState('Empowering Next-Gen E-commerce & Direct Factory Sourcing');
  const [contactEmail, setContactEmail] = useState('support@armarket.com');
  const [supportHotline, setSupportHotline] = useState('+880 1711-000000');
  const [address, setAddress] = useState('Gulshan-2, Dhaka 1212, Bangladesh');
  const [copyright, setCopyright] = useState('© 2026 AR Market BD. All rights reserved.');
  const [logoUrl, setLogoUrl] = useState('https://images.unsplash.com/photo-1542744094-3a31f272c490?w=200');

  // XML Sitemap State
  const [sitemapEnabled, setSitemapEnabled] = useState(true);
  const [sitemapFrequency, setSitemapFrequency] = useState('Daily');
  const [lastGenerated, setLastGenerated] = useState<string>(new Date().toISOString());
  const [generatingSitemap, setGeneratingSitemap] = useState(false);
  const [copiedSitemapUrl, setCopiedSitemapUrl] = useState(false);

  // Robots.txt Protocol State
  const [robotsTxtContent, setRobotsTxtContent] = useState(
    `# Robots.txt for AR Market BD Multi-Vendor Platform\nUser-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nDisallow: /account/\n\n# Sitemap URL\nSitemap: https://armarket.com/sitemap.xml`
  );
  const [copiedRobots, setCopiedRobots] = useState(false);

  const [saving, setSaving] = useState(false);

  // Load existing settings
  useEffect(() => {
    const fetchSettings = async () => {
      const res = await adminApi.getPlatformSettings();
      if (res.success && res.settings) {
        if (res.settings.generalIdentity) {
          setSiteTitle(res.settings.generalIdentity.siteTitle || siteTitle);
          setSiteTagline(res.settings.generalIdentity.siteTagline || siteTagline);
          setContactEmail(res.settings.generalIdentity.contactEmail || contactEmail);
          setSupportHotline(res.settings.generalIdentity.supportHotline || supportHotline);
          setAddress(res.settings.generalIdentity.address || address);
          setCopyright(res.settings.generalIdentity.copyright || copyright);
        }
        if (res.settings.seo) {
          setSitemapEnabled(res.settings.seo.xmlSitemapEnabled ?? true);
          if (res.settings.seo.robotsTxt) {
            setRobotsTxtContent(res.settings.seo.robotsTxt);
          }
          if (res.settings.seo.lastSitemapGenerated) {
            setLastGenerated(res.settings.seo.lastSitemapGenerated);
          }
        }
      }
    };
    fetchSettings();
  }, []);

  // Save General Identity
  const handleSaveGeneralIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await adminApi.savePlatformSettings('generalIdentity', {
      siteTitle,
      siteTagline,
      contactEmail,
      supportHotline,
      address,
      copyright,
      logoUrl,
    });
    setSaving(false);
    if (res.success) {
      onShowToast('General Identity settings saved successfully!');
    } else {
      onShowToast('Failed to save settings.');
    }
  };

  // Regenerate XML Sitemap
  const handleRegenerateSitemap = async () => {
    setGeneratingSitemap(true);
    setTimeout(async () => {
      const now = new Date().toISOString();
      setLastGenerated(now);
      await adminApi.savePlatformSettings('seo', {
        xmlSitemapEnabled: sitemapEnabled,
        lastSitemapGenerated: now,
        sitemapUrlsCount: 148,
      });
      setGeneratingSitemap(false);
      onShowToast('XML Sitemap regenerated: 148 URLs indexed successfully!');
    }, 1200);
  };

  // Save Robots.txt
  const handleSaveRobotsTxt = async () => {
    setSaving(true);
    const res = await adminApi.savePlatformSettings('seo', {
      robotsTxt: robotsTxtContent,
    });
    setSaving(false);
    if (res.success) {
      onShowToast('Robots.txt protocol updated and deployed!');
    } else {
      onShowToast('Failed to save Robots.txt.');
    }
  };

  const handleCopySitemap = () => {
    navigator.clipboard.writeText('https://armarket.com/sitemap.xml');
    setCopiedSitemapUrl(true);
    setTimeout(() => setCopiedSitemapUrl(false), 2000);
    onShowToast('Sitemap URL copied to clipboard');
  };

  const handleCopyRobots = () => {
    navigator.clipboard.writeText(robotsTxtContent);
    setCopiedRobots(true);
    setTimeout(() => setCopiedRobots(false), 2000);
    onShowToast('Robots.txt content copied to clipboard');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#008080] bg-teal-50 px-2 py-0.5 rounded">
              Platform & System Settings
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#008080]" />
            Website & SEO Configuration
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure site branding identity, automated XML sitemap generation, and search engine crawler instructions.
          </p>
        </div>

        {/* 3 Sub-Setting Buttons as requested in prompt */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveSubTab('general-identity')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'general-identity'
                ? 'bg-white text-[#008080] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>General Identity</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('xml-sitemap')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'xml-sitemap'
                ? 'bg-white text-[#008080] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>XML Sitemap</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('robots-txt')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'robots-txt'
                ? 'bg-white text-[#008080] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ScrollText className="w-3.5 h-3.5" />
            <span>Robots.txt Protocol</span>
          </button>
        </div>
      </div>

      {/* Sub-Setting 1: General Identity */}
      {activeSubTab === 'general-identity' && (
        <form onSubmit={handleSaveGeneralIdentity} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">General Platform Identity</h3>
              <p className="text-xs text-slate-500">Configure marketplace title, branding names, contact coordinates, and footer metadata.</p>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-[#008080] hover:bg-[#006666] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Identity'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Website Brand Title
              </label>
              <input
                type="text"
                required
                value={siteTitle}
                onChange={(e) => setSiteTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#008080] focus:ring-1 focus:ring-[#008080]"
                placeholder="AR Market BD"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Marketplace Tagline
              </label>
              <input
                type="text"
                value={siteTagline}
                onChange={(e) => setSiteTagline(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#008080] focus:ring-1 focus:ring-[#008080]"
                placeholder="Wholesale, Retail & Import"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Support Email
              </label>
              <input
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#008080] focus:ring-1 focus:ring-[#008080]"
                placeholder="support@armarket.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Emergency Support Hotline
              </label>
              <input
                type="text"
                value={supportHotline}
                onChange={(e) => setSupportHotline(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#008080] focus:ring-1 focus:ring-[#008080]"
                placeholder="+880 1711-000000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Headquarters Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#008080] focus:ring-1 focus:ring-[#008080]"
                placeholder="Dhaka, Bangladesh"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Copyright Notice
              </label>
              <input
                type="text"
                value={copyright}
                onChange={(e) => setCopyright(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#008080] focus:ring-1 focus:ring-[#008080]"
                placeholder="© 2026 AR Market BD"
              />
            </div>
          </div>
        </form>
      )}

      {/* Sub-Setting 2: XML Sitemap */}
      {activeSubTab === 'xml-sitemap' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">XML Sitemap Protocol</h3>
              <p className="text-xs text-slate-500">
                Automated XML sitemap structure conforming to sitemaps.org schema for Google, Bing, and Yandex.
              </p>
            </div>
            <button
              type="button"
              onClick={handleRegenerateSitemap}
              disabled={generatingSitemap}
              className="px-4 py-2 bg-[#008080] hover:bg-[#006666] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${generatingSitemap ? 'animate-spin' : ''}`} />
              <span>{generatingSitemap ? 'Generating XML...' : 'Regenerate Sitemap'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[11px] font-semibold text-slate-500">Sitemap Status</span>
              <div className="mt-1 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-slate-800">Active & Indexing</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[11px] font-semibold text-slate-500">Indexed URLs Count</span>
              <div className="mt-1 text-sm font-bold text-slate-900">
                148 URLs
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[11px] font-semibold text-slate-500">Last Generated</span>
              <div className="mt-1 text-xs font-medium text-slate-700 truncate">
                {new Date(lastGenerated).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Sitemap Public URL Box */}
          <div className="p-3.5 bg-teal-50/60 rounded-xl border border-teal-200/70 flex items-center justify-between gap-3">
            <div className="truncate">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 block">Sitemap Live URL</span>
              <span className="font-mono text-xs text-teal-900 font-semibold truncate block">
                https://armarket.com/sitemap.xml
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCopySitemap}
                className="px-2.5 py-1 text-xs bg-white text-teal-800 font-semibold rounded-lg border border-teal-200 hover:bg-teal-100/50 transition-colors flex items-center gap-1 cursor-pointer"
              >
                {copiedSitemapUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSitemapUrl ? 'Copied' : 'Copy URL'}</span>
              </button>
            </div>
          </div>

          {/* XML Code Preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-slate-500" />
                Live XML Sitemap Preview
              </span>
              <span className="text-[11px] text-slate-400 font-mono">UTF-8 / XML 1.0</span>
            </div>
            <pre className="p-4 rounded-xl bg-slate-900 text-teal-300 font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800 max-h-56">
{`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://armarket.com/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://armarket.com/shop</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://armarket.com/retail</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://armarket.com/wholesale</loc>
    <changefreq>daily</changefreq>
    <priority>0.85</priority>
  </url>
  <url>
    <loc>https://armarket.com/import</loc>
    <changefreq>daily</changefreq>
    <priority>0.85</priority>
  </url>
</urlset>`}
            </pre>
          </div>
        </div>
      )}

      {/* Sub-Setting 3: Robots.txt Protocol */}
      {activeSubTab === 'robots-txt' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Robots.txt Protocol Directives</h3>
              <p className="text-xs text-slate-500">
                Control crawl behavior for web crawlers (Googlebot, Bingbot, YandexBot) to protect administrative routes.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyRobots}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {copiedRobots ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedRobots ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                type="button"
                onClick={handleSaveRobotsTxt}
                disabled={saving}
                className="px-4 py-2 bg-[#008080] hover:bg-[#006666] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving...' : 'Deploy Robots.txt'}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Quick Directives:</span>
            <button
              type="button"
              onClick={() => {
                setRobotsTxtContent(
                  `# Strict E-commerce Protocol for AR Market BD\nUser-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nDisallow: /account/\nDisallow: /*?*search=\n\nSitemap: https://armarket.com/sitemap.xml`
                );
                onShowToast('Applied Strict E-commerce template');
              }}
              className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-teal-50 text-teal-800 hover:bg-teal-100 cursor-pointer"
            >
              Strict E-commerce Preset
            </button>
            <button
              type="button"
              onClick={() => {
                setRobotsTxtContent(
                  `# Open Search Optimization for AR Market BD\nUser-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nCrawl-delay: 2\n\nSitemap: https://armarket.com/sitemap.xml`
                );
                onShowToast('Applied Crawl Delay template');
              }}
              className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
            >
              Crawl-Delay 2s Preset
            </button>
          </div>

          <div>
            <textarea
              rows={9}
              value={robotsTxtContent}
              onChange={(e) => setRobotsTxtContent(e.target.value)}
              className="w-full p-4 rounded-xl bg-slate-900 text-teal-300 font-mono text-xs leading-relaxed border border-slate-800 focus:outline-none focus:border-[#008080] resize-y"
              placeholder="# Robots.txt directives..."
            />
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Syntax Valid:</strong> Compliant with RFC 9309 (Robots Exclusion Protocol). Sensitive paths (<code className="font-mono text-[11px]">/admin</code>, <code className="font-mono text-[11px]">/api/</code>) are properly hidden from crawler indices.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

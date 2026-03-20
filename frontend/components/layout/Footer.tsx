import Link from 'next/link';
import { Sparkles, Twitter, Youtube, Github, Linkedin, Mail } from 'lucide-react';

const footerLinks = {
  Platform: [
    { label: 'Browse Courses', href: '/courses' },
    { label: 'Become an Instructor', href: '/instructor' },
    { label: 'Pricing', href: '/#pricing' },
    { label: 'Blog', href: '/blog' },
  ],
  Company: [
    { label: 'About Us', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Contact', href: '/contact' },
    { label: 'Press', href: '/press' },
  ],
  Support: [
    { label: 'Help Center', href: '/help' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Cookie Policy', href: '/cookies' },
  ],
};

const socials = [
  { icon: <Twitter size={18} />, href: '#', label: 'Twitter' },
  { icon: <Youtube size={18} />, href: '#', label: 'YouTube' },
  { icon: <Linkedin size={18} />, href: '#', label: 'LinkedIn' },
  { icon: <Github size={18} />, href: '#', label: 'GitHub' },
  { icon: <Mail size={18} />, href: 'mailto:support@conceptcorner.com', label: 'Email' },
];

export default function Footer() {
  return (
    <footer className="bg-[#080814] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                <Sparkles size={16} className="text-white" />
              </div>
              <span className="text-xl font-bold font-poppins bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-secondary-400">
                Concept Corner
              </span>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              Empowering learners across Bangladesh with world-class online education. Learn at your own pace, anywhere.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 hover:border-primary-500/50 transition-all duration-200"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h3 className="text-sm font-semibold text-white mb-4">{section}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/50 hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/30">
            © {new Date().getFullYear()} Concept Corner. All rights reserved.
          </p>
          <p className="text-sm text-white/30">
            Made with ❤️ in Bangladesh
          </p>
        </div>
      </div>
    </footer>
  );
}

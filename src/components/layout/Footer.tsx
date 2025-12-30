import { Mail, HelpCircle, MessageCircle, Code2 } from 'lucide-react'

const VERSION = '0.1.0'

export function Footer() {
  return (
    <footer
      className="flex items-center justify-between px-6 py-3 text-sm"
      style={{
        color: 'var(--theme-sub)',
        borderTop: '1px solid var(--theme-sub-alt)',
      }}
    >
      <div className="flex items-center gap-6">
        <FooterLink icon={Mail} label="contact" href="mailto:contact@example.com" />
        <FooterLink icon={HelpCircle} label="support" href="#" />
        <FooterLink icon={MessageCircle} label="discord" href="#" />
      </div>

      <div className="flex items-center gap-2">
        <Code2 className="h-4 w-4" />
        <span>v{VERSION}</span>
      </div>
    </footer>
  )
}

function FooterLink({
  icon: Icon,
  label,
  href,
}: {
  icon: typeof Mail
  label: string
  href: string
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-1.5 transition-colors hover:opacity-80"
      style={{ color: 'var(--theme-sub)' }}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </a>
  )
}

import Icon from "@/components/ui/icon";

const SERVER_IP = "play.vanilakind.ru";

const NAV_ITEMS = [
  { id: "home", label: "Главная" },
  { id: "privileges", label: "Донат" },
  { id: "rating", label: "Рейтинг" },
  { id: "about", label: "О сервере" },
  { id: "faq", label: "FAQ" },
];

type NavbarProps = {
  activeSection: string;
  scrollTo: (id: string) => void;
  copyIP: () => void;
  copied: boolean;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (v: boolean) => void;
};

export default function Navbar({ activeSection, scrollTo, copyIP, copied, mobileMenuOpen, setMobileMenuOpen }: NavbarProps) {
  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-xl bg-black/40 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⛏️</span>
          <span className="font-black text-xl tracking-tight" style={{ fontFamily: "Montserrat, sans-serif" }}>
            Vanila<span className="neon-text">Kind</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeSection === item.id
                  ? "text-emerald-400 bg-emerald-400/10"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={copyIP}
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg neon-border text-sm font-mono text-emerald-400 hover:bg-emerald-400/10 transition-all duration-200"
          >
            <Icon name="Server" size={14} />
            {copied ? "Скопировано!" : SERVER_IP}
          </button>
          <button
            className="md:hidden text-white/60 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Icon name={mobileMenuOpen ? "X" : "Menu"} size={22} />
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 pt-20 bg-black/95 backdrop-blur-xl flex flex-col items-center gap-6 p-6">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="text-2xl font-bold text-white/70 hover:text-emerald-400 transition-colors"
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={copyIP}
            className="mt-4 flex items-center gap-2 px-6 py-3 rounded-xl neon-border text-emerald-400 font-mono"
          >
            <Icon name="Copy" size={16} />
            {SERVER_IP}
          </button>
        </div>
      )}
    </>
  );
}

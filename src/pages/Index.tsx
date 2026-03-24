import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

const BANK_DETAILS = {
  card: "2202 2081 3455 9450",
  bank: "Сбербанк",
  name: "Иван В.",
  sbp: "+7 (992) 344-76-17",
};

const HERO_IMG = "https://cdn.poehali.dev/projects/81ac8d06-fd37-46e6-b119-fc4ab95e812c/files/9c6ce094-d6bd-466c-9414-1932923a24fb.jpg";
const CARD_IMG = "https://cdn.poehali.dev/projects/81ac8d06-fd37-46e6-b119-fc4ab95e812c/files/922ab60c-9ccd-401a-af28-422e8a8273c0.jpg";

const SERVER_IP = "VanilaKind.minerent.io";

const privileges = [
  {
    id: 1,
    name: "💎 Спонсор",
    price: "299₽",
    badge: "Единственный",
    perks: [
      "Доступ к VIP-чату",
      "Приоритетный вход на сервер",
      "Прямой контакт с администрацией",
      "Цветной ник в табе и чате",
      "Роль Спонсора в Discord",
    ],
  },
];

const faqs = [
  {
    q: "Как быстро зачисляется привилегия?",
    a: "Автоматически в течение 1-5 минут после подтверждения оплаты. Зайдите на сервер — привилегия уже будет активна.",
  },
  {
    q: "На сколько времени даётся привилегия?",
    a: "Все привилегии выдаются на 30 дней с момента оплаты. По истечении срока вы можете продлить или выбрать другой тариф.",
  },
  {
    q: "Можно ли сменить привилегию?",
    a: "Да, при покупке более высокого тарифа оставшиеся дни текущей привилегии засчитываются.",
  },
  {
    q: "Что если привилегия не пришла?",
    a: "Свяжитесь с администрацией в Discord или напишите нам. Разберёмся в течение 30 минут.",
  },
  {
    q: "Возможен ли возврат?",
    a: "Да, в течение 24 часов с момента покупки, если привилегия не использовалась. Пишите в поддержку.",
  },
];



function Particle({ style }: { style: React.CSSProperties }) {
  return (
    <div
      className="absolute w-1 h-1 rounded-full bg-emerald-400 animate-float-particle"
      style={style}
    />
  );
}

function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const end = value;
          const duration = 1500;
          const step = (end / duration) * 16;
          const timer = setInterval(() => {
            start += step;
            if (start >= end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 16);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="text-4xl font-black neon-text" style={{ fontFamily: "Montserrat, sans-serif" }}>
      {count.toLocaleString()}{suffix}
    </div>
  );
}

type PayModal = { priv: typeof privileges[0] } | null;

const NOTIFY_URL = "https://functions.poehali.dev/d51daf2f-e0a9-4f6d-9d4b-8e7b97d6ff1d";

function PaymentModal({ modal, onClose }: { modal: PayModal; onClose: () => void }) {
  const [step, setStep] = useState<"details" | "confirm" | "done">("details");
  const [nick, setNick] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [proofText, setProofText] = useState("");
  const [sending, setSending] = useState(false);

  const copyField = (val: string, key: string) => {
    navigator.clipboard.writeText(val);
    setCopiedField(key);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (!modal) return null;

  const comment = `VK-${modal.priv.name.replace(/[^a-zA-Zа-яА-Я0-9]/g, "")}-${nick || "NICK"}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative w-full max-w-md rounded-3xl p-8 animate-slide-up"
        style={{
          background: "linear-gradient(145deg, hsl(220 20% 8%), hsl(220 18% 11%))",
          border: "1px solid rgba(61,220,132,0.25)",
          boxShadow: "0 0 60px rgba(61,220,132,0.1), 0 30px 60px rgba(0,0,0,0.6)",
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
        >
          <Icon name="X" size={16} />
        </button>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {(["details", "confirm", "done"] as const).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                style={{
                  background: step === s ? "var(--neon-green)" : ["details","confirm","done"].indexOf(step) > i ? "rgba(61,220,132,0.3)" : "rgba(255,255,255,0.08)",
                  color: step === s ? "#0a0f0a" : ["details","confirm","done"].indexOf(step) > i ? "var(--neon-green)" : "rgba(255,255,255,0.3)",
                }}
              >
                {["details","confirm","done"].indexOf(step) > i ? <Icon name="Check" size={12} /> : i + 1}
              </div>
              {i < 2 && (
                <div className="flex-1 h-px w-8" style={{ background: ["details","confirm","done"].indexOf(step) > i ? "var(--neon-green)" : "rgba(255,255,255,0.1)" }} />
              )}
            </div>
          ))}
          <div className="ml-2 text-white/30 text-xs">
            {step === "details" ? "Реквизиты" : step === "confirm" ? "Подтверждение" : "Готово"}
          </div>
        </div>

        {step === "details" && (
          <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-400/10 flex items-center justify-center text-2xl">
                {modal.priv.name.split(" ")[0]}
              </div>
              <div>
                <div className="font-black text-lg" style={{ fontFamily: "Montserrat, sans-serif" }}>
                  {modal.priv.name}
                </div>
                <div className="neon-text font-black text-xl">{modal.priv.price}</div>
              </div>
            </div>

            <div className="mb-5">
              <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Твой ник на сервере</label>
              <input
                value={nick}
                onChange={(e) => setNick(e.target.value)}
                placeholder="Например: Steve_King"
                className="w-full px-4 py-3 rounded-xl text-sm font-mono outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: nick ? "1px solid rgba(61,220,132,0.5)" : "1px solid rgba(255,255,255,0.1)",
                  color: "white",
                }}
              />
            </div>

            <div className="space-y-3 mb-6">
              <div className="text-white/40 text-xs uppercase tracking-wider">Переведи точную сумму</div>

              {[
                { label: "Карта", value: BANK_DETAILS.card, key: "card", icon: "CreditCard" },
                { label: "Банк", value: BANK_DETAILS.bank, key: "bank", icon: "Building2" },
                { label: "СБП", value: BANK_DETAILS.sbp, key: "sbp", icon: "Smartphone" },
              ].map(({ label, value, key, icon }) => (
                <div
                  key={key}
                  className="flex items-center justify-between px-4 py-3 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <div className="flex items-center gap-3">
                    <Icon name={icon} fallback="Info" size={15} className="text-emerald-400/70" />
                    <div>
                      <div className="text-white/35 text-xs">{label}</div>
                      <div className="font-mono text-sm text-white/90">{value}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => copyField(value, key)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                    style={{ background: copiedField === key ? "rgba(61,220,132,0.2)" : "rgba(255,255,255,0.06)" }}
                  >
                    <Icon name={copiedField === key ? "Check" : "Copy"} size={13} className={copiedField === key ? "text-emerald-400" : "text-white/40"} />
                  </button>
                </div>
              ))}

              <div
                className="px-4 py-3 rounded-xl"
                style={{ background: "rgba(61,220,132,0.06)", border: "1px solid rgba(61,220,132,0.2)" }}
              >
                <div className="text-white/35 text-xs mb-1 flex items-center gap-1">
                  <Icon name="MessageSquare" size={11} className="text-emerald-400/60" />
                  Комментарий к переводу
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm text-emerald-300">{comment}</span>
                  <button
                    onClick={() => copyField(comment, "comment")}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                    style={{ background: copiedField === "comment" ? "rgba(61,220,132,0.2)" : "rgba(255,255,255,0.06)" }}
                  >
                    <Icon name={copiedField === "comment" ? "Check" : "Copy"} size={13} className={copiedField === "comment" ? "text-emerald-400" : "text-white/40"} />
                  </button>
                </div>
                <div className="text-white/25 text-xs mt-1">⚠️ Обязательно укажи комментарий!</div>
              </div>
            </div>

            <button
              onClick={() => nick.trim() ? setStep("confirm") : undefined}
              className="w-full py-4 rounded-xl font-bold text-sm transition-all duration-200"
              style={{
                background: nick.trim() ? "linear-gradient(135deg, #3ddc84, #22c55e)" : "rgba(255,255,255,0.07)",
                color: nick.trim() ? "#0a0f0a" : "rgba(255,255,255,0.3)",
                cursor: nick.trim() ? "pointer" : "not-allowed",
                boxShadow: nick.trim() ? "0 0 20px rgba(61,220,132,0.4)" : "none",
              }}
            >
              Я перевёл — подтвердить
            </button>
            <div className="text-center text-white/25 text-xs mt-3">Введи ник, чтобы продолжить</div>
          </div>
        )}

        {step === "confirm" && (
          <div className="animate-fade-in">
            <h3 className="font-black text-xl mb-2" style={{ fontFamily: "Montserrat, sans-serif" }}>Подтверждение</h3>
            <p className="text-white/40 text-sm mb-6">Укажи дополнительную информацию, чтобы мы быстро нашли твой перевод</p>

            <div className="space-y-4 mb-6">
              <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="text-white/35 text-xs mb-1">Ник</div>
                <div className="font-mono text-emerald-400">{nick}</div>
              </div>
              <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="text-white/35 text-xs mb-1">Привилегия и сумма</div>
                <div className="font-bold">{modal.priv.name} — {modal.priv.price}</div>
              </div>

              <div>
                <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Скриншот или последние 4 цифры карты (необязательно)</label>
                <textarea
                  value={proofText}
                  onChange={(e) => setProofText(e.target.value)}
                  placeholder="Например: перевёл с карты ...4321 в 14:35"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "white",
                  }}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep("details")}
                className="flex-1 py-3 rounded-xl text-sm font-medium transition-all"
                style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)" }}
              >
                Назад
              </button>
              <button
                onClick={async () => {
                  setSending(true);
                  try {
                    await fetch(NOTIFY_URL, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        nick,
                        privilege: modal.priv.name,
                        price: modal.priv.price,
                        proof: proofText,
                      }),
                    });
                  } catch (e) { console.error(e); }
                  setSending(false);
                  setStep("done");
                }}
                disabled={sending}
                className="flex-1 py-3 rounded-xl font-bold text-sm neon-btn flex items-center justify-center gap-2"
              >
                {sending ? <><Icon name="Loader" size={15} className="animate-spin" />Отправка...</> : "Отправить заявку"}
              </button>
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="animate-fade-in text-center py-4">
            <div
              className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center animate-pulse-glow"
              style={{ background: "rgba(61,220,132,0.15)", border: "2px solid var(--neon-green)" }}
            >
              <Icon name="Check" size={36} className="text-emerald-400" />
            </div>
            <h3 className="font-black text-2xl mb-3 neon-text" style={{ fontFamily: "Montserrat, sans-serif" }}>Заявка принята!</h3>
            <p className="text-white/50 text-sm mb-2">
              Привилегия <span className="text-white font-semibold">{modal.priv.name}</span> для <span className="text-emerald-400 font-mono">{nick}</span>
            </p>
            <p className="text-white/40 text-sm mb-8">
              Мы проверим перевод и зачислим привилегию в течение <span className="text-white">15–60 минут</span>
            </p>
            <div className="p-4 rounded-xl mb-6 text-left" style={{ background: "rgba(61,220,132,0.06)", border: "1px solid rgba(61,220,132,0.2)" }}>
              <div className="text-xs text-white/40 mb-2">Если долго нет ответа:</div>
              <div className="text-sm text-white/70">Напиши нам в Discord с комментарием перевода</div>
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl font-bold text-sm"
              style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.6)" }}
            >
              Закрыть
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Index() {
  const [activeSection, setActiveSection] = useState("home");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [payModal, setPayModal] = useState<PayModal>(null);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setActiveSection(id);
  };

  const copyIP = () => {
    navigator.clipboard.writeText(SERVER_IP);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const particles = Array.from({ length: 18 }, (_, i) => ({
    left: `${(i * 5.5 + 3) % 100}%`,
    top: `${(i * 7.3 + 10) % 100}%`,
    animationDelay: `${(i * 0.3) % 4}s`,
    animationDuration: `${3 + (i % 3)}s`,
    opacity: 0.2 + (i % 5) * 0.1,
  }));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PaymentModal modal={payModal} onClose={() => setPayModal(null)} />
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-xl bg-black/40 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⛏️</span>
          <span className="font-black text-xl tracking-tight" style={{ fontFamily: "Montserrat, sans-serif" }}>
            Vanila<span className="neon-text">Kind</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-1">
          {[
            { id: "home", label: "Главная" },
            { id: "privileges", label: "Спонсор" },
            { id: "about", label: "О сервере" },
            { id: "faq", label: "FAQ" },
          ].map((item) => (
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

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 pt-20 bg-black/95 backdrop-blur-xl flex flex-col items-center gap-6 p-6">
          {[
            { id: "home", label: "Главная" },
            { id: "privileges", label: "Спонсор" },
            { id: "about", label: "О сервере" },
            { id: "faq", label: "FAQ" },
          ].map((item) => (
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

      {/* HERO */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0">
          <img src={HERO_IMG} alt="VanilaKind" className="w-full h-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
          <div className="absolute inset-0 grid-bg" />
        </div>

        <div className="absolute inset-0 pointer-events-none">
          {particles.map((p, i) => (
            <Particle key={i} style={{ left: p.left, top: p.top, animationDelay: p.animationDelay, animationDuration: p.animationDuration, opacity: p.opacity }} />
          ))}
        </div>

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full neon-border text-emerald-400 text-sm font-medium mb-8 animate-slide-up">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            Сервер онлайн · 247 игроков
          </div>

          <h1
            className="text-6xl md:text-8xl font-black mb-6 leading-none animate-slide-up"
            style={{ fontFamily: "Montserrat, sans-serif", animationDelay: "0.1s" }}
          >
            Vanila<span className="neon-text">Kind</span>
          </h1>

          <p className="text-xl md:text-2xl text-white/60 mb-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            Ванильный Minecraft с душой
          </p>
          <p className="text-white/40 mb-12 max-w-lg mx-auto animate-slide-up" style={{ animationDelay: "0.3s" }}>
            Получи привилегию и открой новые возможности на лучшем ванильном сервере
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: "0.4s" }}>
            <button onClick={() => scrollTo("privileges")} className="neon-btn px-8 py-4 rounded-xl text-lg font-bold">
              Стать спонсором
            </button>
            <button
              onClick={copyIP}
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-white/15 text-white/70 hover:border-white/30 hover:text-white transition-all duration-200 font-medium"
            >
              <Icon name="Copy" size={18} />
              {copied ? "Скопировано!" : SERVER_IP}
            </button>
          </div>

          <div className="mt-20 grid grid-cols-3 gap-6 max-w-md mx-auto">
            {[
              { value: 1240, suffix: "+", label: "Игроков" },
              { value: 99, suffix: "%", label: "Аптайм" },
              { value: 3, suffix: " года", label: "Работаем" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <Counter value={stat.value} suffix={stat.suffix} />
                <div className="text-white/40 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-slow">
          <Icon name="ChevronDown" size={24} className="text-white/30" />
        </div>
      </section>

      {/* PRIVILEGES */}
      <section id="privileges" className="py-24 px-6 relative">
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div className="relative max-w-2xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-emerald-400 text-sm font-semibold uppercase tracking-widest">Поддержка</span>
            <h2 className="text-4xl md:text-5xl font-black mt-2" style={{ fontFamily: "Montserrat, sans-serif" }}>
              Стать спонсором
            </h2>
            <p className="text-white/40 mt-4 max-w-md mx-auto">
              Поддержи сервер и получи эксклюзивные привилегии
            </p>
          </div>

          {privileges.map((priv) => (
            <div
              key={priv.id}
              className="relative rounded-3xl p-8 card-hover animate-slide-up"
              style={{
                background: "linear-gradient(135deg, hsl(220 18% 10%), hsl(220 20% 8%))",
                border: "1px solid rgba(61,220,132,0.35)",
                boxShadow: "0 0 60px rgba(61,220,132,0.15), 0 20px 40px rgba(0,0,0,0.4)",
              }}
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-1.5 rounded-full text-xs font-bold bg-emerald-400 text-black whitespace-nowrap tracking-wider uppercase">
                {priv.badge}
              </div>

              <div className="text-center mb-8 pt-2">
                <div className="text-6xl mb-4">💎</div>
                <h3 className="text-3xl font-black mb-2" style={{ fontFamily: "Montserrat, sans-serif" }}>{priv.name}</h3>
                <div className="text-5xl font-black neon-text mb-1">{priv.price}</div>
                <div className="text-white/30 text-sm">в месяц</div>
              </div>

              <ul className="space-y-4 mb-8 max-w-sm mx-auto">
                {priv.perks.map((perk) => (
                  <li key={perk} className="flex items-center gap-3 text-white/80">
                    <div className="w-6 h-6 rounded-full bg-emerald-400/15 flex items-center justify-center shrink-0">
                      <Icon name="Check" size={13} className="text-emerald-400" />
                    </div>
                    <span className="text-sm font-medium">{perk}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => setPayModal({ priv })}
                className="w-full py-4 rounded-2xl font-bold text-base neon-btn flex items-center justify-center gap-2"
              >
                <Icon name="Heart" size={17} />
                Стать спонсором
              </button>
            </div>
          ))}

          <div className="mt-6 text-center text-white/30 text-sm flex items-center justify-center gap-2">
            <Icon name="Zap" size={14} className="text-emerald-400" />
            Привилегии выдаются вручную в течение часа после оплаты
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="relative max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-emerald-400 text-sm font-semibold uppercase tracking-widest">О нас</span>
              <h2 className="text-4xl md:text-5xl font-black mt-2 mb-6" style={{ fontFamily: "Montserrat, sans-serif" }}>
                Что такое<br /><span className="neon-text">VanilaKind?</span>
              </h2>
              <p className="text-white/60 mb-6 leading-relaxed">
                VanilaKind — это ванильный Minecraft сервер с сохранением духа оригинальной игры.
                Мы не добавляем лишних плагинов — только то, что делает игру комфортнее.
              </p>
              <p className="text-white/60 mb-10 leading-relaxed">
                Работаем уже 3 года, и за это время собрали живое и дружелюбное сообщество из 1000+
                игроков. У нас честная экономика и активная администрация.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: "Shield", label: "Защита от гриферов" },
                  { icon: "Zap", label: "Низкий пинг" },
                  { icon: "Users", label: "Живое сообщество" },
                  { icon: "RefreshCw", label: "Бэкапы каждый час" },
                ].map((feature) => (
                  <div
                    key={feature.label}
                    className="flex items-center gap-3 p-3 rounded-xl border border-white/8"
                    style={{ background: "rgba(255,255,255,0.03)" }}
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-400/10 flex items-center justify-center shrink-0">
                      <Icon name={feature.icon} fallback="Star" size={16} className="text-emerald-400" />
                    </div>
                    <span className="text-sm font-medium text-white/80">{feature.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="rounded-2xl overflow-hidden neon-border">
                <img src={CARD_IMG} alt="VanilaKind" className="w-full h-80 object-cover" />
              </div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-2xl neon-border flex flex-col items-center justify-center" style={{ background: "hsl(220 20% 6%)" }}>
                <div className="text-2xl font-black neon-text">247</div>
                <div className="text-white/40 text-xs">онлайн</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-emerald-400 text-sm font-semibold uppercase tracking-widest">Поддержка</span>
            <h2 className="text-4xl md:text-5xl font-black mt-2" style={{ fontFamily: "Montserrat, sans-serif" }}>
              Частые вопросы
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl neon-border overflow-hidden transition-all duration-300 card-hover"
                style={{ background: "hsl(220 18% 9%)" }}
              >
                <button
                  className="w-full flex items-center justify-between p-6 text-left"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                >
                  <span className="font-semibold text-white/90 pr-4">{faq.q}</span>
                  <Icon
                    name="ChevronDown"
                    size={18}
                    className={`shrink-0 text-emerald-400 transition-transform duration-300 ${openFaq === idx ? "rotate-180" : ""}`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-6 text-white/50 leading-relaxed border-t border-white/5 pt-4 animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 text-center p-8 rounded-2xl neon-border" style={{ background: "hsl(220 18% 9%)" }}>
            <div className="text-4xl mb-4">💬</div>
            <h3 className="font-black text-xl mb-2" style={{ fontFamily: "Montserrat, sans-serif" }}>Остались вопросы?</h3>
            <p className="text-white/40 mb-6">Напишите нам в Discord или VK — ответим быстро</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <button className="neon-btn px-6 py-3 rounded-xl font-bold text-sm">Discord</button>
              <button className="px-6 py-3 rounded-xl border border-white/15 text-white/70 hover:border-white/30 hover:text-white transition-all duration-200 text-sm font-medium">
                ВКонтакте
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xl">⛏️</span>
            <span className="font-black" style={{ fontFamily: "Montserrat, sans-serif" }}>
              Vanila<span className="neon-text">Kind</span>
            </span>
          </div>
          <div className="text-white/30 text-sm text-center">
            Это фан-сайт. Minecraft принадлежит Mojang © Microsoft.
          </div>
          <button
            onClick={copyIP}
            className="flex items-center gap-2 text-emerald-400/60 hover:text-emerald-400 transition-colors text-sm font-mono"
          >
            <Icon name="Server" size={14} />
            {SERVER_IP}
          </button>
        </div>
      </footer>
    </div>
  );
}
import { useState } from "react";
import Icon from "@/components/ui/icon";

const BANK_DETAILS = {
  card: "2202 2081 3455 9450",
  bank: "Сбербанк",
  name: "Иван В.",
  sbp: "+7 (992) 344-76-17",
};

const NOTIFY_URL = "https://functions.poehali.dev/d51daf2f-e0a9-4f6d-9d4b-8e7b97d6ff1d";

export type Privilege = {
  id: number;
  name: string;
  price: string;
  badge: string | null;
  perks: string[];
};

export type PayModal = { priv: Privilege } | null;

export default function PaymentModal({ modal, onClose }: { modal: PayModal; onClose: () => void }) {
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

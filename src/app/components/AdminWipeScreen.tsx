import { useState } from "react";
import { projectId, publicAnonKey } from "/utils/supabase/info";

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-8f0246f6`;

type WipeStatus = "idle" | "loading" | "success" | "error";

export default function AdminWipeScreen() {
  const [secret, setSecret] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [status, setStatus] = useState<WipeStatus>("idle");
  const [result, setResult] = useState<{
    wipedAt?: string;
    affectedGameData?: number;
    affectedProfiles?: number;
    error?: string;
  } | null>(null);
  const [showForm, setShowForm] = useState(false);

  const CONFIRM_PHRASE = "CONFIRMAR WIPE";

  const handleWipe = async () => {
    if (confirmation !== CONFIRM_PHRASE) return;
    if (!secret.trim()) return;

    setStatus("loading");
    setResult(null);

    try {
      const res = await fetch(`${SERVER_URL}/admin/wipe`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
          "X-Admin-Secret": secret,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setResult({ error: data.error ?? "Erro desconhecido" });
      } else {
        setStatus("success");
        setResult({
          wipedAt: data.wipedAt,
          affectedGameData: data.affectedGameData,
          affectedProfiles: data.affectedProfiles,
        });
        setSecret("");
        setConfirmation("");
      }
    } catch (e: any) {
      setStatus("error");
      setResult({ error: "Erro de conexão: " + e.message });
    }
  };

  const canExecute = confirmation === CONFIRM_PHRASE && secret.trim().length > 0 && status !== "loading";

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">⚔️</div>
        <h1 className="text-3xl font-bold text-red-400 font-mono mb-2">
          TASKLAND ADMIN
        </h1>
        <p className="text-gray-400 font-mono text-sm">Painel de Administração — Área Restrita</p>
      </div>

      {/* Warning box */}
      <div className="w-full max-w-lg bg-red-950/40 border border-red-700 rounded-xl p-5 mb-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">⚠️</span>
          <h2 className="text-red-400 font-bold font-mono text-lg">WIPE GLOBAL DE JOGADORES</h2>
        </div>
        <ul className="text-red-300 font-mono text-sm space-y-1">
          <li>• Reseta <strong>nível e poder</strong> de todos os jogadores para o estado inicial</li>
          <li>• Zera missões, desafios, hábitos e XP de todos</li>
          <li>• Reseta economia, renascimento e histórico completo</li>
          <li>• Todos os jogadores voltam ao <strong>Rank F · Power 75 · Nível 1</strong></li>
          <li>• Nomes, e-mails e amizades são preservados</li>
          <li>• Esta ação é <strong>IRREVERSÍVEL</strong></li>
        </ul>
      </div>

      {/* Success box */}
      {status === "success" && result && (
        <div className="w-full max-w-lg bg-green-950/40 border border-green-600 rounded-xl p-5 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">✅</span>
            <h3 className="text-green-400 font-bold font-mono">WIPE EXECUTADO COM SUCESSO</h3>
          </div>
          <div className="font-mono text-sm text-green-300 space-y-1">
            <p>🕐 Executado em: <span className="text-white">{result.wipedAt ? new Date(result.wipedAt).toLocaleString("pt-BR") : "—"}</span></p>
            <p>🎮 Perfis de jogo resetados: <span className="text-white">{result.affectedGameData ?? "—"}</span></p>
            <p>👤 Perfis de usuário atualizados: <span className="text-white">{result.affectedProfiles ?? "—"}</span></p>
          </div>
          <p className="mt-3 text-xs text-green-500 font-mono">
            Todos os jogadores receberão o reset ao fazer login ou na próxima sincronização automática.
          </p>
        </div>
      )}

      {/* Error box */}
      {status === "error" && result?.error && (
        <div className="w-full max-w-lg bg-red-950/50 border border-red-600 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span>❌</span>
            <span className="text-red-400 font-mono font-bold text-sm">ERRO</span>
          </div>
          <p className="text-red-300 font-mono text-sm">{result.error}</p>
        </div>
      )}

      {/* Form */}
      {!showForm && status !== "success" ? (
        <button
          onClick={() => setShowForm(true)}
          className="bg-red-800 hover:bg-red-700 text-white font-mono font-bold px-8 py-3 rounded-lg border border-red-600 transition-colors"
        >
          🔓 Acessar Painel de Wipe
        </button>
      ) : status !== "success" ? (
        <div className="w-full max-w-lg space-y-4">
          {/* Secret input */}
          <div>
            <label className="block text-xs text-gray-400 font-mono mb-1 uppercase tracking-widest">
              Segredo de Admin (ADMIN_WIPE_SECRET)
            </label>
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Digite o segredo de admin..."
              className="w-full bg-gray-900 border border-gray-700 text-white font-mono text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 placeholder-gray-600"
            />
          </div>

          {/* Confirmation phrase */}
          <div>
            <label className="block text-xs text-gray-400 font-mono mb-1 uppercase tracking-widest">
              Digite exatamente para confirmar:
            </label>
            <div className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 mb-2 font-mono text-yellow-400 text-sm select-all">
              {CONFIRM_PHRASE}
            </div>
            <input
              type="text"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder={`Digite: ${CONFIRM_PHRASE}`}
              className="w-full bg-gray-900 border border-gray-700 text-white font-mono text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 placeholder-gray-600"
            />
            {confirmation.length > 0 && confirmation !== CONFIRM_PHRASE && (
              <p className="text-red-500 text-xs font-mono mt-1">
                ✗ Texto não corresponde
              </p>
            )}
            {confirmation === CONFIRM_PHRASE && (
              <p className="text-green-500 text-xs font-mono mt-1">
                ✓ Confirmação correta
              </p>
            )}
          </div>

          {/* Execute button */}
          <button
            onClick={handleWipe}
            disabled={!canExecute}
            className={`w-full font-mono font-bold py-4 rounded-lg border text-lg transition-all ${
              canExecute
                ? "bg-red-700 hover:bg-red-600 border-red-500 text-white cursor-pointer"
                : "bg-gray-800 border-gray-700 text-gray-600 cursor-not-allowed"
            }`}
          >
            {status === "loading" ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Executando Wipe...
              </span>
            ) : (
              "💀 EXECUTAR WIPE GLOBAL"
            )}
          </button>

          <button
            onClick={() => { setShowForm(false); setStatus("idle"); setResult(null); setSecret(""); setConfirmation(""); }}
            className="w-full text-gray-500 hover:text-gray-300 font-mono text-sm py-2 transition-colors"
          >
            Cancelar
          </button>
        </div>
      ) : status === "success" ? (
        <button
          onClick={() => { setStatus("idle"); setResult(null); setShowForm(false); }}
          className="bg-gray-800 hover:bg-gray-700 text-white font-mono px-6 py-2 rounded-lg border border-gray-600 transition-colors text-sm"
        >
          ← Voltar
        </button>
      ) : null}

      {/* Footer */}
      <div className="mt-12 text-center">
        <p className="text-gray-700 font-mono text-xs">
          TaskLand Admin Panel · Acesso Restrito ao Administrador
        </p>
      </div>
    </div>
  );
}
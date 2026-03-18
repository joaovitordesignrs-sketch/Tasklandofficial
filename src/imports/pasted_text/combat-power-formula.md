O Combat Power (CP) é o número final que o usuário vê na tela, representando o quão forte seu personagem está naquele momento. Ele não é o multiplicador em si, mas a tradução visual e funcional do multiplicador de Power em um número inteiro compreensível.

CP = DanoBase × PowerTotal
O usuário nunca vê "seu multiplicador é 2.43x". Ele vê:

Combat Power: 1.847
Esse número cresce conforme os multiplicadores crescem, e é o que aparece na interface.

2. Dano Base como Âncora do CP
O Dano Base é o ponto de partida fixo do sistema. Sem nenhum multiplicador, o personagem causa exatamente esse valor por task.

Dificuldade da Task	Dano Base
Fácil	30
Média	50
Difícil	75

Exportar

Copiar
O CP é calculado sobre a task Difícil como referência padrão de exibição, pois representa o teto de dano do usuário.

CP = 75 × PowerTotal
Isso significa que um usuário com Power 2.43x tem CP = 75 × 2.43 = 182.

3. Fórmula Completa do Power Total
PowerTotal = MH × MN × MC × MR
Onde:

Símbolo	Nome	Fonte
MH	Multiplicador de Hábitos	Hábitos ativos com streak
MN	Multiplicador de Nível	Nível do personagem na run atual
MC	Multiplicador de Classe	Classe + tipo de atividade
MR	Multiplicador de Rebirth	Conquistas descongeladas

Exportar

Copiar
4. Cada Multiplicador em Detalhe
4.1. Multiplicador de Hábitos (MH)
MH = 1 + (HábitosAtivos × 0.05)
Cap: 5 hábitos → MH máximo = 1.25
Hábitos Ativos	MH
0	1.00
1	1.05
3	1.15
5	1.25

Exportar

Copiar
4.2. Multiplicador de Nível (MN)
MN = 1 + (Nível × 0.03)
Nível	MN
1	1.03
5	1.15
10	1.30
20	1.60
30	1.90

Exportar

Copiar
4.3. Multiplicador de Classe (MC)
Ativo apenas dentro do contexto específico de cada classe:

Classe	Contexto de Bônus	MC
Guerreiro	Desafios de Tempo	1.20
Guerreiro	Fora do contexto	1.00
Mago	Modo Foco	1.25
Mago	Fora do contexto	1.00

Exportar

Copiar
4.4. Multiplicador de Rebirth (MR)
MR = 1.0 + Σ(Conquistas descongeladas)
Tier	Valor por Conquista
Bronze	+0.10
Prata	+0.15
Ouro	+0.20
Diamante	+0.40
Lendário	+0.60

Exportar

Copiar
5. Cálculo de CP em Cenários Reais
Cenário 1 — Usuário Novo (Run 1, Sem Rebirth)
Hábitos ativos: 2         → MH = 1.10
Nível: 3                  → MN = 1.09
Classe: Guerreiro (fora)  → MC = 1.00
Rebirth: nenhum           → MR = 1.00

PowerTotal = 1.10 × 1.09 × 1.00 × 1.00 = 1.199
CP = 75 × 1.199 = 89
Cenário 2 — Usuário Intermediário (Run 2, 1 Rebirth)
Hábitos ativos: 4         → MH = 1.20
Nível: 10                 → MN = 1.30
Classe: Mago (Modo Foco)  → MC = 1.25
Rebirth: 3 Bronze + 1 Prata → MR = 1.0 + 0.30 + 0.15 = 1.45

PowerTotal = 1.20 × 1.30 × 1.25 × 1.45 = 2.827
CP = 75 × 2.827 = 212
Cenário 3 — Hard User (Run 5, 4 Rebirths)
Hábitos ativos: 5         → MH = 1.25
Nível: 20                 → MN = 1.60
Classe: Mago (Modo Foco)  → MC = 1.25
Rebirth acumulado:
  6 Bronze  → +0.60
  4 Prata   → +0.60
  2 Ouro    → +0.40
  1 Diamante → +0.40
  MR = 1.0 + 2.00 = 3.00

PowerTotal = 1.25 × 1.60 × 1.25 × 3.00 = 7.50
CP = 75 × 7.50 = 562
6. Tabela de Referência de CP por Fase do Jogo
Para balancear os monstros em relação ao CP do usuário:

Fase do Jogo	CP Esperado	HP do Monstro Fraco	HP do Boss
Run 1 – Início	75–100	75	262
Run 1 – Mid	100–150	112	393
Run 2 – Início	150–200	150	525
Run 3+	300–500	225	787
Hard User	500–800	375	1.312

Exportar

Copiar
Os monstros escalam junto com o CP esperado por fase, mantendo a proporção de tasks necessárias consistente.

7. Exibição na Interface
7.1. O que o usuário vê
┌──────────────────────────────┐
│  ⚔ Combat Power: 212         │
│                              │
│  Hábitos    × 1.20           │
│  Nível      × 1.30           │
│  Classe     × 1.25           │
│  Rebirth    × 1.45           │
└──────────────────────────────┘
O CP principal é o número em destaque.
Abaixo, um breakdown dos multiplicadores (expansível ou em tooltip).
7.2. Feedback ao usuário
CP subiu: animação sutil de "power up" quando um hábito é marcado ou nível sobe.
CP congelado (conquistas): ícone de "congelado" ao lado das conquistas ainda não descongeladas, com tooltip "Disponível no próximo Rebirth".
Tela de Rebirth: mostra CP atual vs. CP projetado após rebirth.
8. Estrutura de Dados
typescript
Copiar

interface CombatPowerState {
  // Multiplicadores
  habitMultiplier: number;      // MH
  levelMultiplier: number;      // MN
  classMultiplier: number;      // MC (contextual)
  rebirthMultiplier: number;    // MR (permanente)

  // Resultado
  powerTotal: number;           // Produto dos 4
  combatPower: number;          // 75 × powerTotal

  // Conquistas
  frozenAchievements: {
    tier: 'bronze' | 'silver' | 'gold' | 'diamond' | 'legendary';
    value: number;
  }[];
  frozenTotal: number;          // Soma dos valores congelados
}

function calculateCP(state: CombatPowerState): number {
  const power =
    state.habitMultiplier *
    state.levelMultiplier *
    state.classMultiplier *
    state.rebirthMultiplier;

  return Math.floor(75 * power);
}

function calculatePostRebirthMR(state: CombatPowerState): number {
  return state.rebirthMultiplier + state.frozenTotal;
}
9. Resumo do Sistema
CP = 75 × (MH × MN × MC × MR)

MH  → Hábitos ativos (máx 1.25)
MN  → Nível da run atual (cresce 0.03/nível)
MC  → Classe + contexto (1.20 ou 1.25 quando ativo)
MR  → Rebirth permanente (começa 1.0, cresce com conquistas)
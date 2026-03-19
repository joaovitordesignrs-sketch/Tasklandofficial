# TaskLand

Um gerenciador de tarefas com mecânicas de RPG. Complete tarefas, cause dano a monstros, suba de nível e evolua seu personagem.

---

## O que é

TaskLand transforma produtividade em combate. Cada tarefa concluída causa dano a um monstro na arena. Quanto mais difícil a tarefa, mais dano você causa. Derrote monstros para ganhar XP e moedas, suba de nível e desbloqueie classes, pets e conquistas.

### Mecânicas principais

**Arena & Combate**
- Cada tarefa completada dispara um ataque contra o monstro atual
- Dano = `DanoBase × Power`, onde Power = `MH × MN × MC × MR`
- 5 tipos de monstros: fraco, normal, forte, bônus de XP e boss
- Derrotar um boss dá recompensa maior em moedas e XP

**Classes de Personagem**
| Classe | Habilidade |
|--------|-----------|
| Guerreiro | Última tarefa do dia causa +30% de dano |
| Mago | Tarefas difíceis concedem +15% de XP |

**Sistema de Power (multiplicadores)**
| Multiplicador | Fonte |
|---|---|
| MH — Hábitos | +2% por hábito ativo (máx ~20%) |
| MN — Nível | Escala logarítmica com o nível do personagem |
| MC — Classe | Bônus passivo da classe + modo ativo (Temporal/Foco) |
| MR — Rebirth | Cristaliza bônus de conquistas de runs anteriores |

**Hábitos**
- Hábitos diários com sistema de streak
- Cada check-in de hábito aumenta o multiplicador MH
- Hábitos com mais de 100 dias de streak desbloqueiam conquistas lendárias

**Conquistas**
- 5 tiers: Bronze → Prata → Ouro → Diamante → Lendário
- Categorias: Tarefas, Monstros, Bosses, Hábitos, Nível, Tempo, Hardcore
- Conquistas lendárias podem conceder títulos exclusivos (ex: "Saitama")

**Pets**
| Pet | Custo | Efeito |
|-----|-------|--------|
| Dragãozinho | 500 moedas | +5 moedas por tarefa concluída |
| Slime Tático | 800 moedas | +10% chance de moedas duplicadas |
| Fênix | 2.000 moedas | Revive 1 tarefa falhada por dia |

**Rebirth (Renascer)**
- Sistema roguelike: reinicia o progresso preservando conquistas
- Conquistas desbloqueadas cristalizam como bônus permanente de dano (MR)
- Hábitos, moedas, classes e pets são mantidos após o rebirth

**Desafios**
- Missões especiais com objetivos e recompensas fixas
- Incluem desafios de tempo para bônus de XP

**Social**
- Sistema de amigos com perfis públicos
- Ranking por nível

---

## Telas

| Rota | Tela |
|------|------|
| `/` | Arena — lista de tarefas + combate em tempo real |
| `/desafios` | Desafios especiais e missões |
| `/perfil` | Perfil do jogador — stats, rank, power spider chart, rebirth |
| `/habitos` | Gerenciamento de hábitos diários |
| `/conquistas` | Vitrine de conquistas por categoria |
| `/configuracoes` | Áudio, classe, pet, conta |
| `/amigos` | Lista de amigos e ranking |
| `/classe` | Seleção de classe (abre no início de cada run) |
| `/design_system` | Visualização do design system interno |
| `/admin-wipe` | Painel de reset de dados (dev only) |

---

## Stack

- **React 18** + **Vite 6** + **TypeScript**
- **Tailwind CSS v4** + sistema de design próprio com tokens (`src/app/data/tokens.ts`)
- **React Router v7** — SPA com roteamento por `createBrowserRouter`
- **Radix UI** — primitivos de acessibilidade (Dialog, Select, Tabs, etc.)
- **Supabase** — autenticação e sincronização de estado na nuvem
- **Lucide React** — ícones (via `PixelIcon`)
- **Press Start 2P** + **VT323** — fontes pixel-art (Google Fonts)
- `canvas-confetti` — animações de level up e conquistas
- `recharts` — gráficos de progresso
- `react-dnd` — reordenação de tarefas por drag-and-drop

---

## Estrutura do projeto

```
src/
├── app/
│   ├── components/         # Telas e componentes de UI
│   │   └── ui/             # Design system: RpgButton, PixelCard, PixelTabs, PageShell…
│   ├── data/               # Lógica de negócio e estado
│   │   ├── tokens.ts       # Tokens de design (cores, tipografia, espaçamento)
│   │   ├── gameEngine.ts   # Cálculo de dano, XP e progressão
│   │   ├── economy.ts      # Moedas, classes, pets, conquistas, rebirth
│   │   ├── missions.ts     # Tarefas, missões e monstros
│   │   ├── habits.ts       # Sistema de hábitos e streaks
│   │   ├── challenges.ts   # Desafios especiais
│   │   ├── combatPower.ts  # Multiplicadores de poder (MH, MN, MC, MR)
│   │   └── supabaseClient.ts
│   ├── hooks/              # Hooks customizados (audioManager, useIsDesktop…)
│   └── routes.ts           # Definição de rotas
└── assets/                 # Imagens e sprites
```

---

## Como rodar

```bash
npm install
npm run dev
```

O servidor sobe em `http://localhost:5173`.

```bash
npm run build   # Build de produção
```

---

## Design System

Consulte [`STYLE_GUIDE.md`](./STYLE_GUIDE.md) para referência completa de tokens e componentes.

Regra: nenhum valor solto de cor, fonte ou espaçamento no código — tudo via tokens de `src/app/data/tokens.ts`.

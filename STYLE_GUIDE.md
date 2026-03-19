# TaskLand — Style Guide

> Fonte única de verdade para tokens de design e componentes do sistema.
> **Toda cor, tipografia, espaçamento, radius e componente interativo deve referenciar este documento.**
> Valores soltos (ex: `#123456`, `18px`, `<button>`) não são permitidos fora dos próprios arquivos de componente.

---

## 1. Tokens de Cor

### 1.1 Fundos (Backgrounds)

| Token | Valor | Uso |
|---|---|---|
| `BG_DEEPEST` | `#0b0d1e` | Fundo mais escuro — nav, modais, scrollbar |
| `BG_CARD` | `#0d1024` | Superfície de card / painel |
| `BG_PAGE` | `#15182d` | Fundo de página (PageShell) |

### 1.2 Bordas

| Token | Valor | Uso |
|---|---|---|
| `BORDER_SUBTLE` | `#1f254f` | Bordas sutis — cards, nav |
| `BORDER_ELEVATED` | `#2a2e50` | Bordas elevadas — inputs, divisores internos |

### 1.3 Accent Principal

| Token | Valor | Uso |
|---|---|---|
| `ACCENT_GOLD` | `#e39f64` | Cor primária do produto — ouro RPG |
| `ACCENT_SHADOW` | `#b07830` | Pixel drop-shadow do PixelCard |
| `ACCENT_GOLD_DIM` | `rgba(227,159,100,0.18)` | Fundo de tab ativa |

### 1.4 Semânticas

| Token | Valor | Uso |
|---|---|---|
| `COLOR_DANGER` | `#E63946` | HP bar, dificuldade difícil, ações destrutivas |
| `COLOR_SUCCESS` | `#06FFA5` | Dificuldade fácil, ganhos, check-ins |
| `COLOR_WARNING` | `#f0c040` | Dificuldade média, alertas |
| `COLOR_ORANGE` | `#FF6B35` | Hábitos, modo temporal, rank Lendário |

### 1.5 Cores de Classe

| Token | Valor | Uso |
|---|---|---|
| `COLOR_MAGE` | `#c084fc` | Classe Mago, modo foco |
| `COLOR_WARRIOR` | `#60a5fa` | Classe Guerreiro, modo temporal |
| `COLOR_LEGENDARY` | `#FFD700` | Rank Lendário, colecionáveis |

### 1.6 Escala de Texto

| Token | Valor | Uso |
|---|---|---|
| `TEXT_INACTIVE` | `#3a4060` | Nav inativo, itens bloqueados |
| `TEXT_MUTED` | `#5a6080` | Subtítulos, labels secundários |
| `TEXT_BODY` | `#94a3b8` | Corpo de texto, descrições |
| `TEXT_LIGHT` | `#c8d0f0` | Texto principal legível |

### 1.7 Cores de Rank

| Token | Referência | Rank |
|---|---|---|
| `RANK_NOVATO` | `#8a7a6a` | Novato |
| `RANK_VETERANO` | `#8a9fba` | Veterano |
| `RANK_GUERREIRO` | `ACCENT_GOLD` | Guerreiro |
| `RANK_RARO` | `COLOR_SUCCESS` | Raro |
| `RANK_MESTRE` | `COLOR_WARRIOR` | Mestre |
| `RANK_EPICO` | `COLOR_MAGE` | Épico |
| `RANK_LENDARIO` | `COLOR_ORANGE` | Lendário |

### 1.8 Helper de Transparência

```ts
alpha(color: string, hex2: string): string
// Exemplo: alpha(COLOR_MAGE, "22") → "#c084fc22"
// Sempre usar este helper em vez de escrever opacidade manualmente.
```

---

## 2. Tokens de Tipografia

### 2.1 Famílias de Fonte

| Token | Valor | Uso |
|---|---|---|
| `FONT_PIXEL` | `'Press Start 2P', monospace` | Títulos, labels RPG, botões principais |
| `FONT_BODY` | `'VT323', monospace` | Corpo de texto, valores, descrições |

### 2.2 Tamanhos — Press Start 2P (`PX_*`)

| Token | Valor (px) | Uso |
|---|---|---|
| `PX_XL` | 13 | Título de página (desktop) |
| `PX_MD` | 10 | Título de página (mobile) / cabeçalhos de seção |
| `PX_SM` | 9 | Sub-seções |
| `PX_XS` | 8 | Labels, slider de volume |
| `PX_2XS` | 7 | Labels de tab, tags, itens de nav |
| `PX_3XS` | 6 | Micro-labels, spec-tags |
| `PX_4XS` | 5 | Anotações de debug |

### 2.3 Tamanhos — VT323 (`VT_*`)

| Token | Valor (px) | Uso |
|---|---|---|
| `VT_2XL` | 24 | Nomes de monstros, stats grandes |
| `VT_XL` | 20 | Nomes de tarefas, valores de HP |
| `VT_LG` | 18 | Texto de botões, chips, badges |
| `VT_MD` | 16 | Chips de dificuldade, descrições |
| `VT_SM` | 14 | Info secundária, labels pequenos |
| `VT_XS` | 13 | Micro info, multiplicadores no spider chart |

---

## 3. Tokens de Espaçamento (`SP_*`)

| Token | Valor (px) | Equivalente |
|---|---|---|
| `SP_XS` | 4 | gap mínimo |
| `SP_SM` | 8 | gap padrão entre itens |
| `SP_MD` | 12 | padding interno de seção |
| `SP_LG` | 16 | padding padrão de card |
| `SP_XL` | 20 | padding de página mobile |
| `SP_2XL` | 24 | padding de página desktop |

---

## 4. Tokens de Border Radius (`RADIUS_*`)

| Token | Valor (px) | Uso |
|---|---|---|
| `RADIUS_SM` | 4 | Chips de dificuldade, toggles |
| `RADIUS_MD` | 6 | Botões, inputs pequenos |
| `RADIUS_LG` | 8 | Cards, modais, botões dashed |
| `RADIUS_XL` | 10 | Cards grandes, header card do PageShell |
| `RADIUS_PILL` | 20 | Tags de badge, pill buttons |

---

## 5. Componentes

> Arquivo de origem: `src/app/components/ui/`

---

### 5.1 `RpgButton`

**Arquivo:** `ui/RpgButton.tsx`
**Descrição:** Botão raiz do sistema. Todo elemento interativo de botão deve usar este componente.

#### Props

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `variant` | `"primary" \| "ghost" \| "dashed" \| "toggle" \| "icon"` | `"primary"` | Visual do botão |
| `color` | `string` (token) | `ACCENT_GOLD` | Cor accent — sempre usar um token |
| `fullWidth` | `boolean` | `false` | Botão de largura total |
| `small` | `boolean` | `false` | Padding compacto |
| `bodyFont` | `boolean` | `false` | Usa `FONT_BODY` em vez de `FONT_PIXEL` |
| `disabled` | `boolean` | `false` | Estado desabilitado |
| `isOn` | `boolean` | — | Estado ON/OFF (apenas `toggle`) |
| `onClick` | `fn` | — | Handler de clique |

#### Variantes

| Variante | Quando usar |
|---|---|
| `primary` | Ação principal — fundo semi-transparente + borda sólida |
| `ghost` | Ação secundária — fundo transparente + borda sólida |
| `dashed` | CTA de "adicionar novo item" — borda tracejada |
| `toggle` | Switch ON/OFF em configurações |
| `icon` | Botão apenas com ícone (deletar, fechar) — sem borda nem fundo |

#### Exemplos de uso

```tsx
// Ação primária com cor de classe
<RpgButton variant="primary" color={ACCENT_GOLD}>SALVAR</RpgButton>

// Ação destrutiva
<RpgButton variant="ghost" color={COLOR_DANGER}>SAIR</RpgButton>

// Adicionar item (CTA dashed, largura total)
<RpgButton variant="dashed" color={COLOR_MAGE} fullWidth>+ NOVA TAREFA</RpgButton>

// Toggle de configuração
<RpgButton variant="toggle" color={COLOR_SUCCESS} isOn={ativado}>SOM</RpgButton>

// Botão de ícone
<RpgButton variant="icon" color={COLOR_DANGER}><Trash2 size={14} /></RpgButton>
```

---

### 5.2 `PixelCard`

**Arquivo:** `ui/PixelCard.tsx`
**Descrição:** Card com corners estilo pixel-art (staircase clip-path). Usado para destacar conteúdo com identidade visual RPG.

#### Props

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `borderColor` | `string` (token) | `ACCENT_GOLD` | Cor da borda pixel |
| `shadowColor` | `string` (token) | `ACCENT_SHADOW` | Cor do drop-shadow |
| `bg` | `string` (token) | `BG_CARD` | Background do card |
| `padding` | `string \| number` | `"20px"` | Padding interno |
| `wrapperStyle` | `CSSProperties` | — | Estilo extra no wrapper |
| `contentStyle` | `CSSProperties` | — | Estilo extra no conteúdo |
| `onClick` | `fn` | — | Torna o card clicável |

#### Exemplo

```tsx
<PixelCard borderColor={ACCENT_GOLD} shadowColor={ACCENT_SHADOW} bg={BG_CARD} padding={SP_LG}>
  {/* conteúdo */}
</PixelCard>
```

---

### 5.3 `PixelTabs`

**Arquivo:** `ui/PixelTabs.tsx`
**Descrição:** Tab-bar padrão do app com estética pixel RPG. Usada em todas as telas com múltiplas seções.

#### Props

| Prop | Tipo | Descrição |
|---|---|---|
| `tabs` | `PixelTabDef[]` | Definição das tabs (key, label, Icon, color) |
| `active` | `string` | Key da tab ativa |
| `onSelect` | `fn` | Callback ao trocar de tab |
| `style` | `CSSProperties` | Estilo extra no container |

#### `PixelTabDef`

```ts
interface PixelTabDef<T extends string = string> {
  key: T;
  label: string;
  Icon: React.ComponentType<{ size?: number }>; // Lucide icon
  color: string; // token de cor
}
```

#### Exemplo

```tsx
<PixelTabs
  tabs={[
    { key: "stats", label: "STATS", Icon: BarChart2, color: ACCENT_GOLD },
    { key: "skills", label: "SKILLS", Icon: Zap, color: COLOR_MAGE },
  ]}
  active={tab}
  onSelect={setTab}
/>
```

---

### 5.4 `PageShell`

**Arquivo:** `ui/PageShell.tsx`
**Descrição:** Wrapper padrão para todas as rotas/telas do painel direito. Fornece fundo, grid overlay e header card com ícone + título.

#### Props

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `icon` | `ReactNode` | — | Ícone do header (Lucide recomendado) |
| `title` | `string` | — | Título da página (FONT_PIXEL) |
| `accentColor` | `string` (token) | `ACCENT_GOLD` | Cor da borda esquerda e texto do header |
| `badge` | `ReactNode` | — | Badge opcional no lado direito do header |
| `children` | `ReactNode` | — | Conteúdo da página |

#### Exemplo

```tsx
<PageShell icon={<Trophy size={18} />} title="CONQUISTAS" accentColor={COLOR_WARNING}>
  {/* conteúdo */}
</PageShell>
```

---

### 5.5 `CardIn`

**Arquivo:** `ui/CardIn.tsx`
**Descrição:** Wrapper de animação de entrada para cards. Aplica translateY + scale + fade staggerado por índice.

#### Uso como componente

```tsx
<CardIn index={0}><MeuCard /></CardIn>
<CardIn index={1}><MeuCard /></CardIn>
```

#### Uso como estilo inline

```tsx
import { cardInStyle } from "./ui/CardIn";
<div style={cardInStyle(index)}>{/* ... */}</div>
```

---

### 5.6 `DifficultyPicker`

**Arquivo:** `ui/DifficultyPicker.tsx`
**Descrição:** Seletor padronizado de dificuldade (Fácil / Médio / Difícil). Único — não duplicar este UI.

#### Props

| Prop | Tipo | Descrição |
|---|---|---|
| `value` | `TaskDifficulty` | Valor atual (`"easy"` \| `"medium"` \| `"hard"`) |
| `onChange` | `fn` | Callback ao mudar dificuldade |

#### Exemplo

```tsx
<DifficultyPicker value={diff} onChange={setDiff} />
```

---

### 5.7 `FloatingDamage`

**Arquivo:** `ui/FloatingDamage.tsx`
**Descrição:** Números de dano flutuantes sobre a arena. Escalam visualmente com a magnitude do dano.

#### Props

| Prop | Tipo | Descrição |
|---|---|---|
| `numbers` | `DamageNumber[]` | Array de `{ id: number, amount: number }` |

#### Referência de cores internas (automática)

| Dano | Cor usada |
|---|---|
| ≥ 300 | `#ff2d55` (crítico extremo) |
| ≥ 150 | `COLOR_DANGER` |
| ≥ 80 | `COLOR_LEGENDARY` |
| ≥ 40 | `COLOR_ORANGE` |
| ≥ 20 | `COLOR_SUCCESS` |
| < 20 | `RANK_VETERANO` |

---

### 5.8 `PixelIcon`

**Arquivo:** `ui/PixelIcon.tsx`
**Descrição:** Resolver central de ícones Lucide para o app. Usar sempre no lugar de emojis crus para manter coerência visual.

#### Props

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `name` | `string` | — | Chave Lucide (`"timer"`, `"skull"`) ou emoji (`"⏱️"`) |
| `size` | `number` | 16 | Tamanho do ícone |
| `color` | `string` (token) | `"currentColor"` | Cor do ícone |

#### Ícones registrados

`timer`, `skull`, `trophy`, `star`, `medal`, `rotate-ccw`, `brain`, `swords`, `shield`, `volume2`, `user`, `map`, `gem`, `coins`, `castle`, `flame`, `droplets`, `book-open`, `dumbbell`, `apple`, `moon`, `pen-line`, `target`, `music`, `leaf`, `hourglass`, `pencil`, `sword`, `sprout`, `calendar-days`, `zap`, `wand2`, `award`, `sparkles`, `crown`, `lock`, `check`, `heart`, `coffee`, `wind`, `scroll`, `activity`, `sun`, `lightbulb`

#### Exemplo

```tsx
<PixelIcon name="trophy" size={20} color={ACCENT_GOLD} />
<PixelIcon name="⏱️" size={16} color={COLOR_WARNING} />
```

---

### 5.9 `MobileAddTaskModal`

**Arquivo:** `ui/MobileAddTaskModal.tsx`
**Descrição:** Bottom-sheet modal para adicionar tarefas no mobile. Inclui input de texto, DifficultyPicker e seleção de tags.

#### Props

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `open` | `boolean` | — | Visibilidade do modal |
| `accent` | `string` (token) | — | Cor accent da tela pai |
| `title` | `string` | `"NOVA TAREFA"` | Título do header |
| `placeholder` | `string` | `"Nome da tarefa..."` | Placeholder do input |
| `availableTags` | `string[]` | `[]` | Tags existentes para seleção |
| `onClose` | `fn` | — | Fechar modal |
| `onAdd` | `fn(text, diff, tag?)` | — | Confirmar adição |
| `onTagsChanged` | `fn` | — | Callback após criar/deletar tag |

---

### 5.10 `PowerSpiderChart`

**Arquivo:** `ui/PowerSpiderChart.tsx`
**Descrição:** Radar chart SVG dos 4 multiplicadores de poder (MH, MN, MC, MR).

#### Props

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `sources` | `PowerSource[]` | — | Dados dos eixos |
| `accentColor` | `string` (token) | — | Cor do polígono e glow |
| `size` | `number` | 260 | Tamanho do SVG |

---

## 6. Regras de Uso

### ✅ Correto

```tsx
import { ACCENT_GOLD, COLOR_DANGER, FONT_PIXEL, SP_LG, RADIUS_MD } from "@/app/data/tokens";
import { RpgButton } from "@/app/components/ui/RpgButton";

<RpgButton variant="ghost" color={COLOR_DANGER}>DELETAR</RpgButton>
<div style={{ padding: SP_LG, borderRadius: RADIUS_MD, fontFamily: FONT_PIXEL }}>...</div>
```

### ❌ Incorreto

```tsx
// Valor solto — proibido
<button style={{ color: "#E63946", padding: "16px", borderRadius: "6px" }}>DELETAR</button>

// Componente nativo sem RpgButton
<button onClick={fn}>SALVAR</button>
```

### Exceções permitidas

Os seguintes elementos podem usar `<button>` nativo com estilos inline apenas quando houver **gradientes dinâmicos ou animações CSS** que o `RpgButton` não suporta (ex: botão de ataque com gradiente radial animado). Documentar o motivo com comentário inline.

---

## 7. Checklist de Conformidade

Antes de commitar qualquer componente novo:

- [ ] Todas as cores vêm de `tokens.ts`
- [ ] Todos os tamanhos de fonte usam `PX_*` ou `VT_*`
- [ ] Todos os espaçamentos usam `SP_*`
- [ ] Todos os border-radius usam `RADIUS_*`
- [ ] Botões interativos usam `RpgButton` (com exceção documentada se não for possível)
- [ ] Tabs usam `PixelTabs`
- [ ] Cards visuais usam `PixelCard`
- [ ] Telas/rotas usam `PageShell`
- [ ] Ícones usam `PixelIcon` em vez de emojis
- [ ] Entradas de card usam `CardIn` para animação
- [ ] Seletores de dificuldade usam `DifficultyPicker`
- [ ] Se um elemento novo precisar de token/componente inexistente: propor e documentar aqui antes de usar

Documentação de Design: Sistema de Power do Taskland
1. Visão Geral
O Power (Poder) é a representação numérica e visual da força geral do personagem do usuário dentro do Taskland. Ele não é um atributo direto (como "força" ou "inteligência"), mas um multiplicador composto que influencia o desempenho do jogador em todas as atividades (tasks, combate, desafios). O Power é calculado a partir de múltiplas fontes que se multiplicam entre si, criando uma progressão não-linear e estratégica.

2. Componentes do Power (Multiplicadores)
O Power total é o produto de quatro multiplicadores principais:

Power Total = Multiplicador de Hábitos × Multiplicador de Nível × Multiplicador de Classe × Multiplicador de Rebirth
2.1. Multiplicador de Hábitos (MH)
Fonte: Hábitos ativos mantidos pelo usuário.
Mecânica: Cada hábito ativo (com streak não quebrado) contribui com um pequeno bônus.
Fórmula base:
  MH = 1 + (Número de Hábitos Ativos × 0.02)
Exemplo: 5 hábitos ativos → MH = 1 + (5 × 0.02) = 1.10
2.2. Multiplicador de Nível (MN)
Fonte: Nível atual do personagem na run atual.
Mecânica: Cresce de forma logarítmica para evitar dominância excessiva.
Fórmula base:
  MN = 1 + (ln(Nível) × 0.1)
Tabela de referência:
Nível	MN
1	1.00
5	1.16
10	1.23
20	1.30
50	1.39
2.3. Multiplicador de Classe (MC)

Exportar

Copiar
Fonte: Classe escolhida pelo usuário (Guerreiro, Mago, etc.).
Mecânica: Bônus condicional baseado no tipo de atividade.
Valores base:
Guerreiro: MC = 1.15 durante Desafios de Tempo
Mago: MC = 1.20 durante Modo Foco
Base/Outros: MC = 1.00
2.4. Multiplicador de Rebirth (MR)
Fonte: Conquistas acumuladas ao longo de todas as runs, "descongeladas" ao renascer.
Mecânica: Começa em 1.0; cada rebirth adiciona o valor das conquistas da run anterior.
Fórmula:
  MR = 1.0 + Σ(Valor de todas as conquistas "descongeladas")
Característica crítica: Este é o único multiplicador que persiste permanentemente entre rebirths.
3. Sistema de Conquistas e Valores Congelados
3.1. Tiers de Conquista e Valores
Cada conquista possui um valor de multiplicador associado ao seu tier. Este valor fica congelado até o próximo rebirth.

Tier da Conquista	Valor do Multiplicador	Exemplo de Conquista
Bronze	+0.10	"Primeira Vitória" - Derrotar 1 monstro
Prata	+0.15	"Disciplina de 7 Dias" - Manter 1 hábito por 7 dias
Ouro	+0.20	"Mestre do Tempo" - Completar 10 desafios de tempo
Diamante	+0.40	"Lenda Viva" - 100 dias de atividade contínua
Lendário	+0.60	"Concluidor" - Finalizar todas as conquistas de um arco

Exportar

Copiar
3.2. Estado das Conquistas
Desbloqueada: Conquista alcançada, valor congelado.
Descongelada: Valor adicionado ao MR após rebirth.
Ativa: Contribui para o Power atual.
4. Fluxo de Rebirth (Ciclo Principal de Progressão)
4.1. Durante uma Run
Usuário joga normalmente, sobe de nível, mantém hábitos, completa conquistas.
Todas as conquistas desbloqueadas têm seus valores adicionados ao pool congelado.
O Power atual é calculado com MR atual (sem as conquistas da run atual).
4.2. Ao Iniciar um Rebirth
Sistema calcula: Novo MR = MR atual + Σ(Valores congelados da run)
Resetam:
Nível do personagem → 1
Progressão da campanha → Início
Multiplicadores temporários (exceto MR)
Mantêm:
Todas as conquistas desbloqueadas (agora "descongeladas")
Histórico de hábitos (para conquistas futuras)
Novo MR permanente
4.3. Após o Rebirth
O usuário começa uma nova run com MR maior.
Conquistas podem ser redesbloqueadas para farming adicional (com valor reduzido ou não, conforme balanceamento).
5. Cálculo Completo do Power
5.1. Fórmula Geral
Power = [1 + (HábitosAtivos × 0.02)] × [1 + (ln(Nível) × 0.1)] × [MultiplicadorClasse] × [1.0 + Σ(ConquistasDescongeladas)]
5.2. Exemplo Numérico
Situação:

Hábitos ativos: 3
Nível atual: 8
Classe: Guerreiro (em desafio de tempo)
Conquistas descongeladas: 1 Bronze (+0.10), 1 Prata (+0.15)
Conquistas congeladas (run atual): 1 Ouro (+0.20)
Cálculo:

MH = 1 + (3 × 0.02) = 1.06
MN = 1 + (ln(8) × 0.1) = 1 + (2.08 × 0.1) = 1.208
MC = 1.15 (guerreiro em desafio de tempo)
MR = 1.0 + 0.10 + 0.15 = 1.25

Power = 1.06 × 1.208 × 1.15 × 1.25 = 1.84
Após rebirth:

Novo MR = 1.25 + 0.20 = 1.45
Power inicial na nova run = 1.06 × 1.0 × 1.15 × 1.45 = 1.77
(Nota: Nível resetou para 1, mas MR aumentou)

6. Impacto no Gameplay
6.1. No Combate (Dano)
Dano da Task = DanoBase × Power
Exemplo: Task difícil (75 base) com Power 1.84 → 138 de dano.

6.2. Na Progressão
Run inicial: Progressão lenta, foco em desbloquear conquistas.
Runs posteriores: Progressão acelerada devido ao MR maior.
Estratégia: Usuários devem balancear entre:
Focar em conquistas de alto valor
Manter hábitos ativos
Escolher classe apropriada para seu estilo
7. Considerações de Balanceamento
7.1. Limites e Caps
Multiplicador de Hábitos: Cap de 10 hábitos ativos → MH máximo = 1.20
Multiplicador de Nível: Crescimento logarítmico naturalmente limitado.
Multiplicador de Rebirth: Sem cap teórico, mas valores de conquista controlados.
7.2. Conquistas Redundantes
Conquistas do mesmo tipo não acumulam (ex: "Derrotar 10 monstros" e "Derrotar 50 monstros" são separadas).
Conquistas sazonais/eventos podem oferecer bônus temporários ao MR.
7.3. Feedback Visual
Barra de Power: Mostra valor atual e progresso para próximo rebirth.
Tooltips: Detalham contribuição de cada componente.
Tela de Rebirth: Mostra comparação "antes/depois" do MR.

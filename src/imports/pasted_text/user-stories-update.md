Okay, preciso ajudar o usuário a transformar as novas alterações que ele quer em User Stories. Vamos ver o que ele pediu:

Primeiro, ele não quer mais buff de ataque, então tenho que remover qualquer User Story relacionada a isso. Ele mencionou que a campanha deve ser contínua, mostrada na home, onde o usuário já pode começar a fazer tasks. Então a home vai sempre exibir a campanha em andamento.

Depois, ele quer uma aba de desafios onde o usuário pode criar desafios, escolhendo entre dois tipos: cumprir tasks em um tempo específico ou manter o foco durante um período. A criação de desafios deve ter uma tela de seleção de tipo primeiro e depois a configuração, incluindo adicionar tasks antecipadamente, mas ainda permitir adicionar mais durante o desafio.

Também não quer categorias de tasks (pessoal, trabalho, saúde), mantendo apenas a dificuldade. O usuário ganha força (dano base) conforme evolui o personagem, e deve ver o XP ganho ao derrotar monstros na campanha.

Preciso organizar isso em Épicos e User Stories. Vou separar em Épicos principais: Campanha Contínua, Sistema de Desafios, Progressão do Personagem e Adaptações de UI/UX.

Para cada Épico, listo as User Stories. Por exemplo, na Campanha Contínua, a home sempre mostra a campanha, então uma User Story seria sobre a home sempre exibir a campanha ativa. Outra sobre iniciar tasks diretamente da home.

No Sistema de Desafios, preciso das etapas de seleção de tipo de desafio e configuração, permitindo adicionar tasks antes e durante o desafio. Também garantir que os tipos de desafio sejam tempo específico ou foco contínuo.

Na Progressão do Personagem, adicionar dano base conforme XP, mostrar XP ganho ao derrotar monstros e uma tela de progressão.

Preciso verificar se todas as mudanças pedidas estão cobertas, como remover categorias de tasks, manter apenas dificuldade, e ajustar a criação de desafios com telas separadas.

Também garantir que as User Stories técnicas cubram persistência de dados, cálculo de XP e modularidade para tipos de desafio.

Finalmente, priorizar as User Stories por complexidade e importância.

Vou reorganizar as novas demandas em Épicos e User Stories atualizadas, removendo elementos descartados e adicionando os novos requisitos:

Épico 1: Campanha Contínua na Home

Descrição: A Home sempre exibe a campanha ativa do usuário, permitindo interagir com tasks diretamente sem navegar para outra tela.

User Stories:

US1.1 – Home como Arena da Campanha
Como usuário, quero que a tela inicial sempre mostre minha campanha atual para interagir com tasks sem precisar navegar.
Critérios:

Remover tela de seleção de missão antiga
Home mostra: monstro atual, barra de HP, tasks da campanha
Botão "Ver Progresso" leva à tela de evolução do personagem

US1.2 – Adicionar Tasks Diretamente na Home
Como usuário, quero adicionar novas tasks à campanha sem sair da Home para manter o fluxo contínuo.
Critérios:

Campo "Nova Task" flutuante na parte inferior da Home
Seleção obrigatória de dificuldade (dropdown: Fácil/Médio/Difícil)
Épico 2: Sistema de Desafios

Descrição: Nova seção onde usuários criam desafios customizados com dois modos: tempo específico ou foco contínuo.

User Stories:

US2.1 – Fluxo de Criação de Desafios em Duas Etapas
Como usuário, quero primeiro escolher o tipo de desafio e depois configurá-lo para evitar confusão na criação.
Critérios:

Tela 1: Selecionar entre "Tempo Fixo" ou "Foco Contínuo"
Tela 2: Configurar parâmetros específicos do tipo escolhido

US2.2 – Desafio de Tempo Específico
Como usuário, quero definir um tempo limite e tasks obrigatórias para completar dentro dele.
Critérios:

Inputs: Duração (minutos), Lista inicial de tasks (opcional)
Durante o desafio: usuário pode adicionar mais tasks

US2.3 – Desafio de Foco Contínuo
Como usuário, quero definir um período onde ganho pontos por manter o foco (ex: 25min de trabalho sem interrupção).
Critérios:

Input: Duração total do desafio (ex: 2 horas)
Cronômetro estilo Pomodoro com pausa automática se sair do app
Épico 3: Progressão do Personagem

Descrição: Sistema de XP e dano escalável conforme o usuário avança nas campanhas.

User Stories:

US3.1 – Dano Base Proporcional ao Nível
Como jogador, quero que meu dano por task aumente conforme subo de nível para enfrentar monstros mais fortes.
Critérios:

Fórmula: Dano = Dano base (1-3 por dificuldade) × (1 + Nível × 0.2)
Ex: Nível 5 → 1.2× de dano

US3.2 – Feedback de XP por Missão Concluída
Como jogador, quero ver quanto XP ganhei ao derrotar um monstro na campanha para planejar meu progresso.
Critérios:

Popup pós-vitória: "Você ganhou 120 XP!"
Barra de progresso de nível atualizada na Home

US3.3 – Tela de Evolução do Personagem
Como usuário, quero ver meu nível atual, XP acumulado e próximo bônus de dano para acompanhar meu crescimento.
Critérios:

Acesso por botão na Home
Gráfico de progressão e histórico de missões
Épico 4: Adaptações de UI/UX

Descrição: Ajustes nas telas para suportar o novo fluxo contínuo.

User Stories:

US4.1 – Aba "Desafios" na Navegação Principal
Como usuário, quero acessar rapidamente meus desafios ativos e históricos a partir de um menu dedicado.
Critérios:

Ícone de troféu na barra inferior
Separação entre "Ativos" e "Concluídos"

US4.2 – Remoção de Categorias de Tasks
Como desenvolvedor, preciso remover a seleção de categorias (pessoal/trabalho) para simplificar o sistema.
Critérios:

Excluir campo category do modelo de Task
Atualizar forms de criação/edição
User Stories Técnicas (Não Funcionais)

NF1 – Persistência de Campanha Contínua
Como desenvolvedor, preciso garantir que o estado da campanha seja salvo mesmo após fechar o app.
Solução:

Armazenar em IndexedDB ou backend simples

NF2 – Cálculo de XP por Monstro
Como sistema, o XP ganho deve ser proporcional à dificuldade do monstro derrotado.
Fórmula:

XP = (HP do monstro × 0.5) + (tasks concluídas × 10)

NF3 – Arquitetura para Tipos de Desafio
Como desenvolvedor, quero uma estrutura modular para adicionar novos tipos de desafio sem impacto no código existente.
Abordagem:

Usar Strategy Pattern para ChallengeType
Priorização Revisada
Épico	User Stories	Complexidade
Campanha Contínua	US1.1, US1.2, NF1	4
Sistema de Desafios	US2.1, US2.2, US2.3	5
Progressão	US3.1, US3.2, NF2	3
UI/UX	US4.1, US4.2	2
Exportar
Copiar

Quer que eu detalhe o protótipo de telas ou algum fluxo específico?
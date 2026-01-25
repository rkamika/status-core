export type DiagnosisState =
    | "CONFUSION"
    | "OVERLOAD"
    | "REACTIVITY"
    | "UNCERTAINTY"
    | "DISCONNECTION"
    | "STAGNATION"
    | "CLARITY"
    | "ALIGNMENT";

export type Locale = "pt" | "en" | "es";

export interface PillarScore {
    label: string;
    value: number; // 0 to 100
    color: string;
    insight: string;
}

export interface ReportContent {
    meaning: string;
    characteristics: string[];
    primary_risk: string;
    recommended_focus: string[];
    next_step: string;
    immediate_win: string;
    the_no_to_say: string;
    mindset_shift: string;
    stoic_lesson: string;
    stoic_principles: string[];
}

export interface StateConfig {
    labels: Record<Locale, string>;
    color: string;
}

export interface DiagnosisResult {
    state: DiagnosisState;
    label: string;
    color: string;
    confidence: number;
    one_liner: string;
    report?: ReportContent;
    pillarScores: PillarScore[];
    v3Insights?: {
        antifragilityScore: number;
        bottleneckLabel: string;
        correlations: string[];
        archetype: string;
        aiAnalysis?: {
            executiveSummary: string;
            sevenDayPlan: { day: string; action: string; pilar: string }[];
            stoicRefinement: string;
        };
    };
}

export const STATE_CONFIGS: Record<DiagnosisState, StateConfig> = {
    ALIGNMENT: {
        labels: { pt: "ALINHAMENTO", en: "ALIGNMENT", es: "ALINEACIÓN" },
        color: "rgba(34, 197, 94, 0.7)"
    },
    CLARITY: {
        labels: { pt: "CLAREZA", en: "CLARITY", es: "CLARIDAD" },
        color: "rgba(20, 184, 166, 0.7)"
    },
    UNCERTAINTY: {
        labels: { pt: "INCERTEZA", en: "UNCERTAINTY", es: "INCERTIDUMBRE" },
        color: "rgba(249, 115, 22, 0.7)"
    },
    CONFUSION: {
        labels: { pt: "CONFUSÃO", en: "CONFUSION", es: "CONFUSIÓN" },
        color: "rgba(245, 158, 11, 0.7)"
    },
    OVERLOAD: {
        labels: { pt: "SOBRECARGA", en: "OVERLOAD", es: "SOBRECARGA" },
        color: "rgba(239, 68, 68, 0.7)"
    },
    REACTIVITY: {
        labels: { pt: "REATIVIDADE", en: "REACTIVITY", es: "REACTIVIDAD" },
        color: "rgba(185, 28, 28, 0.7)"
    },
    DISCONNECTION: {
        labels: { pt: "DESCONEXÃO", en: "DISCONNECTION", es: "DESCONEXIÓN" },
        color: "rgba(59, 130, 246, 0.7)"
    },
    STAGNATION: {
        labels: { pt: "ESTAGNAÇÃO", en: "STAGNATION", es: "ESTANCAMIENTO" },
        color: "rgba(107, 114, 128, 0.7)"
    },
};

export const QUESTIONS: Record<Locale, Array<{ id: number, text: string }>> = {
    pt: [
        // Saúde
        { id: 1, text: "Sinto que tenho energia física suficiente para realizar minhas atividades sem exaustão extrema." },
        { id: 2, text: "Tenho tido uma boa qualidade de sono e acordo sentindo que meu corpo descansou." },
        { id: 3, text: "Consigo manter o equilíbrio emocional mesmo diante de imprevistos estressantes." },
        // Trabalho
        { id: 4, text: "Sinto que meu trabalho atual tem um sentido claro e contribui para algo maior." },
        { id: 5, text: "Tenho clareza sobre minhas próximas metas de crescimento profissional." },
        { id: 6, text: "Sinto-me entusiasmado e desafiado na medida certa durante minha rotina de trabalho." },
        // Relacionamentos
        { id: 7, text: "Sinto que tenho um sistema de apoio sólido em meus relacionamentos." },
        { id: 8, text: "Consigo expressar minhas necessidades e sentimentos de forma clara nas minhas relações." },
        { id: 9, text: "Sinto-me pertencente e aceito nos grupos sociais que frequento." },
        // Financeiro
        { id: 10, text: "Tenho tranquilidade em relação à minha estabilidade financeira atual." },
        { id: 11, text: "Sinto que tenho autonomia para tomar decisões financeiras sem medo excessivo do futuro." },
        { id: 12, text: "Minha vida financeira está organizada o suficiente para não gerar ansiedade constante." },
        // Identidade
        { id: 13, text: "Tenho clareza sobre meus valores fundamentais e ajo de acordo com eles." },
        { id: 14, text: "Sinto-me autoconfiante em relação às minhas capacidades e ao meu valor pessoal." },
        { id: 15, text: "Pratico o autorespeito e sei impor limites saudáveis para proteger minha identidade." },
        // Lazer
        { id: 16, text: "Consigo me desconectar totalmente do trabalho durante meus momentos de descanso." },
        { id: 17, text: "Tenho hobbies ou atividades de lazer que me trazem diversão e alegria genuína." },
        { id: 18, text: "Sinto que minha vida pessoal é diversificada e leve, além das responsabilidades." },
        // Espiritualidade
        { id: 19, text: "Sinto uma conexão com algo maior ou com um propósito existencial que me guia." },
        { id: 20, text: "Minha vida faz sentido para mim em um nível profundo, além do sucesso material." },
        { id: 21, text: "Pratico momentos de reflexão, meditação ou conexão interior com regularidade." },
    ],
    en: [
        { id: 1, text: "I feel I have enough physical energy to perform my activities without extreme exhaustion." },
        { id: 2, text: "I have been getting good quality sleep and wake up feeling that my body has rested." },
        { id: 3, text: "I can maintain emotional balance even when faced with stressful setbacks." },
        { id: 4, text: "I feel that my current work has a clear meaning and contributes to something larger." },
        { id: 5, text: "I am clear about my next professional growth goals." },
        { id: 6, text: "I feel enthusiastic and appropriately challenged during my work routine." },
        { id: 7, text: "I feel I have a solid support system in my relationships (family/friends)." },
        { id: 8, text: "I can express my needs and feelings clearly in my relationships." },
        { id: 9, text: "I feel a sense of belonging and acceptance in the social groups I frequent." },
        { id: 10, text: "I have peace of mind regarding my current financial stability." },
        { id: 11, text: "I feel I have the autonomy to make financial decisions without excessive fear of the future." },
        { id: 12, text: "My financial life is organized enough not to generate constant anxiety." },
        { id: 13, text: "I am clear about my core values and act in accordance with them." },
        { id: 14, text: "I feel self-confident about my capabilities and personal worth." },
        { id: 15, text: "I practice self-respect and know how to set healthy boundaries to protect my identity." },
        { id: 16, text: "I can fully disconnect from work and obligations during my downtime." },
        { id: 17, text: "I have hobbies or leisure activities that bring me genuine fun and joy." },
        { id: 18, text: "I feel my personal life is diverse and light, beyond responsibilities." },
        { id: 19, text: "I feel a connection with something larger or an existential purpose that guides me." },
        { id: 20, text: "My life makes sense to me on a deep level, beyond material success." },
        { id: 21, text: "I regularly practice moments of reflection, meditation, or inner connection." },
    ],
    es: [
        { id: 1, text: "Siento que tengo suficiente energía física para realizar mis actividades sin un agotamiento extremo." },
        { id: 2, text: "He tenido una buena calidad de sueño y me despierto sintiendo que mi cuerpo ha descansado." },
        { id: 3, text: "Puedo mantener el equilibrio emocional incluso ante contratiempos estresantes." },
        { id: 4, text: "Siento que mi trabajo actual tiene un sentido claro y contribuye a algo más grande." },
        { id: 5, text: "Tengo claridad sobre mis próximas metas de crecimiento profesional." },
        { id: 6, text: "Me siento entusiasmado y adecuadamente desafiado durante mi rutina laboral." },
        { id: 7, text: "Siento que tengo un sistema de apoyo sólido en mis relaciones (familia/amigos)." },
        { id: 8, text: "Puedo expresar mis necesidades y sentimientos con claridad en mis relaciones." },
        { id: 9, text: "Me siento integrado y aceptado en los grupos sociales que frecuento." },
        { id: 10, text: "Tengo tranquilidad con respecto a mi estabilidad financiera actual." },
        { id: 11, text: "Siento que tengo autonomía para tomar decisiones financieras sin un miedo excesivo al futuro." },
        { id: 12, text: "Mi vida financiera está lo suficientemente organizada como para no generar ansiedad constante." },
        { id: 13, text: "Tengo claridad sobre mi valores fundamentales y actúo de acuerdo con ellos." },
        { id: 14, text: "Me seguro de mis capacidades y de mi valor personal." },
        { id: 15, text: "Practico el autorespeto y sé poner límites saludables para proteger mi identidad." },
        { id: 16, text: "Puedo desconectarme totalmente del trabajo y las obligaciones durante mi tiempo libre." },
        { id: 17, text: "Tengo pasatiempos o actividades de ocio que me brindan diversión y alegría genuinas." },
        { id: 18, text: "Siento que mi vida personal es diversa y liviana, más allá de las responsabilidades." },
        { id: 19, text: "Siento una conexión con algo más grande o con un propósito existencial que me guía." },
        { id: 20, text: "Mi vida tiene sentido para mí a un nivel profundo, más allá del éxito material." },
        { id: 21, text: "Practico momentos de reflexión, meditación o conexión interior con regularidade." },
    ]
};

const statesData: Record<DiagnosisState, Record<Locale, { one_liner: string, report: ReportContent }>> = {
    CONFUSION: {
        pt: {
            one_liner: "Sinais mistos entre seus pilares estão gerando neblina mental.",
            report: {
                meaning: "A Confusão v4 ocorre quando os pilares de Identidade e Espiritualidade estão desalinhados, impedindo uma visão clara do todo.",
                characteristics: ["Dificuldade em priorizar qual pilar focar", "Sentimento de estar perdido mesmo agindo", "Conflito entre valores e ações diárias"],
                primary_risk: "Gasto de energia em áreas que não trazem realização real.",
                recommended_focus: ["Revisão de valores (Identidade)", "Meditação (Espiritualidade)", "Journaling"],
                next_step: "Escolha um pilar para ignorar por 24h e um para focar 100%.",
                immediate_win: "Defina seus 3 valores não-negociáveis agora.",
                the_no_to_say: "Diga NÃO a compromissos que agridem sua identidade.",
                mindset_shift: "De 'Eu preciso de mais dados' para 'Eu preciso de mais silêncio'.",
                stoic_lesson: "A clareza não vem de fora, mas de organizar o que já está dentro.",
                stoic_principles: ["Escute sua voz interior", "Defina o que é essencial", "Aja com integridade"]
            }
        },
        en: {
            one_liner: "Mixed signals between your pillars are generating mental fog.",
            report: {
                meaning: "Confusion v4 occurs when the Identity and Spirituality pillars are misaligned, preventing a clear view of the whole.",
                characteristics: ["Difficulty prioritizing which pillar to focus on", "Feeling lost despite taking action", "Conflict between values and daily actions"],
                primary_risk: "Wasting energy on areas that do not bring real fulfillment.",
                recommended_focus: ["Value review (Identity)", "Meditation (Spirituality)", "Journaling"],
                next_step: "Choose one pillar to ignore for 24h and one to focus on 100%.",
                immediate_win: "Define your 3 non-negotiable values now.",
                the_no_to_say: "Say NO to commitments that harm your identity.",
                mindset_shift: "From 'I need more data' to 'I need more silence'.",
                stoic_lesson: "Clarity doesn't come from outside, but from organizing what is already inside.",
                stoic_principles: ["Listen to your inner voice", "Define what is essential", "Act with integrity"]
            }
        },
        es: {
            one_liner: "Las señales mixtas entre tus pilares están generando niebla mental.",
            report: {
                meaning: "La Confusión v4 ocurre cuando los pilares de Identidad y Espiritualidad están desalineados, impidiendo una visión clara del todo.",
                characteristics: ["Dificultad para priorizar en qué pilar enfocarse", "Sentimiento de estar perdido a pesar de actuar", "Conflicto entre valores y acciones diarias"],
                primary_risk: "Gasto de energía en áreas que no aportan una realización real.",
                recommended_focus: ["Revisión de valores (Identidad)", "Meditación (Espiritualidad)", "Journaling"],
                next_step: "Elige un pilar para ignorar por 24h y uno para enfocarte al 100%.",
                immediate_win: "Define tus 3 valores no negociables ahora.",
                the_no_to_say: "Di NO a los compromisos que agreden tu identidad.",
                mindset_shift: "De 'Necesito más datos' a 'Necesito más silencio'.",
                stoic_lesson: "La claridad no viene de fuera, sino de organizar lo que ya está dentro.",
                stoic_principles: ["Escucha tu voz interior", "Define lo que es esencial", "Actúa con integridad"]
            }
        }
    },
    OVERLOAD: {
        pt: {
            one_liner: "Os pilares de Saúde e Lazer estão sendo drenados pelo Trabalho.",
            report: {
                meaning: "A Sobrecarga v4 é um desequilíbrio sistêmico onde o volume de um pilar asfixia os outros.",
                characteristics: ["Fadiga persistente", "Falta de tempo para si mesmo", "Negligência com a saúde física"],
                primary_risk: "Colapso físico ou burnout por falta de recuperação.",
                recommended_focus: ["Restabelecimento do sono", "Limites no trabalho", "Lazer obrigatório"],
                next_step: "Agende uma hora de lazer inegociável para hoje.",
                immediate_win: "Durma 1 hora mais cedo esta noite.",
                the_no_to_say: "Diga NÃO a horas extras e tarefas secundárias.",
                mindset_shift: "De 'Eu sou uma máquina' para 'Eu sou um sistema biológico que precisa de recarga'.",
                stoic_lesson: "Aquele que está em todo lugar, não está em lugar nenhum.",
                stoic_principles: ["Proteja sua paz", "Recupere o fôlego", "Limite o campo de batalha"]
            }
        },
        en: {
            one_liner: "Health and Leisure pillars are being drained by Work.",
            report: {
                meaning: "Overload v4 is a systemic imbalance where the volume of one pillar suffocates the others.",
                characteristics: ["Persistent fatigue", "Lack of time for oneself", "Neglect of physical health"],
                primary_risk: "Physical collapse or burnout due to lack of recovery.",
                recommended_focus: ["Sleep restoration", "Work boundaries", "Mandatory leisure"],
                next_step: "Schedule an unconditional hour of leisure for today.",
                immediate_win: "Sleep 1 hour earlier tonight.",
                the_no_to_say: "Say NO to overtime and secondary tasks.",
                mindset_shift: "From 'I am a machine' to 'I am a biological system that needs recharging'.",
                stoic_lesson: "He who is everywhere is nowhere.",
                stoic_principles: ["Protect your peace", "Catch your breath", "Limit the battlefield"]
            }
        },
        es: {
            one_liner: "Los pilares de Salud y Ocio están siendo drenados por el Trabajo.",
            report: {
                meaning: "La Sobrecarga v4 es un desequilibrio sistémico donde el volumen de un pilar asfixia a los demás.",
                characteristics: ["Fatiga persistente", "Falta de tiempo para uno mismo", "Negligencia con la salud física"],
                primary_risk: "Colapso físico o burnout por falta de recuperación.",
                recommended_focus: ["Restablecimiento del sueño", "Límites en el trabajo", "Ocio obligatorio"],
                next_step: "Programa una hora de ocio innegociable para hoy.",
                immediate_win: "Duerme 1 hora más temprano esta noche.",
                the_no_to_say: "Di NO a las horas extras y tareas secundarias.",
                mindset_shift: "De 'Soy una máquina' a 'Soy un sistema biológico que necesita recarga'.",
                stoic_lesson: "Quien está en todas partes, no está en ninguna parte.",
                stoic_principles: ["Protege tu paz", "Recupera el aliento", "Limita el campo de batalla"]
            }
        }
    },
    REACTIVITY: {
        pt: {
            one_liner: "Conflitos no pilar de Relacionamentos estão gerando gatilhos emocionais.",
            report: {
                meaning: "A Reatividade v4 indica que sua segurança emocional nos relacionamentos está fragilizada.",
                characteristics: ["Paciência curta com pessoas próximas", "Sentimento de isolamento", "Defensividade excessiva"],
                primary_risk: "Ruptura de laços importantes e solidão.",
                recommended_focus: ["Comunicação não-violenta", "Escuta ativa", "Perdão"],
                next_step: "Tenha uma conversa honesta de 5 min com alguém querido.",
                immediate_win: "Ouça alguém hoje sem interromper ou julgar.",
                the_no_to_say: "Diga NÃO a discussões reativas por impulso.",
                mindset_shift: "De 'Eles me atacam' para 'Eu estou sem suporte emocional'.",
                stoic_lesson: "A melhor vingança é não ser como quem te feriu.",
                stoic_principles: ["Empatia como escudo", "Controle sua resposta", "Busque conexão real"]
            }
        },
        en: {
            one_liner: "Conflicts in the Relationships pillar are generating emotional triggers.",
            report: {
                meaning: "Reactivity v4 indicates that your emotional security in relationships is fragile.",
                characteristics: ["Short patience with close ones", "Feeling of isolation", "Excessive defensiveness"],
                primary_risk: "Breakdown of important bonds and loneliness.",
                recommended_focus: ["Non-violent communication", "Active listening", "Forgiveness"],
                next_step: "Have a 5-min honest conversation with a loved one.",
                immediate_win: "Listen to someone today without interrupting or judging.",
                the_no_to_say: "Say NO to impulsive reactive arguments.",
                mindset_shift: "From 'They are attacking me' to 'I am lacking emotional support'.",
                stoic_lesson: "The best revenge is to not be like him who performed the injury.",
                stoic_principles: ["Empathy as a shield", "Control your response", "Seek real connection"]
            }
        },
        es: {
            one_liner: "Conflictos en el pilar de Relaciones están generando disparadores emocionales.",
            report: {
                meaning: "La Reactividad v4 indica que tu seguridad emocional en las relaciones está debilitada.",
                characteristics: ["Poca paciencia con los allegados", "Sentimiento de aislamiento", "Defensividad excesiva"],
                primary_risk: "Ruptura de vínculos importantes y soledad.",
                recommended_focus: ["Comunicación no violenta", "Escucha activa", "Perdón"],
                next_step: "Ten una charla honesta de 5 min con un ser querido.",
                immediate_win: "Escucha a alguien hoy sin interrumpir ni juzgar.",
                the_no_to_say: "Di NO a discusiones reactivas por impulso.",
                mindset_shift: "De 'Ellos me atacan' a 'Me falta apoyo emocional'.",
                stoic_lesson: "La mejor venganza es no ser como quien te hirió.",
                stoic_principles: ["Empatía como escudo", "Controla tu respuesta", "Busca conexión real"]
            }
        }
    },
    UNCERTAINTY: {
        pt: {
            one_liner: "Instabilidade no pilar Financeiro gera medo do futuro.",
            report: {
                meaning: "A Incerteza v4 está ligada à falta de uma rede de segurança material ou plano futuro.",
                characteristics: ["Preocupação excessiva com dinheiro", "Hesitação em investir em si", "Medo da escassez"],
                primary_risk: "Paralisia e perda de autonomia.",
                recommended_focus: ["Planejamento financeiro", "Reserva de emergência", "Crescimento profissional"],
                next_step: "Anote todos os seus custos fixos hoje.",
                immediate_win: "Economize ou gere um valor simbólico hoje.",
                the_no_to_say: "Diga NÃO a gastos impulsivos por ansiedade.",
                mindset_shift: "De 'Eu vou quebrar' para 'Eu estou construindo minha base'.",
                stoic_lesson: "A pobreza não é a falta de bens, mas a ânsia de ter mais. Foque na estabilidade interna.",
                stoic_principles: ["Frugalidade sábia", "Prepare-se para o inverno", "A riqueza está na liberdade"]
            }
        },
        en: {
            one_liner: "Instability in the Financial pillar generates fear of the future.",
            report: {
                meaning: "Uncertainty v4 is linked to the lack of a material safety net or future plan.",
                characteristics: ["Excessive worry about money", "Hesitation to invest in oneself", "Fear of scarcity"],
                primary_risk: "Paralysis and loss of autonomy.",
                recommended_focus: ["Financial planning", "Emergency fund", "Professional growth"],
                next_step: "Write down all your fixed costs today.",
                immediate_win: "Save or generate a symbolic amount today.",
                the_no_to_say: "Say NO to impulsive spending due to anxiety.",
                mindset_shift: "From 'I will go broke' to 'I am building my foundation'.",
                stoic_lesson: "Poverty is not the lack of possessions, but the greedy longing for more. Focus on internal stability.",
                stoic_principles: ["Wise frugality", "Prepare for winter", "Wealth lies in freedom"]
            }
        },
        es: {
            one_liner: "Inestabilidad en el pilar Financiero genera miedo al futuro.",
            report: {
                meaning: "La Incertidumbre v4 está ligada a la falta de una red de seguridad material o un plan futuro.",
                characteristics: ["Preocupación excesiva por el dinero", "Dudas para invertir en uno mismo", "Miedo a la escasez"],
                primary_risk: "Parálisis y pérdida de autonomía.",
                recommended_focus: ["Planificación financiera", "Reserva de emergencia", "Crecimiento profesional"],
                next_step: "Anota todos tus costos fijos hoy.",
                immediate_win: "Ahorra o genera un valor simbólico hoy.",
                the_no_to_say: "Di NO a gastos impulsivos por ansiedad.",
                mindset_shift: "De 'Voy a quebrar' a 'Estoy construyendo mi base'.",
                stoic_lesson: "La pobreza no es la falta de bienes, sino el ansia de tener más. Enfócate en la estabilidad interna.",
                stoic_principles: ["Frugalidad sabia", "Prepárate para el invierno", "La riqueza está en la libertad"]
            }
        }
    },
    DISCONNECTION: {
        pt: {
            one_liner: "O pilar de Espiritualidade e Sentido está em erosão.",
            report: {
                meaning: "A Desconexão v4 é o vazio existencial. Você está fazendo, mas não está 'sendo'.",
                characteristics: ["Sentimento de inutilidade", "Apatia espiritual", "Falta de conexão com algo maior"],
                primary_risk: "Depressão situacional ou crise de meia idade.",
                recommended_focus: ["Retiro ou silêncio", "Contribuição social", "Filosofia"],
                next_step: "Faça algo por alguém sem esperar nada em troca.",
                immediate_win: "Passe 15 minutos olhando para o céu ou para a natureza, sem pensar.",
                the_no_to_say: "Diga NÃO ao materialismo vazio.",
                mindset_shift: "De 'O que eu ganho com isso?' para 'Como eu sirvo ao mundo?'.",
                stoic_lesson: "Nós somos parte de um todo maior. Reencontre seu lugar no cosmos.",
                stoic_principles: ["Cosmopolitismo", "Amor Fati", "Conexão Universal"]
            }
        },
        en: {
            one_liner: "The Spirituality and Meaning pillar is eroding.",
            report: {
                meaning: "Disconnection v4 is existential emptiness. You are 'doing' but not 'being'.",
                characteristics: ["Sense of worthlessness", "Spiritual apathy", "Lack of connection with something larger"],
                primary_risk: "Situational depression or mid-life crisis.",
                recommended_focus: ["Retreat or silence", "Social contribution", "Philosophy"],
                next_step: "Do something for someone without expecting anything in return.",
                immediate_win: "Spend 15 minutes looking at the sky or nature, without thinking.",
                the_no_to_say: "Say NO to empty materialism.",
                mindset_shift: "From 'What do I get out of this?' to 'How do I serve the world?'.",
                stoic_lesson: "We are part of a larger whole. Reconnect with your place in the cosmos.",
                stoic_principles: ["Cosmopolitanism", "Amor Fati", "Universal Connection"]
            }
        },
        es: {
            one_liner: "El pilar de Espiritualidad y Sentido está en erosión.",
            report: {
                meaning: "La Desconexión v4 es el vacío existencial. Estás 'haciendo', pero no estás 'siendo'.",
                characteristics: ["Sentimiento de inutilidad", "Apatía espiritual", "Falta de conexión con algo más grande"],
                primary_risk: "Depresión situacional o crisis de identidad.",
                recommended_focus: ["Retiro o silencio", "Contribución social", "Filosofía"],
                next_step: "Haz algo por alguien sin esperar nada a cambio.",
                immediate_win: "Pasa 15 minutos mirando al cielo o la naturaleza, sin pensar.",
                the_no_to_say: "Di NO al materialismo vacío.",
                mindset_shift: "De '¿Qué gano con esto?' a '¿Cómo sirvo al mundo?'.",
                stoic_lesson: "Somos parte de un todo mayor. Reencuentra tu lugar en el cosmos.",
                stoic_principles: ["Cosmopolitismo", "Amor Fati", "Conexión Universal"]
            }
        }
    },
    STAGNATION: {
        pt: {
            one_liner: "O pilar de Identidade parou de evoluir por falta de novos desafios.",
            report: {
                meaning: "Estagnação v4 ocorre quando você parou de investir no próprio crescimento.",
                characteristics: ["Tédio com a própria rotina", "Falta de novos aprendizados", "Conforto excessivo"],
                primary_risk: "Obsolescência e perda do brilho pessoal.",
                recommended_focus: ["Cursos difíceis", "Viagens", "Novos círculos sociais"],
                next_step: "Inicie um novo aprendizado hoje.",
                immediate_win: "Leia 10 páginas de um livro complexo sobre um tema novo.",
                the_no_to_say: "Diga NÃO à mesma rotina de sempre.",
                mindset_shift: "De 'Eu já sei o suficiente' para 'Eu sou um eterno aprendiz'.",
                stoic_lesson: "Aquele que parou de ser melhor, parou de ser bom.",
                stoic_principles: ["Eudaimonia", "Busca pela virtude", "Desafio constante"]
            }
        },
        en: {
            one_liner: "Identity pillar has stopped evolving due to lack of new challenges.",
            report: {
                meaning: "Stagnation v4 occurs when you have stopped investing in your own growth.",
                characteristics: ["Boredom with your routine", "Lack of new learning", "Excessive comfort"],
                primary_risk: "Obsolescence and loss of personal spark.",
                recommended_focus: ["Difficult courses", "Travel", "New social circles"],
                next_step: "Start a new learning path today.",
                immediate_win: "Read 10 pages of a complex book on a new topic.",
                the_no_to_say: "Say NO to the same old routine.",
                mindset_shift: "From 'I know enough' to 'I am a lifelong learner'.",
                stoic_lesson: "He who has stopped getting better has stopped being good.",
                stoic_principles: ["Eudaimonia", "Pursuit of virtue", "Constant challenge"]
            }
        },
        es: {
            one_liner: "El pilar de Identidad ha dejado de evolucionar por falta de nuevos desafíos.",
            report: {
                meaning: "El Estancamiento v4 ocurre cuando has dejado de invertir en tu propio crecimiento.",
                characteristics: ["Aburrimiento con la propia rutina", "Falta de nuevos aprendizajes", "Comodidad excesiva"],
                primary_risk: "Obsolescencia y pérdida del brillo personal.",
                recommended_focus: ["Cursos difíciles", "Viajes", "Nuevos círculos sociales"],
                next_step: "Inicia un nuevo aprendizaje hoy.",
                immediate_win: "Lee 10 páginas de un libro complejo sobre un tema nuevo.",
                the_no_to_say: "Di NO a la misma rutina de siempre.",
                mindset_shift: "De 'Ya sé lo suficiente' a 'Soy un eterno aprendiz'.",
                stoic_lesson: "El que ha dejado de mejorar, ha dejado de ser bueno.",
                stoic_principles: ["Eudaimonia", "Búsqueda de la virtud", "Desafío constante"]
            }
        }
    },
    CLARITY: {
        pt: {
            one_liner: "Os pilares de Trabalho e Propósito estão em alta sintonia.",
            report: {
                meaning: "Clareza v4 é quando você sabe quem é e para onde está indo profissionalmente.",
                characteristics: ["Foco intencional", "Produtividade alta", "Senso de direção"],
                primary_risk: "Exaustão por alta performance.",
                recommended_focus: ["Manutenção", "Sistematização", "Legado"],
                next_step: "Escreva seu manifesto pessoal de trabalho para o próximo semestre.",
                immediate_win: "Passe 30 min planejando sua próxima semana estratégica.",
                the_no_to_say: "Diga NÃO a oportunidades que não alinham com seu propósito.",
                mindset_shift: "De 'Eu estou ocupado' para 'Eu estou focado'.",
                stoic_lesson: "Se o homem não sabe a que porto navega, nenhum vento é favorável.",
                stoic_principles: ["Foco do Arqueiro", "Prosenxe (Atenção)", "Ação Intencional"]
            }
        },
        en: {
            one_liner: "Work and Purpose pillars are in high harmony.",
            report: {
                meaning: "Clarity v4 is when you know who you are and where you are going professionally.",
                characteristics: ["Intentional focus", "High productivity", "Sense of direction"],
                primary_risk: "Burnout from high performance.",
                recommended_focus: ["Maintenance", "Systematization", "Legacy"],
                next_step: "Write your personal work manifesto for the next six months.",
                immediate_win: "Spend 30 min planning your next strategic week.",
                the_no_to_say: "Say NO to opportunities that don't align with your purpose.",
                mindset_shift: "From 'I am busy' to 'I am focused'.",
                stoic_lesson: "If a man knows not which port he sails, no wind is favorable.",
                stoic_principles: ["Archer's Focus", "Prosenxe (Attention)", "Intentional Action"]
            }
        },
        es: {
            one_liner: "Los pilares de Trabajo y Propósito están en alta sintonía.",
            report: {
                meaning: "Claridad v4 es cuando sabes quién eres y hacia dónde te diriges profesionalmente.",
                characteristics: ["Enfoque intencional", "Alta productividad", "Sentido de dirección"],
                primary_risk: "Agotamiento por alto rendimiento.",
                recommended_focus: ["Mantenimiento", "Sistematización", "Legado"],
                next_step: "Escribe tu manifiesto de trabajo personal para el próximo semestre.",
                immediate_win: "Pasa 30 min planificando tu próxima semana estratégica.",
                the_no_to_say: "Di NO a oportunidades que no se alineen con tu propósito.",
                mindset_shift: "De 'Estoy ocupado' a 'Estoy enfocado'.",
                stoic_lesson: "Si un hombre no sabe a qué puerto navega, ningún viento es favorable.",
                stoic_principles: ["Enfoque del Arquero", "Prosenxe (Atención)", "Action Intencional"]
            }
        }
    },
    ALIGNMENT: {
        pt: {
            one_liner: "Harmonia sistêmica entre os 7 pilares fundamentais.",
            report: {
                meaning: "Alinhamento v4 é a paz de quem tem uma base sólida em todas as áreas da vida.",
                characteristics: ["Gratidão profunda", "Resiliência total", "Flow existencial"],
                primary_risk: "Arrogância ou relaxamento excessivo.",
                recommended_focus: ["Mentorização", "Gratidão constante", "Sustentabilidade"],
                next_step: "Agradeça a 3 pessoas que fazem parte da sua rede de suporte hoje.",
                immediate_win: "Compartilhe uma lição aprendida com alguém.",
                the_no_to_say: "Diga NÃO à complacência.",
                mindset_shift: "De 'Eu conquistei' para 'Eu sustento com virtude'.",
                stoic_lesson: "A felicidade é um fluxo de vida suave e sem obstáculos.",
                stoic_principles: ["Gratidão estoica", "Apatheia (Paz interior)", "Vida virtuosa"]
            }
        },
        en: {
            one_liner: "Systemic harmony between the 7 fundamental pillars.",
            report: {
                meaning: "Alignment v4 is the peace of someone who has a solid foundation in all areas of life.",
                characteristics: ["Deep gratitude", "Total resilience", "Existential flow"],
                primary_risk: "Arrogance or excessive relaxation.",
                recommended_focus: ["Mentoring", "Constant gratitude", "Sustainability"],
                next_step: "Thank 3 people who are part of your support network today.",
                immediate_win: "Share a lesson learned with someone.",
                the_no_to_say: "Say NO to complacency.",
                mindset_shift: "From 'I achieved it' to 'I sustain it with virtue'.",
                stoic_lesson: "Happiness is a smooth and unobstructed flow of life.",
                stoic_principles: ["Stoic Gratitude", "Apatheia (Inner Peace)", "Virtuous Life"]
            }
        },
        es: {
            one_liner: "Armonía sistémica entre los 7 pilares fundamentales.",
            report: {
                meaning: "Alineación v4 es la paz de quien tiene una base sólida en todas las áreas de la vida.",
                characteristics: ["Gratitud profunda", "Resiliencia total", "Flujo existencial"],
                primary_risk: "Arrogancia o relajación excesiva.",
                recommended_focus: ["Mentoría", "Gratitud constante", "Sostenibilidad"],
                next_step: "Agradece a 3 personas que forman parte de tu red de apoyo hoy.",
                immediate_win: "Comparte una lección aprendida con alguien.",
                the_no_to_say: "Di NO a la complacencia.",
                mindset_shift: "De 'Lo logré' a 'Lo mantengo con virtud'.",
                stoic_lesson: "La felicidad es un flujo de vida suave y sin obstáculos.",
                stoic_principles: ["Gratitud estoica", "Apatheia (Paz interior)", "Vida virtuosa"]
            }
        }
    },
};

export function calculateDiagnosis(answers: Record<number, number>, locale: Locale = "pt"): DiagnosisResult {
    // Pillars mapping
    const pillarMap = {
        SAUDE: [1, 2, 3],
        TRABALHO: [4, 5, 6],
        RELACIONAMENTOS: [7, 8, 9],
        FINANCEIRO: [10, 11, 12],
        IDENTIDADE: [13, 14, 15],
        LAZER: [16, 17, 18],
        ESPIRITUALIDADE: [19, 20, 21]
    };

    const pillarColors = {
        SAUDE: "#FF5F5F",
        TRABALHO: "#4FACFE",
        RELACIONAMENTOS: "#FF5D9E",
        FINANCEIRO: "#2AF598",
        IDENTIDADE: "#C471ED",
        LAZER: "#FEE140",
        ESPIRITUALIDADE: "#7980FF"
    };

    const pillarLabels = {
        pt: { SAUDE: "Saúde", TRABALHO: "Trabalho", RELACIONAMENTOS: "Relações", FINANCEIRO: "Financeiro", IDENTIDADE: "Identidade", LAZER: "Lazer", ESPIRITUALIDADE: "Sentido" },
        en: { SAUDE: "Health", TRABALHO: "Work", RELACIONAMENTOS: "Relations", FINANCEIRO: "Finance", IDENTIDADE: "Identity", LAZER: "Leisure", ESPIRITUALIDADE: "Meaning" },
        es: { SAUDE: "Salud", TRABALHO: "Trabajo", RELACIONAMENTOS: "Relaciones", FINANCEIRO: "Finanzas", IDENTIDADE: "Identidad", LAZER: "Ocio", ESPIRITUALIDADE: "Sentido" }
    };

    const scores: Record<string, number> = {};
    const pillarScoresList: PillarScore[] = [];

    const getPillarInsight = (name: string, score: number, loc: Locale) => {
        const insights: Record<string, Record<Locale, { low: string, mid: string, high: string }>> = {
            SAUDE: {
                pt: { low: "Nível crítico de vitalidade. Sua capacidade de resposta biológica está comprometida.", mid: "Estado de manutenção básica. Existe energia, mas falta reserva para alta performance.", high: "Vitalidade excepcional. Seu corpo é uma máquina de suporte para sua mente." },
                en: { low: "Critical vitality level. Your biological response capacity is compromised.", mid: "Basic maintenance state. Energy exists, but lacks reserve for high performance.", high: "Exceptional vitality. Your body is a support machine for your mind." },
                es: { low: "Nivel crítico de vitalidad. Su capacidad de respuesta biológica está comprometida.", mid: "Estado de mantenimiento básico. Hay energía, pero falta reserva para el alto rendimiento.", high: "Vitalidad excepcional. Su cuerpo es una máquina de soporte para su mente." }
            },
            TRABALHO: {
                pt: { low: "Desalinhamento profissional severo ou falta de progresso claro.", mid: "Execução estável, mas o potencial de impacto ainda não foi totalmente liberado.", high: "Maestria profissional. Você opera em estado de fluxo e geração de valor constante." },
                en: { low: "Severe professional misalignment or lack of clear progress.", mid: "Stable execution, but impact potential has not yet been fully released.", high: "Professional mastery. You operate in a state of flow and constant value generation." },
                es: { low: "Desalineación profesional severa o falta de progreso claro.", mid: "Ejecución estable, pero el potencial de impacto aún no se ha liberado por completo.", high: "Maestría profesional. Usted opera en un estado de flujo y generación de valor constante." }
            },
            RELACIONAMENTOS: {
                pt: { low: "Isolamento ou toxicidade sistêmica. Suas conexões estão drenando sua energia.", mid: "Círculos estáveis, mas falta profundidade ou suporte emocional genuíno.", high: "Ecossistema relacional poderoso. Sua rede é sua maior fonte de segurança e suporte." },
                en: { low: "Isolation or systemic toxicity. Your connections are draining your energy.", mid: "Stable circles, but lack depth or genuine emotional support.", high: "Powerful relational ecosystem. Your network is your greatest source of security and support." },
                es: { low: "Aislamiento o toxicidad sistémica. Sus conexiones están drenando su energía.", mid: "Círculos estables, pero falta profundidad o apoyo emocional genuino.", high: "Ecosistema relacional poderoso. Su red es su mayor fuente de seguridad y apoyo." }
            },
            FINANCEIRO: {
                pt: { low: "Escassez severa ou desorganização que gera ansiedade constante.", mid: "Estabilidade básica, mas sem a autonomia necessária para decisões audaciosas.", high: "Antifragilidade financeira. Seus recursos sustentam sua liberdade e expansão." },
                en: { low: "Severe scarcity or disorganization generating constant anxiety.", mid: "Basic stability, but without the autonomy needed for audacious decisions.", high: "Financial antifragility. Your resources sustain your freedom and expansion." },
                es: { low: "Escasez severa o desorganización que genera ansiedad constante.", mid: "Estabilidad básica, pero sin la autonomía necesaria para decisiones audaces.", high: "Antifragilidad financiera. Sus recursos sostienen su libertad y expansión." }
            },
            IDENTIDADE: {
                pt: { low: "Crise de self. Falta clareza sobre valores e limites pessoais.", mid: "Você sabe quem é, mas ainda se curva a pressões externas excessivas.", high: "Sobraniedade absoluta. Sua identidade é o eixo inabalável de todas as suas ações." },
                en: { low: "Self-crisis. Lack of clarity about personal values and boundaries.", mid: "You know who you are, but still bow to excessive external pressures.", high: "Absolute sovereignty. Your identity is the unshakable axis of all your actions." },
                es: { low: "Crisis de identidad. Falta de claridad sobre valores y límites personales.", mid: "Sabe quién es, pero todavía se pliega a presiones externas excesivas.", high: "Soberanía absoluta. Su identidad es el eje inquebrantable de todas sus acciones." }
            },
            LAZER: {
                pt: { low: "Anedonia ou negligência total com a diversão. Risco alto de colapso por rigidez.", mid: "Momentos de pausa ocorrem, mas não geram regeneração profunda.", high: "Regeneração ativa. Você utiliza o lazer como ferramenta estratégica de alta performance." },
                en: { low: "Anhedonia or total neglect of fun. High risk of collapse due to rigidity.", mid: "Pauses occur, but do not generate deep regeneration.", high: "Active regeneration. You use leisure as a strategic high-performance tool." },
                es: { low: "Anhedonia o negligencia total con la diversión. Alto riesgo de colapso por rigidez.", mid: "Hay momentos de pausa, pero no generan una regeneración profunda.", high: "Regeneración activa. Utiliza el ocio como herramienta estratégica de alto rendimiento." }
            },
            ESPIRITUALIDADE: {
                pt: { low: "Vazio existencial profundo. Suas ações carecem de um porquê maior.", mid: "Conexão esporádica com propósito, mas o cotidiano ainda parece puramente material.", high: "Propósito transcendental. Existe uma conexão clara com o Sentido que guia sua vida." },
                en: { low: "Deep existential emptiness. Your actions lack a higher why.", mid: "Sporadic connection with purpose, but everyday life still feels purely material.", high: "Transcendental purpose. There is a clear connection with the Meaning that guides your life." },
                es: { low: "Vacío existencial profundo. Sus acciones carecen de un porqué mayor.", mid: "Conexión esporádica con el propósito, pero lo cotidiano aún parece puramente material.", high: "Propósito trascendental. Existe una conexión clara con el Sentido que guía su vida." }
            }
        };

        const tier = score < 40 ? "low" : score < 75 ? "mid" : "high";
        return insights[name][loc][tier];
    };

    (Object.entries(pillarMap) as [keyof typeof pillarMap, number[]][]).forEach(([name, qIds]) => {
        const sum = qIds.reduce((acc, qId) => acc + (answers[qId] || 0), 0);
        const avg = sum / qIds.length;
        const scoreValue = Math.round(avg * 20);
        scores[name] = avg;
        pillarScoresList.push({
            label: pillarLabels[locale][name],
            value: scoreValue,
            color: pillarColors[name],
            insight: getPillarInsight(name, scoreValue, locale)
        });
    });

    const overallAvg = Object.values(scores).reduce((a, b) => a + b, 0) / 7;

    // Determination Logic
    let state: DiagnosisState = "CLARITY";

    if (overallAvg >= 4.5) state = "ALIGNMENT";
    else if (overallAvg >= 3.8) state = "CLARITY";
    else if (scores.SAUDE + scores.LAZER < 5.5) state = "OVERLOAD";
    else if (scores.IDENTIDADE + scores.ESPIRITUALIDADE < 5.5) state = "DISCONNECTION";
    else if (scores.TRABALHO + scores.FINANCEIRO < 5.5) state = "UNCERTAINTY";
    else if (scores.RELACIONAMENTOS < 2.5) state = "REACTIVITY";
    else if (scores.IDENTIDADE < 3) state = "CONFUSION";
    else if (overallAvg < 2.8) state = "STAGNATION";

    const data = statesData[state][locale];
    const config = STATE_CONFIGS[state];

    // V3 Intelligence Logic
    const bottleneck = pillarScoresList.reduce((prev, curr) => prev.value < curr.value ? prev : curr);

    // Antifragility: (Identity + Meaning + Health) / 3
    const idScore = pillarScoresList.find(p => p.label === pillarLabels[locale].IDENTIDADE)?.value || 0;
    const spirScore = pillarScoresList.find(p => p.label === pillarLabels[locale].ESPIRITUALIDADE)?.value || 0;
    const healthScore = pillarScoresList.find(p => p.label === pillarLabels[locale].SAUDE)?.value || 0;
    const antifragilityScore = Math.round((idScore + spirScore + healthScore) / 3);

    const correlations: string[] = [];
    const workScore = pillarScoresList.find(p => p.label === pillarLabels[locale].TRABALHO)?.value || 0;
    const financeScore = pillarScoresList.find(p => p.label === pillarLabels[locale].FINANCEIRO)?.value || 0;
    const relScore = pillarScoresList.find(p => p.label === pillarLabels[locale].RELACIONAMENTOS)?.value || 0;

    if (locale === "pt") {
        if (workScore > 80 && healthScore < 50) correlations.push("Sua alta performance no Trabalho está asfixiando sua Recuperação Física.");
        if (financeScore < 40 && relScore < 50) correlations.push("A instabilidade Financeira está gerando reatividade nos seus Relacionamentos.");
        if (idScore > 85 && spirScore < 40) correlations.push("Sua forte Identidade precisa de um Propósito maior para evitar o vazio existencial.");
        if (healthScore < 40) correlations.push("Sua baixa Vitalidade é o principal freio para sua clareza mental hoje.");
    } else if (locale === "es") {
        if (workScore > 80 && healthScore < 50) correlations.push("Tu alto desempeño en el Trabajo está asfixiando tu Recuperación Física.");
        if (financeScore < 40 && relScore < 50) correlations.push("La inestabilidad Financiera está generando reactividad en tus Relaciones.");
        if (idScore > 85 && spirScore < 40) correlations.push("Tu fuerte Identidad necesita un Propósito mayor para evitar el vacío existencial.");
        if (healthScore < 40) correlations.push("Tu baja Vitalidad es el principal freno para tu claridad mental hoy.");
    } else {
        if (workScore > 80 && healthScore < 50) correlations.push("High Work performance is suffocating your Physical Recovery.");
        if (financeScore < 40 && relScore < 50) correlations.push("Financial instability is triggering reactivity in your Relationships.");
        if (idScore > 85 && spirScore < 40) correlations.push("Your strong Identity needs a higher Purpose to avoid existential emptiness.");
        if (healthScore < 40) correlations.push("Your low Vitality is the main break for your mental clarity today.");
    }

    if (correlations.length === 0) {
        correlations.push(
            locale === "pt" ? "Seus pilares operam em relativa harmonia sistêmica." :
                locale === "es" ? "Tus pilares operan en relativa armonía sistémica." :
                    "Your pillars operate in relative systemic harmony."
        );
    }

    const archetypes = {
        pt: {
            "Architect of Destiny": "Arquiteto do Destino",
            "Transition Explorer": "Explorador em Transição"
        },
        es: {
            "Architect of Destiny": "Arquitecto del Destino",
            "Transition Explorer": "Explorador en Transición"
        },
        en: {
            "Architect of Destiny": "Architect of Destiny",
            "Transition Explorer": "Transition Explorer"
        }
    };

    const currentArchetype = overallAvg > 4 ? "Architect of Destiny" : "Transition Explorer";

    return {
        state,
        label: config.labels[locale],
        color: config.color,
        confidence: Math.min(100, Math.floor(70 + overallAvg * 6)),
        one_liner: data.one_liner,
        report: data.report,
        pillarScores: pillarScoresList,
        v3Insights: {
            antifragilityScore,
            bottleneckLabel: bottleneck.label,
            correlations,
            archetype: archetypes[locale][currentArchetype]
        }
    };
}

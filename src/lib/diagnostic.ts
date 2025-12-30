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
        { id: 1, text: "Sinto que minha lista de tarefas é maior do que as horas úteis do meu dia." },
        { id: 2, text: "Sei exatamente qual é a minha prioridade #1 hoje e por que ela importa." },
        { id: 3, text: "Começo várias tarefas ao mesmo tempo, mas tenho dificuldade em terminar qualquer uma." },
        { id: 4, text: "Sinto que estou 'apagando incêndios' o tempo todo em vez de focar no planejado." },
        { id: 5, text: "Minhas reações a pequenos problemas são mais intensas do que deveriam." },
        { id: 6, text: "Sinto-me entusiasmado e 'em fluxo' (flow) durante a maior parte do meu trabalho." },
        { id: 7, text: "Faço o que precisa ser feito, mas me sinto emocionalmente distante dos resultados." },
        { id: 8, text: "Uma pequena crítica ao meu trabalho parece um ataque pessoal direto." },
        { id: 9, text: "Adio decisões importantes porque sinto que ainda faltam informações cruciais." },
        { id: 10, text: "Sinto que estou no mesmo lugar de 6 meses atrás, apesar de estar ocupado." },
        { id: 11, text: "Minhas ações atuais estão perfeitamente alinhadas com meus objetivos de longo prazo." },
        { id: 12, text: "Sinto um frio na barriga de insegurança ao pensar nos próximos passos da minha carreira." },
        { id: 13, text: "Sinto que meu potencial está sendo desperdiçado em tarefas repetitivas." },
        { id: 14, text: "Termino o dia com a sensação de dever cumprido, mesmo cansado." },
        { id: 15, text: "Meu corpo apresenta sinais físicos de cansaço (sono, dores) persistentes." },
        { id: 16, text: "Sinto que não tenho permissão para parar e descansar, mesmo quando terminaria tudo." },
    ],
    en: [
        { id: 1, text: "I feel my to-do list is longer than the productive hours in my day." },
        { id: 2, text: "I know exactly what my #1 priority is today and why it matters." },
        { id: 3, text: "I start multiple tasks at once but struggle to finish any." },
        { id: 4, text: "I feel like I'm 'putting out fires' all the time instead of focusing on plans." },
        { id: 5, text: "My reactions to small problems are more intense than they should be." },
        { id: 6, text: "I feel enthusiastic and 'in flow' during most of my work." },
        { id: 7, text: "I do what needs to be done, but I feel emotionally distant from the results." },
        { id: 8, text: "A small critique of my work feels like a direct personal attack." },
        { id: 9, text: "I postpone important decisions because I feel crucial information is missing." },
        { id: 10, text: "I feel like I'm in the same place as 6 months ago, despite being busy." },
        { id: 11, text: "My current actions are perfectly aligned with my long-term goals." },
        { id: 12, text: "I feel a knot of insecurity when thinking about my next career steps." },
        { id: 13, text: "I feel my potential is being wasted on repetitive tasks." },
        { id: 14, text: "I end the day with a sense of accomplishment, even if tired." },
        { id: 15, text: "My body shows physical signs of persistent fatigue (sleep, aches)." },
        { id: 16, text: "I feel I don't have permission to stop and rest, even when everything is done." },
    ],
    es: [
        { id: 1, text: "Siento que mi lista de tareas es más larga que las horas productivas de mi día." },
        { id: 2, text: "Sé exactamente cuál es mi prioridad #1 hoy y por qué es importante." },
        { id: 3, text: "Empiezo múltiples tareas a la vez pero me cuesta terminar alguna." },
        { id: 4, text: "Siento que estoy 'apagando incendios' todo el tiempo en lugar de enfocarme en lo planeado." },
        { id: 5, text: "Mis reacciones a pequeños problemas son más intensas de lo que deberían ser." },
        { id: 6, text: "Me siento entusiasmado y 'en flujo' durante la mayor parte de mi trabajo." },
        { id: 7, text: "Hago lo que hay que hacer, pero me siento emocionalmente distante de los resultados." },
        { id: 8, text: "Una pequeña crítica a mi trabajo se siente como un ataque personal directo." },
        { id: 9, text: "Pospongo decisiones importantes porque siento que falta información crucial." },
        { id: 10, text: "Siento que estoy en el mismo lugar que hace 6 meses, a pesar de estar ocupado." },
        { id: 11, text: "Mis acciones actuales están perfectamente alineadas con mis metas a largo plazo." },
        { id: 12, text: "Siento un nudo de inseguridad al pensar en los próximos pasos de mi carrera." },
        { id: 13, text: "Siento que mi potencial se está desperdiciando en tareas repetitivas." },
        { id: 14, text: "Termino el día con una sensación de logro, incluso si estoy cansado." },
        { id: 15, text: "Mi cuerpo muestra signos físicos de fatiga persistente (sueño, dolores)." },
        { id: 16, text: "Siento que no tengo permiso para parar y descansar, incluso cuando todo está terminado." },
    ]
};

const statesData: Record<DiagnosisState, Record<Locale, { one_liner: string, report: ReportContent }>> = {
    CONFUSION: {
        pt: {
            one_liner: "Dificuldade em organizar sinais internos em prioridades claras.",
            report: {
                meaning: "O estado de Confusão ocorre quando há excesso de informação sem um filtro de relevância ativo.",
                characteristics: ["Indecisão sobre pequenos passos", "Sensação de névoa mental", "Troca constante de foco"],
                primary_risk: "Paralisia por análise ou gasto de energia em tarefas irrelevantes.",
                recommended_focus: ["Simplificação radical", "Escrita analítica", "Isolamento de variáveis"],
                next_step: "Escolha uma única tarefa de 15 minutos e ignore todo o resto.",
                immediate_win: "Esvazie a mente: anote absolutamente tudo o que está te preocupando em um papel por 10 minutos.",
                the_no_to_say: "Diga NÃO a novos inputs: feche abas extras, silencie notificações e não abra novos projetos hoje.",
                mindset_shift: "De 'Eu preciso resolver tudo' para 'Eu só preciso ver o próximo passo nítido'.",
                stoic_lesson: "A felicidade da sua vida depende da qualidade dos seus pensamentos. Se a mente está confusa, simplifique a percepção.",
                stoic_principles: [
                    "Viva em harmonia com a natureza e você viverá em harmonia consigo mesmo.",
                    "O sucesso não é fazer mais, mas estar em paz com o que você faz.",
                    "Quando você está alinhado, o esforço se torna fluxo."
                ],
                stoic_principles: [
                    "A clareza de mente é a base de toda grande realização.",
                    "Simplicidade é a sofisticação máxima.",
                    "O sábio não busca mais, mas melhor."
                ],
                stoic_principles: [
                    "O conforto é o inimigo do progresso.",
                    "Se você não está crescendo, está morrendo.",
                    "A zona de conforto é um lugar bonito, mas nada cresce lá."
                ],
                stoic_principles: [
                    "A vida sem propósito é como um navio sem leme.",
                    "Não é a duração da vida que importa, mas a profundidade dela.",
                    "Quem tem um porquê para viver pode suportar quase qualquer como."
                ],
                stoic_principles: [
                    "A ação cura o medo. A inação o alimenta.",
                    "Não espere o momento perfeito. Tome o momento e o torne perfeito.",
                    "O obstáculo não está no caminho. O obstáculo é o caminho."
                ],
                stoic_principles: [
                    "Entre estímulo e resposta há um espaço. Nesse espaço está o seu poder.",
                    "A raiva é uma punição que você dá a si mesmo pelo erro de outro.",
                    "Não é o que acontece com você, mas como você reage que importa."
                ],
                stoic_principles: [
                    "Não é nobre ser superior aos outros. A verdadeira nobreza está em ser superior ao seu eu anterior.",
                    "O homem sábio não se sobrecarrega com o que não pode controlar.",
                    "Menos, mas melhor. Esta é a essência da sabedoria."
                ],
                stoic_principles: [
                    "Não é a quantidade de informação que importa, mas a qualidade da sua atenção.",
                    "A sabedoria não está em saber tudo, mas em saber o que ignorar.",
                    "Quando tudo parece urgente, nada é realmente importante."
                ]
            }
        },
        en: {
            one_liner: "Difficulty organizing internal signals into clear priorities.",
            report: {
                meaning: "Confusion occurs when there is an information overload without an active relevance filter.",
                characteristics: ["Indecision over small steps", "Brain fog sensation", "Constant focus switching"],
                primary_risk: "Analysis paralysis or wasting energy on irrelevant tasks.",
                recommended_focus: ["Radical simplification", "Analytical writing", "Isolation of variables"],
                next_step: "Choose a single 15-minute task and ignore everything else.",
                immediate_win: "Brain dump: write down absolutely everything on your mind for 10 minutes.",
                the_no_to_say: "Say NO to new inputs: close extra tabs, mute notifications, and don't start new projects today.",
                mindset_shift: "From 'I need to solve everything' to 'I just need to see the next clear step'.",
                stoic_lesson: "The happiness of your life depends upon the quality of your thoughts. If the mind is confused, simplify the perception.",
                stoic_principles: [
                    "It's not the quantity of information that matters, but the quality of your attention.",
                    "Wisdom is not knowing everything, but knowing what to ignore.",
                    "When everything seems urgent, nothing is truly important."
                ]
            }
        },
        es: {
            one_liner: "Dificultad para organizar señales internas en prioridades claras.",
            report: {
                meaning: "La confusión ocurre cuando hay un exceso de información sin un filtro de relevancia activo.",
                characteristics: ["Indecisión sobre pequeños pasos", "Sensación de niebla mental", "Cambio constante de enfoque"],
                primary_risk: "Parálisis por análisis o gasto de energía en tareas ilevantes.",
                recommended_focus: ["Simplificación radical", "Escritura analítica", "Aislamiento de variables"],
                next_step: "Elige una sola tarea de 15 minutos e ignora todo lo demás.",
                immediate_win: "Vacía tu mente: anota absolutamente todo lo que te preocupa en un papel durante 10 minutos.",
                the_no_to_say: "Di NO a nuevas entradas: cierra pestañas adicionales, silencia notificaciones y no abras nuevos proyectos hoy.",
                mindset_shift: "De 'Necesito resolver todo' a 'Solo necesito ver el siguiente paso claro'.",
                stoic_lesson: "La felicidad de tu vida depende de la calidad de tus pensamientos. Si la mente está confundida, simplifica la percepción.",
                stoic_principles: [
                    "No es la cantidad de información lo que importa, sino la calidad de tu atención.",
                    "La sabiduría no está en saberlo todo, sino en saber qué ignorar.",
                    "Cuando todo parece urgente, nada es realmente importante."
                ]
            }
        }
    },
    OVERLOAD: {
        pt: {
            one_liner: "Capacidade de processamento atingida por excesso de volume operacional.",
            report: {
                meaning: "Sobrecarga é um estado quantitativo. Não é falta de clareza, é falta de espaço.",
                characteristics: ["Velocidade mental alta", "Cansaço físico evidente", "Memória de curto prazo falha"],
                primary_risk: "Burnout agudo ou erros críticos por desatenção.",
                recommended_focus: ["Delegação agressiva", "Pausas de silêncio", "Redução de input"],
                next_step: "Cancele ou adie duas reuniões nas próximas 24 horas.",
                immediate_win: "Haz un 'hard reset': 5 minutos de respiración profunda en silencio total, sin pantallas.",
                the_no_to_say: "Di NO a tareas de 'baja densidad': delega agresivamente cualquier cosa que no requiera estrictamente tu talento único.",
                mindset_shift: "De 'Mantén los engranajes girando' a '¿Qué passa si suelto este peso?'.",
                stoic_lesson: "Não é por as coisas serem difíceis que não ousamos; é por não ousarmos que elas são difíceis. Reduza o volume para recuperar a coragem.",
                stoic_principles: [
                    "Não é nobre ser superior aos outros. A verdadeira nobreza está em ser superior ao seu eu anterior.",
                    "O homem sábio não se sobrecarrega com o que não pode controlar.",
                    "Menos, mas melhor. Esta é a essência da sabedoria."
                ]
            }
        },
        en: {
            one_liner: "Processing capacity reached due to excessive operational volume.",
            report: {
                meaning: "Overload is a quantitative state. It's not a lack of clarity, but a lack of space.",
                characteristics: ["High mental speed", "Evident physical fatigue", "Short-term memory failure"],
                primary_risk: "Acute burnout or critical errors due to inattention.",
                recommended_focus: ["Aggressive delegation", "Periods of silence", "Input reduction"],
                next_step: "Cancel or postpone two meetings in the next 24 hours.",
                immediate_win: "Hard reset: 5 minutes of deep breathing in total silence, no screens.",
                the_no_to_say: "Say NO to low-density tasks: aggressively delegate anything that doesn't strictly require your unique talent.",
                mindset_shift: "From 'Keep the gears turning' to 'What happens if I let this weight go?'.",
                stoic_lesson: "It is not because things are difficult that we do not dare; it is because we do not dare that they are difficult. Reduce the volume to recover your courage."
            }
        },
        es: {
            one_liner: "Capacidad de procesamiento alcanzada por exceso de volumen operativo.",
            report: {
                meaning: "La sobrecarga es un estado cuantitativo. No é falta de claridad, sino falta de espacio.",
                characteristics: ["Velocidad mental alta", "Cansancio físico evidente", "Fallo de memoria a corto plazo"],
                primary_risk: "Burnout agudo o errores críticos por desatención.",
                recommended_focus: ["Delegación agresiva", "Pausas de silencio", "Reducción de entrada"],
                next_step: "Cancela o pospone dos reuniones en las próximas 24 horas.",
                immediate_win: "Haz un 'hard reset': 5 minutos de respiración profunda en silencio total, sin pantallas.",
                the_no_to_say: "Di NO a tareas de 'baja densidad': delega agresivamente cualquier cosa que no requiera estrictamente tu talento único.",
                mindset_shift: "De 'Mantén los engranajes girando' a '¿Qué pasa si suelto este peso?'.",
                stoic_lesson: "No es porque las cosas sean difíciles que no nos atrevemos; es porque no nos atrevemos que son difíciles. Reduce el volumen para recuperar la valentía."
            }
        }
    },
    REACTIVITY: {
        pt: {
            one_liner: "Esgotamento da regulação emocional e resposta defensiva.",
            report: {
                meaning: "Reatividade é quando o sistema nervoso assume o controle para proteção imediata.",
                characteristics: ["Respostas ríspidas", "Sensação de estar 'por um fio'", "Falta de paciência"],
                primary_risk: "Conflitos interpessoais e decisões impulsivas.",
                recommended_focus: ["Regulação do sono", "Atividade física moderada", "Distanciamento breve"],
                next_step: "Saia para uma caminhada de 20 minutos sem celular agora.",
                immediate_win: "Mude de ambiente físico: vá para outro cômodo, café ou parque para quebrar o ciclo de estresse.",
                the_no_to_say: "Diga NÃO a conversas difíceis: adie qualquer feedback ou DR para amanhã, quando estiver regulado.",
                mindset_shift: "De 'Eles estão contra mim' para 'Meu sistema está interpretando perigo onde há apenas ruído'.",
                stoic_lesson: "Você tem poder sobre sua mente - não sobre eventos externos. Perceba isso e você encontrará força.",
                stoic_principles: [
                    "Entre estímulo e resposta há um espaço. Nesse espaço está o seu poder.",
                    "A raiva é uma punição que você dá a si mesmo pelo erro de outro.",
                    "Não é o que acontece com você, mas como você reage que importa."
                ]
            }
        },
        en: {
            one_liner: "Emotional regulation depletion and defensive response.",
            report: {
                meaning: "Reactivity is when the nervous system takes control for immediate protection.",
                characteristics: ["Short responses", "Feeling 'on edge'", "Lack of patience"],
                primary_risk: "Interpersonal conflicts and impulsive decisions.",
                recommended_focus: ["Sleep regulation", "Moderate physical activity", "Brief distancing"],
                next_step: "Go for a 20-minute walk without your phone now.",
                immediate_win: "Change your physical environment: move to another room, cafe, or park to break the stress cycle.",
                the_no_to_say: "Say NO to difficult conversations: postpone any feedback or heavy talks until tomorrow when you're regulated.",
                mindset_shift: "From 'They are against me' to 'My system is interpreting danger where there is only noise'.",
                stoic_lesson: "You have power over your mind - not outside events. Realize this, and you will find strength."
            }
        },
        es: {
            one_liner: "Agotamiento de la regulación emocional y respuesta defensiva.",
            report: {
                meaning: "La reactividad es cuando el sistema nervioso toma el control para protección inmediata.",
                characteristics: ["Respuestas cortantes", "Sensación de estar 'al límite'", "Falta de paciencia"],
                primary_risk: "Conflictos interpersonales y decisiones impulsivas.",
                recommended_focus: ["Regulación del sueño", "Actividad física moderada", "Distanciamiento breve"],
                next_step: "Sal a caminar 20 minutos sin el celular ahora.",
                immediate_win: "Cambia tu entorno físico: ve a otra habitación, café o parque para romper el ciclo de estrés.",
                the_no_to_say: "Di NO a conversaciones difíciles: pospone cualquier feedback o charla pesada para mañana, cuando estés regulado.",
                mindset_shift: "De 'Están contra mí' a 'Mi sistema está interpretando peligro donde solo hay ruido'.",
                stoic_lesson: "Tienes poder sobre tu mente, no sobre los eventos externos. Date cuenta de esto y encontrarás la fuerza."
            }
        }
    },
    UNCERTAINTY: {
        pt: {
            one_liner: "Falta de dados futuristas gerando hesitação no presente.",
            report: {
                meaning: "Incerteza é a ausência de uma âncora de decisão clara.",
                characteristics: ["Busca por validação externa", "Procrastinação de decisões", "Ansiedade"],
                primary_risk: "Perda de oportunidades por hesitação.",
                recommended_focus: ["Definição de premissas mínimas", "Testes de validação", "Aceitação do risco"],
                next_step: "Defina um prazo final hoje para aquela decisão pendente.",
                immediate_win: "Tome uma decisão irreversível mas pequena: compre o ingresso, mande o convite, defina a data.",
                the_no_to_say: "Diga NÃO a mais pesquisas: você já tem 80% dos dados, os outros 20% só virão com a ação.",
                mindset_shift: "De 'Eu preciso ter certeza' para 'Eu preciso ter coragem para errar rápido'.",
                stoic_lesson: "Não espere que as coisas aconteçam como você deseja, mas deseje que elas aconteçam como acontecem, e você será feliz.",
                stoic_principles: [
                    "A ação cura o medo. A inação o alimenta.",
                    "Não espere o momento perfeito. Tome o momento e o torne perfeito.",
                    "O obstáculo não está no caminho. O obstáculo é o caminho."
                ]
            }
        },
        en: {
            one_liner: "Lack of futuristic data generating hesitation in the present.",
            report: {
                meaning: "Uncertainty is the absence of a clear decision anchor.",
                characteristics: ["Seeking external validation", "Decision procrastination", "Anxiety"],
                primary_risk: "Loss of opportunities due to hesitation.",
                recommended_focus: ["Defining minimum premises", "Validation tests", "Risk acceptance"],
                next_step: "Set a final deadline today for that pending decision.",
                immediate_win: "Make a small, irreversible decision: buy the ticket, send the invite, set the date.",
                the_no_to_say: "Say NO to more research: you already have 80% of the data; the other 20% will only come through action.",
                mindset_shift: "From 'I need to be sure' to 'I need the courage to fail fast'.",
                stoic_lesson: "Don't seek for everything to happen as you wish it would, but rather wish that everything happens as it actually will—then your life will flow well."
            }
        },
        es: {
            one_liner: "Falta de datos futuristas que generan dudas en el presente.",
            report: {
                meaning: "La incertidumbre es la ausencia de un ancla de decisión clara.",
                characteristics: ["Búsqueda de validación externa", "Procrastinación de decisiones", "Ansiedad"],
                primary_risk: "Pérdida de oportunidades por vacilación.",
                recommended_focus: ["Definición de premisas mínimas", "Pruebas de validación", "Aceptación del riesgo"],
                next_step: "Establece una fecha límite hoy para esa decisión pendiente.",
                immediate_win: "Toma una decisión pequeña pero irreversible: compra la entrada, envía la invitación, fija la fecha.",
                the_no_to_say: "Di NO a más investigación: ya tienes el 80% de los datos; el otro 20% solo vendrá con la acción.",
                mindset_shift: "De 'Necesito estar seguro' a 'Necesito tener el coraje de equivocarme rápido'.",
                stoic_lesson: "No busques que todo suceda como deseas, sino desea que todo suceda como realmente sucederá; entonces tu vida fluirá bien."
            }
        }
    },
    DISCONNECTION: {
        pt: {
            one_liner: "Afastamento dos propósitos centrais e pilotagem automática.",
            report: {
                meaning: "Desconexão é a perda do 'porquê'. As tarefas são feitas mecanicamente.",
                characteristics: ["Cinismo ou apatia", "Execução mecânica", "Sentimento de vazio"],
                primary_risk: "Burnout silencioso ou crise de identidade.",
                recommended_focus: ["Revisão de valores", "Feedback de mentores", "Hobby novo"],
                next_step: "Revisite seus objetivos de 1 ano agora.",
                immediate_win: "Ligue (não mande áudio) para uma pessoa que te inspira ou que você ajudou recentemente.",
                the_no_to_say: "Diga NÃO a tarefas 'pão com manteiga' por um momento: pare de fazer o básico por inércia e procure o que te faz brilhar os olhos.",
                mindset_shift: "De 'Eu só preciso terminar isso' para 'Por que eu comecei tudo isso mesmo?'.",
                stoic_lesson: "Muitas vezes sofremos mais na imaginação do que na realidade. Reconecte-se com o presente e com o que realmente importa.",
                stoic_principles: [
                    "A vida sem propósito é como um navio sem leme.",
                    "Não é a duração da vida que importa, mas a profundidade dela.",
                    "Quem tem um porquê para viver pode suportar quase qualquer como."
                ]
            }
        },
        en: {
            one_liner: "Detachment from core purposes and autopilot behavior.",
            report: {
                meaning: "Disconnection is the loss of the 'why'. Tasks are done mechanically.",
                characteristics: ["Cynicism or apathy", "Mechanical execution", "Sense of emptiness"],
                primary_risk: "Silent burnout or identity crisis.",
                recommended_focus: ["Value review", "Mentor feedback", "New hobby"],
                next_step: "Revisit your 1-year goals now.",
                immediate_win: "Call (don't voice note) someone who inspires you or someone you helped recently.",
                the_no_to_say: "Say NO to 'autopilot' tasks for a moment: stop doing the basics by inertia and seek what truly excites you.",
                mindset_shift: "From 'I just need to finish this' to 'Wait, why did I start all of this in the first place?'.",
                stoic_lesson: "We suffer more often in imagination than in reality. Reconnect with the present and what truly matters."
            }
        },
        es: {
            one_liner: "Alejamiento de los propósitos centrales y piloto automático.",
            report: {
                meaning: "La desconexión es la pérdida del 'por qué'. Las tareas se realizan mecánicamente.",
                characteristics: ["Cinismo o apatía", "Ejecución mecánica", "Sentimiento de vacío"],
                primary_risk: "Burnout silencioso o crisis de identidad.",
                recommended_focus: ["Revisión de valores", "Feedback de mentores", "Nuevo hobby"],
                next_step: "Vuelve a revisar tus objetivos de 1 año ahora.",
                immediate_win: "Llama (no envíes audio) a una persona que te inspire o a quien hayas ayudado recientemente.",
                the_no_to_say: "Di NO a las tareas de 'rutina' por un momento: deja de hacer lo básico por inercia y busca lo que te hace brillar los ojos.",
                mindset_shift: "De 'Solo necesito terminar esto' a '¿Por qué empecé todo esto en primer lugar?'.",
                stoic_lesson: "A menudo sufrimos más en la imaginación que en la realidad. Reconéctate con el presente y lo que realmente importa."
            }
        }
    },
    STAGNATION: {
        pt: {
            one_liner: "Sensação de ausência de movimento apesar do esforço.",
            report: {
                meaning: "Estagnação ocorre quando o sistema está em um platô sem crescimento.",
                characteristics: ["Tédio repetitivo", "Sensação de teto atingido", "Falta de novos desafios"],
                primary_risk: "Obsolescência e queda de motivação.",
                recommended_focus: ["Novo aprendizado", "Mudança de ambiente", "Networking"],
                next_step: "Marque uma conversa com alguém que está 3 passos à sua frente.",
                immediate_win: "Force um desconforto: inscreva-se em um curso difícil ou aceite um projeto que você não sabe como fazer.",
                the_no_to_say: "Diga NÃO ao conforto: pare de gastar energia no que você já domina 100%.",
                mindset_shift: "De 'Eu estou seguro aqui' para 'Eu estou morrendo lentamente no conforto'.",
                stoic_lesson: "É impossível para um homem aprender aquilo que ele acha que já sabe. Quebre a casca do conforto.",
                stoic_principles: [
                    "O conforto é o inimigo do progresso.",
                    "Se você não está crescendo, está morrendo.",
                    "A zona de conforto é um lugar bonito, mas nada cresce lá."
                ]
            }
        },
        en: {
            one_liner: "Sensation of lack of movement despite effort.",
            report: {
                meaning: "Stagnation occurs when the system is on a plateau without growth.",
                characteristics: ["Repetitive boredom", "Hitting a ceiling", "Lack of new challenges"],
                primary_risk: "Obsolescence and drop in motivation.",
                recommended_focus: ["New learning", "Change of environment", "Networking"],
                next_step: "Schedule a talk with someone who is 3 steps ahead of you.",
                immediate_win: "Force a discomfort: sign up for a difficult course or accept a project you don't know how to do yet.",
                the_no_to_say: "Say NO to comfort: stop wasting energy on what you already master 100%.",
                mindset_shift: "From 'I am safe here' to 'I am slowly dying in my comfort zone'.",
                stoic_lesson: "It is impossible for a man to learn what he thinks he already knows. Break the crust of comfort."
            }
        },
        es: {
            one_liner: "Sensación de falta de movimiento a pesar del esfuerzo.",
            report: {
                meaning: "El estancamiento ocurre cuando el sistema está en una meseta sin crecimiento.",
                characteristics: ["Aburrimiento repetitivo", "Sensación de techo alcanzado", "Falta de nuevos desafíos"],
                primary_risk: "Obsolescencia y caída de la motivación.",
                recommended_focus: ["Nuevo aprendizaje", "Cambio de entorno", "Networking"],
                next_step: "Agenda una charla con alguien que esté 3 pasos por delante de ti.",
                immediate_win: "Fuerza la incomodidad: inscríbete en un curso difícil o acepta un proyecto que no sepas cómo hacer.",
                the_no_to_say: "Di NO a la comodidad: deja de gastar energía en lo que ya dominas al 100%.",
                mindset_shift: "De 'Estoy seguro aquí' a 'Estoy muriendo lentamente en mi zona de confort'.",
                stoic_lesson: "Es imposible para un hombre aprender lo que cree que ya sabe. Rompe la cáscara de la comodidad."
            }
        }
    },
    CLARITY: {
        pt: {
            one_liner: "Visão nítida do contexto e das próximas ações.",
            report: {
                meaning: "Clareza é o estado ideal de processamento. Você vê os nós e sabe como resolvê-los.",
                characteristics: ["Foco sustentado", "Decisões rápidas", "Calma operacional"],
                primary_risk: "Excesso de confiança ou subestimação de riscos.",
                recommended_focus: ["Sistematização", "Documentação", "Expansão"],
                next_step: "Documente o seu processo atual para replicá-lo.",
                immediate_win: "Cronometre seu tempo em uma tarefa de alta complexidade e tente reduzir 10% através de sistema.",
                the_no_to_say: "Diga NÃO a distrações 'brilhantes': não desvie do plano agora que ele está funcionando.",
                mindset_shift: "De 'Eu estou correndo' para 'Eu estou construindo uma engrenagem que corre por mim'.",
                stoic_lesson: "Aquele que é bom em dar desculpas raramente é bom em qualquer outra coisa. Mantenha a clareza e a disciplina.",
                stoic_principles: [
                    "A clareza de mente é a base de toda grande realização.",
                    "Simplicidade é a sofisticação máxima.",
                    "O sábio não busca mais, mas melhor."
                ]
            }
        },
        en: {
            one_liner: "Clear vision of context and next actions.",
            report: {
                meaning: "Clarity is the ideal state of processing. You see the nodes and know how to untie them.",
                characteristics: ["Sustained focus", "Quick decisions", "Operational calm"],
                primary_risk: "Overconfidence or underestimating risks.",
                recommended_focus: ["Systematization", "Documentation", "Expansion"],
                next_step: "Document your current process to replicate it.",
                immediate_win: "Time yourself on a complex task and try to reduce it by 10% through systematic improvement.",
                the_no_to_say: "Say NO to 'shiny object' distractions: don't deviate from the plan now that it's working.",
                mindset_shift: "From 'I am running' to 'I am building a machine that runs for me'.",
                stoic_lesson: "He who is good for making excuses is seldom good for anything else. Maintain clarity and discipline."
            }
        },
        es: {
            one_liner: "Visión clara del contexto y de las próximas acciones.",
            report: {
                meaning: "La claridad es el estado ideal de procesamiento. Ves los nudos y sabes cómo deshacerlos.",
                characteristics: ["Enfoque sostenido", "Decisiones rápidas", "Calma operativa"],
                primary_risk: "Exceso de confianza o subestimación de riesgos.",
                recommended_focus: ["Sistematización", "Documentación", "Expansión"],
                next_step: "Documenta tu proceso actual para replicarlo.",
                immediate_win: "Cronometra tu tiempo en una tarea compleja e intenta reducirlo un 10% mediante una mejora sistemática.",
                the_no_to_say: "Di NO a las 'distracciones brillantes': no te desvíes del plan ahora que está funcionando.",
                mindset_shift: "De 'Estoy corriendo' a 'Estoy construyendo una máquina que corre por mí'.",
                stoic_lesson: "El que es bueno para poner excusas rara vez es bueno para cualquier otra cosa. Mantén la claridad y la disciplina."
            }
        }
    },
    ALIGNMENT: {
        pt: {
            one_liner: "Sincronia entre intenção, ação e resultado atual.",
            report: {
                meaning: "Alinhamento é o fluxo máximo. Energia gasta proporcional ao resultado.",
                characteristics: ["Flow", "Resultados sem esforço", "Alta resiliência"],
                primary_risk: "Acomodação no sucesso momentâneo.",
                recommended_focus: ["Manutenção de hábitos", "Compartilhamento", "Gratidão"],
                next_step: "Celebre um pequeno sucesso de hoje.",
                immediate_win: "Ajude alguém a chegar onde você está agora: o ensino solidifica seu alinhamento.",
                the_no_to_say: "Diga NÃO a mudanças desnecessárias: proteja seus rituais de energia a todo custo.",
                mindset_shift: "De 'O que mais eu preciso fazer?' para 'Como posso sustentar esse ritmo sem esforço?'.",
                stoic_lesson: "A perfeição da vida é passar cada dia como se fosse o último, sem agitação, sem torpor e sem pretensão.",
                stoic_principles: [
                    "Viva em harmonia com a natureza e você viverá em harmonia consigo mesmo.",
                    "O sucesso não é fazer mais, mas estar em paz com o que você faz.",
                    "Quando você está alinhado, o esforço se torna fluxo."
                ]
            }
        },
        en: {
            one_liner: "Synchrony between intention, action, and current outcome.",
            report: {
                meaning: "Alignment is the maximum flow. Energy spent proportional to outcome.",
                characteristics: ["Flow", "Effortless results", "High resilience"],
                primary_risk: "Settling in momentary success.",
                recommended_focus: ["Habit maintenance", "Sharing vision", "Gratitude"],
                next_step: "Celebrate a small success from today.",
                immediate_win: "Help someone get where you are now: teaching solidifies your own alignment.",
                the_no_to_say: "Say NO to unnecessary changes: protect your energy rituals at all costs.",
                mindset_shift: "From 'What else do I need to do?' to 'How can I sustain this effortless rhythm?'.",
                stoic_lesson: "Perfect behavior is to live each day as if it were your last—without frenzy, without apathy, without pretense."
            }
        },
        es: {
            one_liner: "Sincronía entre intención, acción y resultado actual.",
            report: {
                meaning: "La alineación es el flujo máximo. Energía gastada proporcional al resultado.",
                characteristics: ["Fluidez", "Resultados sin esfuerzo", "Alta resiliencia"],
                primary_risk: "Acomodación en el éxito momentáneo.",
                recommended_focus: ["Mantenimiento de hábitos", "Compartir visión", "Gratitud"],
                next_step: "Celebra un pequeño éxito de hoy.",
                immediate_win: "Ayuda a alguien a llegar a donde estás ahora: la enseñanza solidifica tu propia alineación.",
                the_no_to_say: "Di NO a cambios innecesarios: protege tus rituales de energía a toda costa.",
                mindset_shift: "De '¿Qué más necesito hacer?' a '¿Cómo puedo mantener este ritmo sin esfuerzo?'.",
                stoic_lesson: "La perfección de carácter consiste en pasar cada día como se fuera el último, sin agitación, sin letargia y sin hipocresía."
            }
        }
    },
};

export function calculateDiagnosis(answers: Record<number, number>, locale: Locale = "pt"): DiagnosisResult {
    // Scoring logic for 16 questions
    // Map of question ID to influencing categories
    const points: Record<DiagnosisState, number> = {
        CONFUSION: (answers[3] || 0) + (answers[4] || 0),
        OVERLOAD: (answers[1] || 0) + (answers[15] || 0) + (answers[16] || 0),
        REACTIVITY: (answers[5] || 0) + (answers[8] || 0),
        UNCERTAINTY: (answers[9] || 0) + (answers[12] || 0),
        DISCONNECTION: (answers[7] || 0),
        STAGNATION: (answers[10] || 0) + (answers[13] || 0),
        CLARITY: (answers[2] || 0) + (answers[14] || 0),
        ALIGNMENT: (answers[6] || 0) + (answers[11] || 0)
    };

    // Normalize points (since different number of questions per state)
    const counts: Record<DiagnosisState, number> = {
        CONFUSION: 2, OVERLOAD: 3, REACTIVITY: 2, UNCERTAINTY: 2,
        DISCONNECTION: 1, STAGNATION: 2, CLARITY: 2, ALIGNMENT: 2
    };

    const averages = (Object.keys(points) as DiagnosisState[]).map(state => ({
        state,
        avg: points[state] / counts[state]
    }));

    // Find state with highest average
    const winner = averages.reduce((prev, current) => (prev.avg > current.avg) ? prev : current);

    const data = statesData[winner.state][locale];
    const config = STATE_CONFIGS[winner.state];

    return {
        state: winner.state,
        label: config.labels[locale],
        color: config.color,
        confidence: Math.floor(75 + winner.avg * 5), // Higher average = higher confidence
        one_liner: data.one_liner,
        report: data.report
    };
}

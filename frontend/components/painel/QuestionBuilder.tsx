"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FiHelpCircle, FiPlus, FiTrash2 } from "react-icons/fi";

import { Card, Input, Switch, Text } from "@/components/ui";

/** Pergunta em edição. Carrega uma chave local porque o item ainda não salvo
 * não tem id, e o React precisa de algo estável para não perder o foco do
 * input a cada tecla digitada. */
export interface DraftQuestionOption {
  key: string;
  id?: number;
  name: string;
  description: string;
  price_delta: string;
}

export interface DraftQuestion {
  key: string;
  id?: number;
  name: string;
  is_addon: boolean;
  is_required: boolean;
  options: DraftQuestionOption[];
}

export function newOption(): DraftQuestionOption {
  return { key: `op-${crypto.randomUUID()}`, name: "", description: "", price_delta: "" };
}

export function newQuestion(): DraftQuestion {
  return {
    key: `q-${crypto.randomUUID()}`,
    name: "",
    is_addon: false,
    is_required: false,
    options: [newOption()],
  };
}

export interface QuestionBuilderProps {
  questions: DraftQuestion[];
  onChange: (questions: DraftQuestion[]) => void;
}

export function QuestionBuilder({ questions, onChange }: QuestionBuilderProps) {
  function updateQuestion(key: string, patch: Partial<DraftQuestion>) {
    onChange(questions.map((item) => (item.key === key ? { ...item, ...patch } : item)));
  }

  function updateOption(
    questionKey: string,
    optionKey: string,
    patch: Partial<DraftQuestionOption>,
  ) {
    onChange(
      questions.map((question) =>
        question.key === questionKey
          ? {
              ...question,
              options: question.options.map((option) =>
                option.key === optionKey ? { ...option, ...patch } : option,
              ),
            }
          : question,
      ),
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Text variant="muted">
        Insira as perguntas necessárias que você precisa para fazer o pedido e as opções de cada
        pergunta. Elas aparecem para o cliente na hora de montar o produto.
      </Text>

      <AnimatePresence initial={false}>
        {questions.map((question, index) => (
          <motion.div
            key={question.key}
            layout
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <Card className="flex flex-col gap-4 p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <Input
                    label={`Pergunta ${index + 1}`}
                    name={`question-${question.key}`}
                    placeholder={`Pergunta ${index + 1}`}
                    value={question.name}
                    onChange={(event) =>
                      updateQuestion(question.key, { name: event.target.value })
                    }
                  />
                </div>
                <button
                  type="button"
                  onClick={() => onChange(questions.filter((item) => item.key !== question.key))}
                  aria-label={`Remover pergunta ${index + 1}`}
                  className="mt-6 flex size-10 shrink-0 items-center justify-center rounded-xl
                    text-ink-muted transition-colors hover:bg-danger/10 hover:text-danger"
                >
                  <FiTrash2 size={18} />
                </button>
              </div>

              <Switch
                label="É um adicional?"
                checked={question.is_addon}
                onChange={(checked) =>
                  updateQuestion(question.key, {
                    is_addon: checked,
                    // Sair de adicional volta para composição, que é sempre
                    // obrigatória — deixar o toggle ligado enganaria o dono.
                    is_required: checked ? question.is_required : false,
                  })
                }
              />

              <p className="flex items-start gap-2 rounded-xl bg-paper px-3 py-2.5 text-sm text-ink-muted">
                <FiHelpCircle size={16} className="mt-0.5 shrink-0" aria-hidden />
                {question.is_addon ? (
                  <span>
                    O cliente pode escolher <strong>quantas opções quiser</strong> e cada uma soma
                    o valor que você definir.
                  </span>
                ) : (
                  <span>
                    O cliente escolhe <strong>uma opção só</strong>, e é obrigatório. Sem preço,
                    porque já está incluso no valor do produto.
                  </span>
                )}
              </p>

              {question.is_addon && (
                <Switch
                  label="É obrigatório?"
                  checked={question.is_required}
                  onChange={(checked) => updateQuestion(question.key, { is_required: checked })}
                />
              )}

              <div className="flex flex-col gap-3 border-t border-border pt-4">
                <Text variant="label">Opções</Text>

                {question.options.map((option, optionIndex) => (
                  <div key={option.key} className="flex items-start gap-2">
                    <div className="grid flex-1 gap-2 sm:grid-cols-[2fr_1fr]">
                      <Input
                        label={`Opção ${optionIndex + 1}`}
                        name={`option-${option.key}`}
                        placeholder="Ex: Pão Australiano"
                        value={option.name}
                        onChange={(event) =>
                          updateOption(question.key, option.key, { name: event.target.value })
                        }
                      />
                      {question.is_addon && (
                        <Input
                          label="Valor (R$)"
                          name={`price-${option.key}`}
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0,00"
                          value={option.price_delta}
                          onChange={(event) =>
                            updateOption(question.key, option.key, {
                              price_delta: event.target.value,
                            })
                          }
                        />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuestion(question.key, {
                          options: question.options.filter((item) => item.key !== option.key),
                        })
                      }
                      disabled={question.options.length <= 1}
                      aria-label={`Remover opção ${optionIndex + 1}`}
                      className="mt-6 flex size-10 shrink-0 items-center justify-center rounded-xl
                        text-ink-muted transition-colors hover:bg-danger/10 hover:text-danger
                        disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-ink-muted"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    updateQuestion(question.key, { options: [...question.options, newOption()] })
                  }
                  className="flex items-center justify-center gap-2 rounded-xl border border-dashed
                    border-border py-2.5 text-sm font-medium text-ink-muted transition-colors
                    hover:border-accent hover:text-accent"
                >
                  <FiPlus size={16} />
                  Adicionar opção
                </button>
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => onChange([...questions, newQuestion()])}
        className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed
          border-border py-3.5 font-medium text-ink-muted transition-colors hover:border-accent
          hover:text-accent"
      >
        <FiPlus size={18} />
        Adicionar pergunta
      </button>
    </div>
  );
}

/** Converte o rascunho da tela para o formato que o servidor espera,
 * descartando o que ficou em branco. */
export function toAddonGroupsInput(questions: DraftQuestion[]) {
  return questions
    .filter((question) => question.name.trim() && question.options.some((o) => o.name.trim()))
    .map((question) => ({
      id: question.id,
      name: question.name.trim(),
      is_addon: question.is_addon,
      is_required: question.is_addon ? question.is_required : true,
      options: question.options
        .filter((option) => option.name.trim())
        .map((option) => ({
          id: option.id,
          name: option.name.trim(),
          description: option.description.trim(),
          price_delta: question.is_addon ? option.price_delta || "0" : "0",
        })),
    }));
}

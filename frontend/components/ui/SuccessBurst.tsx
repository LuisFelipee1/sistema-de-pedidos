"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { FiCheck } from "react-icons/fi";

export interface SuccessBurstProps {
  isVisible: boolean;
  /** Chamado quando a celebração termina — para o pai seguir o fluxo. */
  onComplete: () => void;
  label?: string;
  durationMs?: number;
}

const PARTICLE_COUNT = 12;
const PARTICLE_DISTANCE = 90;

/** Comemoração de tela cheia para ações concluídas.
 *
 * Puramente decorativa e desacoplada do resultado: quem dispara já gravou a
 * ação no servidor antes de mostrar isso, então uma animação interrompida
 * (aba em segundo plano, `prefers-reduced-motion`) nunca perde trabalho. */
export function SuccessBurst({
  isVisible,
  onComplete,
  label = "Concluído!",
  durationMs = 1600,
}: SuccessBurstProps) {
  useEffect(() => {
    if (!isVisible) return;
    // Timer em vez de callback de animação: setTimeout continua correndo mesmo
    // quando o navegador congela o requestAnimationFrame de uma aba oculta.
    const timer = setTimeout(onComplete, durationMs);
    return () => clearTimeout(timer);
  }, [isVisible, durationMs, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          role="status"
          aria-live="assertive"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="pointer-events-none fixed inset-0 z-[80] flex flex-col items-center
            justify-center gap-5 bg-ink/60 backdrop-blur-sm"
        >
          <div className="relative flex items-center justify-center">
            {/* Onda que se expande a partir do centro */}
            <motion.span
              aria-hidden
              initial={{ scale: 0, opacity: 0.7 }}
              animate={{ scale: 3.2, opacity: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="absolute size-28 rounded-full bg-success"
            />

            {PARTICLE_COUNT > 0 &&
              Array.from({ length: PARTICLE_COUNT }).map((_, index) => {
                const angle = (index / PARTICLE_COUNT) * Math.PI * 2;
                return (
                  <motion.span
                    key={index}
                    aria-hidden
                    initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                    animate={{
                      x: Math.cos(angle) * PARTICLE_DISTANCE,
                      y: Math.sin(angle) * PARTICLE_DISTANCE,
                      scale: [0, 1, 0.2],
                      opacity: [1, 1, 0],
                    }}
                    transition={{ duration: 0.9, delay: 0.12, ease: "easeOut" }}
                    className="absolute size-2.5 rounded-full bg-success"
                  />
                );
              })}

            <motion.span
              initial={{ scale: 0, rotate: -25 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.05 }}
              className="relative flex size-28 items-center justify-center rounded-full
                bg-success text-white shadow-2xl shadow-success/50"
            >
              <motion.span
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.22, type: "spring", stiffness: 320, damping: 16 }}
              >
                <FiCheck size={56} strokeWidth={3} />
              </motion.span>
            </motion.span>
          </div>

          <motion.p
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="px-6 text-center text-xl font-bold text-white drop-shadow-lg"
          >
            {label}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

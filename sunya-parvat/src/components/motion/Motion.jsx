import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import './Motion.css';

/*
  Small, reusable motion pieces for the home page.

  Direction: adapted from the "Handwoven textiles brand explainer" on Prompt Motion
  (prompt-motion.com/amitsingha89-150378): serif words rising into place one by one,
  then supporting elements and photo cards arriving in a gentle stagger.

  Every piece renders its final state immediately when the visitor prefers reduced
  motion, and nothing is ever hidden from screen readers or blocked from clicks.
*/

export const EASE = [0.22, 1, 0.36, 1]; // soft "settle" curve, no bounce

/**
 * Words rise from behind a mask, one after another.
 * Screen readers get the plain sentence; the animated copies are aria-hidden.
 * `inView`: start when scrolled into view instead of on page load.
 */
export function RevealWords({ text, delay = 0, stagger = 0.07, inView = false, className = '' }) {
  const reduce = useReducedMotion();
  const words = String(text || '').split(/\s+/).filter(Boolean);
  if (reduce || !words.length) return <span className={className}>{text}</span>;

  // The trigger sits on the whole line, which is visible; each word starts clipped inside
  // its mask, so observing the words themselves would never report them as on screen.
  const word = {
    hidden: { y: '108%' },
    shown: i => ({ y: '0%', transition: { duration: 0.9, delay: delay + i * stagger, ease: EASE } }),
  };
  return (
    <span className={`reveal-words ${className}`}>
      <span className="visually-hidden">{text}</span>
      <motion.span
        aria-hidden="true"
        initial="hidden"
        {...(inView ? { whileInView: 'shown', viewport: { once: true, margin: '-10% 0px' } } : { animate: 'shown' })}
      >
        {words.map((w, i) => (
          <React.Fragment key={i}>
            <span className="reveal-words__mask">
              <motion.span className="reveal-words__word" variants={word} custom={i}>
                {w}
              </motion.span>
            </span>
            {/* the space lives outside the mask, where the browser keeps it */}
            {i < words.length - 1 ? ' ' : null}
          </React.Fragment>
        ))}
      </motion.span>
    </span>
  );
}

/** A block that fades and rises a little into place, on load or when scrolled into view. */
export function Rise({ as = 'div', delay = 0, y = 16, inView = false, className, children, ...rest }) {
  const reduce = useReducedMotion();
  const Tag = motion[as] || motion.div;
  if (reduce) {
    const Plain = as;
    return <Plain className={className} {...rest}>{children}</Plain>;
  }
  const to = { opacity: 1, y: 0, transition: { duration: 0.8, delay, ease: EASE } };
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      {...(inView ? { whileInView: to, viewport: { once: true, margin: '-8% 0px' } } : { animate: to })}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/** Grid whose items arrive one after another when the grid scrolls into view. */
export function StaggerGrid({ className, children, step = 0.08 }) {
  const reduce = useReducedMotion();
  const items = React.Children.toArray(children);
  if (reduce) return <div className={className}>{items}</div>;
  return (
    <motion.div className={className} initial="hidden" whileInView="shown" viewport={{ once: true, margin: '-10% 0px' }}
      variants={{ hidden: {}, shown: { transition: { staggerChildren: step } } }}>
      {items.map((child, i) => (
        <motion.div key={child.key ?? i} className="stagger-grid__item"
          variants={{ hidden: { opacity: 0, y: 28 }, shown: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } } }}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

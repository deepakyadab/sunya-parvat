import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './NotFound.css';

export default function NotFound() {
  return (
    <div className="notfound">
      <motion.div
        className="notfound__content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <div className="section-label" style={{ marginBottom: '2rem' }}>Lost</div>
        <h1 className="notfound__title">This path<br />does not exist.</h1>
        <p className="notfound__text">
          Some trails end before they begin.<br />
          Turn back and find a different way.
        </p>
        <Link to="/" className="notfound__link">Return to the beginning →</Link>
      </motion.div>
    </div>
  );
}

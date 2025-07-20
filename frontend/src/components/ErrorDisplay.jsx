import React from 'react';

export default function ErrorDisplay({ error }) {
  if (!error) return null;
  return <p className="text-red-400">{error}</p>;
}

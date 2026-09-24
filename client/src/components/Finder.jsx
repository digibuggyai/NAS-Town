import { useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, Loader2, RotateCcw } from 'lucide-react';
import { api } from '../lib/api.js';
import ProductCard from './ProductCard.jsx';

const steps = [
  {
    key: 'storing', title: 'What are you storing?',
    options: [['photos', 'Photos'], ['videos', 'Videos'], ['business', 'Business'], ['backup', 'Backup'], ['surveillance', 'Surveillance']],
  },
  {
    key: 'capacity', title: 'How much do you need?',
    options: [['10tb', '10 TB'], ['20tb', '20 TB'], ['50tb', '50 TB'], ['100tb', '100 TB+']],
  },
  {
    key: 'work_style', title: 'How do you want to work?',
    options: [['home', 'Home'], ['creator', 'Creator'], ['business', 'Business'], ['enterprise', 'Enterprise']],
  },
];

export default function Finder() {
  const [answers, setAnswers] = useState({});
  const [matches, setMatches] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const complete = steps.every((s) => answers[s.key]);

  async function submit() {
    setStatus('loading');
    setError('');
    try {
      const { matches } = await api.finder(answers);
      setMatches(matches);
    } catch (err) {
      setError(err.message);
    } finally {
      setStatus('idle');
    }
  }

  function reset() {
    setAnswers({});
    setMatches(null);
  }

  if (matches) {
    return (
      <div>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Your matches</p>
            <h3 className="mt-2 text-2xl font-semibold">We'd start with these.</h3>
          </div>
          <div className="flex gap-2">
            <button onClick={reset} className="btn btn-glass"><RotateCcw className="size-4" /> Start over</button>
            <Link to="/about#contact" className="btn btn-primary">Talk to an Expert</Link>
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map((p) => <ProductCard key={p.slug} product={p} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-[2rem] p-6 sm:p-10">
      <ol className="grid gap-8 lg:grid-cols-3 lg:gap-6">
        {steps.map((step, i) => {
          const active = i === 0 || answers[steps[i - 1].key];
          return (
            <li key={step.key} className={`transition-opacity duration-500 ${active ? '' : 'opacity-35'}`}>
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-sm text-accent">0{i + 1}</span>
                <h3 className="text-base font-medium">{step.title}</h3>
              </div>
              <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label={step.title}>
                {step.options.map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    disabled={!active}
                    aria-pressed={answers[step.key] === value}
                    onClick={() => setAnswers((a) => ({ ...a, [step.key]: value }))}
                    className="chip disabled:cursor-not-allowed"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </li>
          );
        })}
      </ol>
      <div className="mt-10 flex flex-col items-start gap-3 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">{complete ? 'All set. Let’s find your NAS.' : `${steps.filter((s) => answers[s.key]).length} of 3 answered`}</p>
        <button onClick={submit} disabled={!complete || status === 'loading'} className="btn btn-primary disabled:opacity-40">
          {status === 'loading' ? <Loader2 className="size-4 animate-spin" /> : null}
          Find My NAS <ArrowRight className="size-4" />
        </button>
      </div>
      {error && <p role="alert" className="mt-4 text-sm text-red-300">{error}</p>}
    </div>
  );
}

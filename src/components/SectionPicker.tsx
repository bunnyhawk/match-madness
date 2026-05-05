import { useState } from 'react';
import type { Vocabulary } from '../types';
import vocabulary from '../data/vocabulary.json';

const vocab = vocabulary as Vocabulary;

// Merge pairs by section name across both tabs
const sectionPairs = new Map<string, { dutch: string; english: string }[]>();
Object.values(vocab).forEach(sections => {
  Object.entries(sections).forEach(([section, pairs]) => {
    if (!sectionPairs.has(section)) sectionPairs.set(section, []);
    sectionPairs.get(section)!.push(...pairs);
  });
});

const GROUPS: { name: string; sections: string[] }[] = [
  {
    name: 'Section 1',
    sections: ['Basics 1', 'Basics 2', 'Common Phrases', 'Food', 'Animals', 'Plurals', 'Possessives', 'Adjective Basics'],
  },
  {
    name: 'Section 2',
    sections: ['Clothing', 'Formal', 'Present', 'Indefinite Pronouns', 'Object Pronouns', 'Colors', 'Prepositions', 'Questions', 'Numbers', 'Conjunctions', 'Dates and time', 'Places', 'Er', 'Jobs', 'Family', 'Present 2', 'Health'],
  },
  {
    name: 'Section 3',
    sections: ['Adverbs', 'Objects', 'Te + inf.', 'Demonstrative pronouns', 'The Imperative', 'Modal verbs', 'Diminutives', 'Travel', 'Adjectives 2', 'People', 'Reflexive Verbs and Pronouns', 'Verbs: Present Perfect'],
  },
  {
    name: 'Section 4',
    sections: ['Nature', 'Passive Voice: Present and Perfect', 'Education and Schooling', 'Verbs: Simple Past', 'Weather', 'The Passive Simple', 'The Future Tense', 'Abstract Nouns 1', 'Future Perfect', 'Comparative and Superlative', 'Mapping the World: Geography', 'The Conditional Present & Perfect', 'Relative pronouns', 'Communication', 'Arts', 'Sports', 'Feelings', 'Science', 'Business', 'Government', 'The Past Perfect / Pluperfect', 'The Gerund', '(Historical) Events', 'Abstract Nouns 2', 'Dutch Geography, Landmarks & Infrastructur', 'Dutch Baking, Food and Snacks'],
  },
];

const allSectionNames = GROUPS.flatMap(g => g.sections);

interface Props {
  onStart: (pairs: { dutch: string; english: string }[]) => void;
}

type CheckState = 'all' | 'some' | 'none';

export default function SectionPicker({ onStart }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(GROUPS.map(g => g.name)));

  function toggleSection(name: string) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  }

  function toggleGroup(group: typeof GROUPS[0]) {
    const allSel = group.sections.every(s => selected.has(s));
    setSelected(prev => {
      const next = new Set(prev);
      group.sections.forEach(s => allSel ? next.delete(s) : next.add(s));
      return next;
    });
  }

  function toggleAll() {
    const allSel = allSectionNames.every(s => selected.has(s));
    setSelected(allSel ? new Set() : new Set(allSectionNames));
  }

  function toggleGroupExpanded(name: string) {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  }

  function groupState(group: typeof GROUPS[0]): CheckState {
    const count = group.sections.filter(s => selected.has(s)).length;
    if (count === group.sections.length) return 'all';
    if (count > 0) return 'some';
    return 'none';
  }

  const allState: CheckState = (() => {
    const count = allSectionNames.filter(s => selected.has(s)).length;
    if (count === allSectionNames.length) return 'all';
    if (count > 0) return 'some';
    return 'none';
  })();

  function handleStart() {
    const pairs: { dutch: string; english: string }[] = [];
    selected.forEach(name => {
      sectionPairs.get(name)?.forEach(p => pairs.push(p));
    });
    onStart(pairs);
  }

  const totalWords = Array.from(selected).reduce(
    (acc, name) => acc + (sectionPairs.get(name)?.length ?? 0), 0
  );

  return (
    <div className="picker">
      <h1>Match Madness</h1>
      <p className="subtitle">Select sections to practice</p>

      <div className="tab-list">
        {/* Master "All" toggle */}
        <div className="tab-group">
          <div className="tab-header">
            <label className="check-label">
              <input
                type="checkbox"
                checked={allState === 'all'}
                ref={el => { if (el) el.indeterminate = allState === 'some'; }}
                onChange={toggleAll}
              />
              <span className="tab-name">All sections</span>
            </label>
          </div>
        </div>

        {/* Section groups */}
        {GROUPS.map(group => {
          const state = groupState(group);
          const isExpanded = expandedGroups.has(group.name);
          return (
            <div key={group.name} className="tab-group">
              <div className="tab-header">
                <label className="check-label">
                  <input
                    type="checkbox"
                    checked={state === 'all'}
                    ref={el => { if (el) el.indeterminate = state === 'some'; }}
                    onChange={() => toggleGroup(group)}
                  />
                  <span className="tab-name">{group.name}</span>
                </label>
                <button className="expand-btn" onClick={() => toggleGroupExpanded(group.name)}>
                  {isExpanded ? '▲' : '▼'}
                </button>
              </div>

              {isExpanded && (
                <div className="section-list">
                  {group.sections.map(name => {
                    const count = sectionPairs.get(name)?.length ?? 0;
                    return (
                      <label key={name} className="check-label section-item">
                        <input
                          type="checkbox"
                          checked={selected.has(name)}
                          onChange={() => toggleSection(name)}
                        />
                        <span>{name}</span>
                        <span className="word-count">{count} words</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="start-bar">
        <span className="word-total">{totalWords} words selected</span>
        <button
          className="start-btn"
          disabled={selected.size === 0}
          onClick={handleStart}
        >
          Play →
        </button>
      </div>
    </div>
  );
}

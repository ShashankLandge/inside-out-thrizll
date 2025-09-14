import React, { useEffect, useRef, useState } from 'react'
import { now } from '../utils/helpers'

export default function MemeCaptionGame({ onComplete }) {
  const templates = [
    { id: 'drake', title: 'Drake Style', visual: () => (<svg viewBox="0 0 200 120" className="w-full h-40"><rect width="200" height="120" rx="10" fill="#f8fafc" stroke="#e2e8f0" /><text x="12" y="30" fill="#0f172a" fontSize="12">Drake template</text></svg>) },
    { id: 'distracted', title: 'Distracted Boyfriend', visual: () => (<svg viewBox="0 0 200 120" className="w-full h-40"><rect width="200" height="120" rx="10" fill="#fff7ed" stroke="#fee2b3" /><text x="12" y="30" fill="#92400e" fontSize="12">Distracted template</text></svg>) },
    { id: 'two-button', title: 'Two Buttons', visual: () => (<svg viewBox="0 0 200 120" className="w-full h-40"><rect width="200" height="120" rx="10" fill="#f0fdf4" stroke="#bbf7d0" /><text x="12" y="30" fill="#065f46" fontSize="12">Two-button template</text></svg>) },
    { id: 'mocking', title: 'Mocking Spongebob', visual: () => (<svg viewBox="0 0 200 120" className="w-full h-40"><rect width="200" height="120" rx="10" fill="#eef2ff" stroke="#dbeafe" /><text x="12" y="30" fill="#3730a3" fontSize="12">Mocking template</text></svg>) },
  ]

  const optionsPool = {
    drake: [
      { text: "That’s genius — we should build that.", type: 'dry' },
      { text: "Haha who made this? Lol 😂", type: 'dumb' },
      { text: "I'll do it but with a spreadsheet.", type: 'dad' },
      { text: "Existential dread is funny sometimes.", type: 'dark' },
      { text: "I enjoy a good paradox.", type: 'intelligent' },
      { text: "This is cursed and I love it.", type: 'absurd' },
    ],
    distracted: [
      { text: "New app idea > current relationship.", type: 'dark' },
      { text: "Huh, that actually makes sense.", type: 'dry' },
      { text: "I would definitely share this w/ my mom.", type: 'dad' },
      { text: "I laughed out loud at this one.", type: 'dumb' },
      { text: "Clever satire, well done.", type: 'intelligent' },
      { text: "This hurts my brain in a good way.", type: 'absurd' },
    ],
    'two-button': [
      { text: "Both choices are equally horrific.", type: 'dark' },
      { text: "I pick the spreadsheet option.", type: 'dad' },
      { text: "That is peak irony.", type: 'dry' },
      { text: "Who hurt you to make this?", type: 'dumb' },
      { text: "Meta commentary is delightful.", type: 'intelligent' },
      { text: "This has no business being funny.", type: 'absurd' },
    ],
    mocking: [
      { text: "Yeah sure, that will work... said no one.", type: 'dry' },
      { text: "I'm laughing but I shouldn't be.", type: 'dark' },
      { text: "I love this kind of nonsense.", type: 'absurd' },
      { text: "Haha dad-level humor right here.", type: 'dad' },
      { text: "Observational humor for the win.", type: 'intelligent' },
      { text: "This reminds me of my ex lol.", type: 'dumb' },
    ],
  }

  const [index, setIndex] = useState(0)
  const choicesRef = useRef([])
  const startRef = useRef(now())

  const choose = (opt) => {
    const rt = now() - startRef.current
    choicesRef.current.push({ template: templates[index].id, text: opt.text, type: opt.type, rt })
    setIndex(i => i + 1)
    startRef.current = now()
  }

  useEffect(() => {
    if (index >= templates.length) {
      const raw = choicesRef.current
      const counts = raw.reduce((acc, c) => { acc[c.type] = (acc[c.type] || 0) + 1; return acc }, {})
      onComplete({ choices: raw, counts })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="p-6 border rounded-xl">
        <h3 className="text-lg font-medium">Meme Caption — Humor Taste</h3>
        <p className="text-sm text-gray-600 mt-2">Choose the caption you’d find funniest for each meme. This builds a lightweight humor profile.</p>

        <div className="mt-6">
          {index < templates.length && (
            <div>
              <div className="rounded-xl overflow-hidden border">
                <div className="p-4 bg-gray-50 flex items-center justify-between">
                  <div className="text-sm font-medium">{templates[index].title}</div>
                  <div className="text-xs text-gray-500">Template {index + 1} / {templates.length}</div>
                </div>
                <div className="p-4 bg-white">
                  {templates[index].visual()}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {optionsPool[templates[index].id].map(opt => (
                  <button key={opt.text} onClick={() => choose(opt)} className="text-left p-3 border rounded-lg">
                    <div className="text-sm">{opt.text}</div>
                    <div className="text-xs text-gray-400 mt-1">{opt.type}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 border rounded-xl">
        <h4 className="text-md font-medium">What we capture</h4>
        <ul className="mt-3 text-sm text-gray-600 space-y-2 list-disc list-inside">
          <li>Choice of caption mapped to a humour category (dad, dark, intelligent, absurd, dry, silly).</li>
          <li>Response speed—fast picks → instinctual preferences; slower picks → reflective humour.</li>
        </ul>
      </div>
    </div>
  )
}

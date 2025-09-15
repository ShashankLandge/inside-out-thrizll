import React, { useEffect, useMemo, useState } from 'react'
import { PROMPT_CATEGORIES } from '../constants/prompts'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'

// Re-export for backward compatibility
export { PROMPT_CATEGORIES }

/* -------------------------
  Small UI helpers (inside file)
--------------------------*/
function ProgressStepper({ step }) {
	const steps = ['Signup','Profile','Prompts']
	return (
		<div className="mb-6 flex items-center gap-4">
			{steps.map((label, i) => {
				const idx = i + 1
				const active = idx === step
				const done = idx < step
				return (
					<div key={label} className="flex items-center gap-3">
						<div className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-medium shadow-sm
							${done ? 'bg-green-500 text-white' : active ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
							{idx}
						</div>
						<div className={`hidden sm:block text-sm ${active ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>{label}</div>
						{i < steps.length-1 && <div className={`w-6 h-0.5 ${done ? 'bg-green-400' : 'bg-gray-200'}`}></div>}
					</div>
				)
			})}
		</div>
	)
}

function Field({ label, error, hint, children }) {
	return (
		<div className="mb-3">
			<label className="block text-sm font-medium mb-1">{label}</label>
			<div className={`${error ? 'ring-1 ring-red-200 rounded' : ''}`}>{children}</div>
			{hint && <div className="text-xs text-gray-500 mt-1">{hint}</div>}
			{error && <div className="text-xs text-red-600 mt-1 flex items-center gap-1">{error}</div>}
		</div>
	)
}

/* -------------------------
  Main component (3-step flow)
--------------------------*/
export default function DatingSignupProfile() {
	const { token, user } = useAuth()
	const [step, setStep] = useState(1)

	// initial from localStorage if present
	const localKey = useMemo(() => 'dating-profile-draft', [])
	const draft = useMemo(() => {
		try { return JSON.parse(localStorage.getItem(localKey) || 'null') } catch { return null }
	}, [localKey])

	// Main form state
	const [form, setForm] = useState(draft || {
		displayName: '',
		dob: '',
		gender: 'Male',
		customGender: '',
		preferredGenders: [],
		mobile: '',
		email: '',
		city: '',
		radius: 50,
		languages: '',

		// Step 2
		profilePic: null,
		profilePicPreview: null,
		profilePicProvided: false,
		relationshipIntent: 'Casual',
		education: '',
		work: '',
		diet: 'Non-Veg',
		fitness: 5,
		smoking: 0,
		drinking: 0,
		religion: '',
		politics: '',

		// Personality scales
		introExtro: 5,
		openness: 5,
		conscientiousness: 5,
		agreeableness: 5,
		neuroticism: 5,

		// Prompts state mirrors PROMPT_CATEGORIES
		prompts: PROMPT_CATEGORIES.map(pc => ({
			category: pc.category,
			selectedPromptIndex: null,
			answer: ''
		}))
	})

	const [errors, setErrors] = useState({})
	const [submitStatus, setSubmitStatus] = useState(null) // null|'submitting'|'success'|'error'
	const [toast, setToast] = useState(null) // {type, text}

	// Autosave to localStorage
	useEffect(() => {
		try { localStorage.setItem(localKey, JSON.stringify(form)) } catch {}
	}, [form, localKey])

	// Prefill from backend /users/me
	useEffect(() => {
		let mounted = true
		async function loadMe() {
			if (!token) return
			try {
				const me = await api.getMe()
				if (!mounted || !me) return
				const p = me.profile || {}
				setForm(prev => ({
					...prev,
					displayName: p.displayName || me.name || '',
					dob: p.dob || '',
					gender: p.gender || prev.gender,
					customGender: p.gender && !['Male','Female','Non-binary','Custom'].includes(p.gender) ? p.gender : '',
					preferredGenders: Array.isArray(p.preferredGenders) ? p.preferredGenders : prev.preferredGenders,
					mobile: p.mobile || '',
					email: me.email || p.email || '',
					city: (p.location && p.location.city) || (me.location ? String(me.location) : '') || '',
					radius: (p.location && p.location.radiusKm) || prev.radius,
					languages: Array.isArray(p.languages) ? p.languages.join(', ') : prev.languages,
					relationshipIntent: p.relationshipIntent || prev.relationshipIntent,
					education: p.education || prev.education,
					work: p.work || prev.work,
					diet: (p.lifestyle && p.lifestyle.diet) || prev.diet,
					fitness: (p.lifestyle && (p.lifestyle.fitness ?? prev.fitness)) ?? prev.fitness,
					smoking: (p.lifestyle && (p.lifestyle.smoking ?? prev.smoking)) ?? prev.smoking,
					drinking: (p.lifestyle && (p.lifestyle.drinking ?? prev.drinking)) ?? prev.drinking,
					religion: (p.beliefs && p.beliefs.religion) || prev.religion,
					politics: (p.beliefs && p.beliefs.politics) || prev.politics,
					introExtro: (p.personalityScales && (p.personalityScales.introExtro ?? prev.introExtro)) ?? prev.introExtro,
					openness: (p.personalityScales && (p.personalityScales.openness ?? prev.openness)) ?? prev.openness,
					conscientiousness: (p.personalityScales && (p.personalityScales.conscientiousness ?? prev.conscientiousness)) ?? prev.conscientiousness,
					agreeableness: (p.personalityScales && (p.personalityScales.agreeableness ?? prev.agreeableness)) ?? prev.agreeableness,
					neuroticism: (p.personalityScales && (p.personalityScales.neuroticism ?? prev.neuroticism)) ?? prev.neuroticism,
					prompts: Array.isArray(p.prompts) && p.prompts.length
						? PROMPT_CATEGORIES.map(pc => {
							const existing = p.prompts.find((x) => x.category === pc.category)
							if (!existing) return { category: pc.category, selectedPromptIndex: null, answer: '' }
							const idx = pc.prompts.indexOf(existing.prompt)
							return { category: pc.category, selectedPromptIndex: idx >= 0 ? idx : null, answer: existing.answer || '' }
						})
						: prev.prompts
				}))
			} catch(e) {
				console.warn('Failed to prefill profile', e)
			}
		}
		loadMe()
		return () => { mounted = false }
	}, [token])

	// Clean up object URL on unmount
	useEffect(() => {
		return () => {
			if (form.profilePicPreview) URL.revokeObjectURL(form.profilePicPreview)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	/* ---------- helpers ---------- */
	function setField(field, value) {
		setForm(prev => ({ ...prev, [field]: value }))
	}

	function calculateAge(dobStr) {
		if (!dobStr) return 0
		const today = new Date()
		const [y, m, d] = dobStr.split('-').map(Number)
		const birth = new Date(y, m - 1, d)
		let age = today.getFullYear() - birth.getFullYear()
		const mDiff = today.getMonth() - birth.getMonth()
		if (mDiff < 0 || (mDiff === 0 && today.getDate() < birth.getDate())) age--
		return age
	}

	/* ---------- validation ---------- */
	function validateStep1() {
		const e = {}
		if (!form.displayName.trim()) e.displayName = 'Display name is required.'
		if (!form.dob) e.dob = 'Date of birth is required.'
		else if (calculateAge(form.dob) < 18) e.dob = 'You must be at least 18 years old.'
		if (form.gender === 'Custom' && !form.customGender.trim()) e.customGender = 'Please specify your gender.'
		if (!form.preferredGenders.length) e.preferredGenders = 'Select at least one preferred gender.'
		if (!form.mobile.trim()) e.mobile = 'Mobile is required.'

 		if (!form.email.trim()) e.email = 'Email is required.'
		else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Please enter a valid email address.'
		if (!form.city.trim()) e.city = 'City is required.'
		setErrors(e)
		return Object.keys(e).length === 0
	}

	function countAnsweredCategories() {
		return form.prompts.filter(p => p.selectedPromptIndex !== null && p.answer.trim()).length
	}

	function validatePrompts() {
		const count = countAnsweredCategories()
		if (count < 3) {
			setErrors({ prompts: `Please answer at least 3 categories (currently ${count}).` })
			return false
		}
		setErrors({})
		return true
	}

	/* ---------- navigation ---------- */
	function handleNext() {
		if (step === 1) {
			if (!validateStep1()) return
			setStep(2)
			window.scrollTo({ top: 0, behavior: 'smooth' })
			return
		}

		if (step === 2) {
			setStep(3)
			window.scrollTo({ top: 0, behavior: 'smooth' })
			return
		}
	}
	function handleBack() {
		setErrors({})
		setStep(prev => Math.max(prev - 1, 1))
		window.scrollTo({ top: 0, behavior: 'smooth' })
	}

	/* ---------- preferred genders ---------- */
	function togglePreferredGender(g) {
		setForm(prev => {
			const arr = new Set(prev.preferredGenders)
			if (arr.has(g)) arr.delete(g); else arr.add(g)
			return { ...prev, preferredGenders: Array.from(arr) }
		})
	}

	/* ---------- profile pic ---------- */
	function onProfilePicChange(e) {
		const file = e.target.files && e.target.files[0]
		if (file) {
			if (form.profilePicPreview) URL.revokeObjectURL(form.profilePicPreview)
			const previewUrl = URL.createObjectURL(file)
			setForm(prev => ({ ...prev, profilePic: file, profilePicProvided: true, profilePicPreview: previewUrl }))
		}
	}

	function removeProfilePic() {
		if (form.profilePicPreview) URL.revokeObjectURL(form.profilePicPreview)
		setForm(prev => ({ ...prev, profilePic: null, profilePicProvided: false, profilePicPreview: null }))
	}

	/* ---------- prompts ---------- */
	function selectPrompt(categoryIdx, promptIdx) {
		setForm(prev => {
			const prompts = [...prev.prompts]
			prompts[categoryIdx] = { ...prompts[categoryIdx], selectedPromptIndex: promptIdx }
			return { ...prev, prompts }
		})
	}
	function setPromptAnswer(categoryIdx, text) {
		if (text.length > 300) return
		setForm(prev => {
			const prompts = [...prev.prompts]
			prompts[categoryIdx] = { ...prompts[categoryIdx], answer: text }
			return { ...prev, prompts }
		})
	}

	/* ---------- build JSON (exact schema) ---------- */
	function buildProfileJson() {
		const languagesArr = form.languages
			.split(',')
			.map(s => s.trim())
			.filter(Boolean)

		const promptsArr = form.prompts
			.filter(p => p.selectedPromptIndex !== null && p.answer.trim())
			.map(p => ({
				category: p.category,
				prompt: PROMPT_CATEGORIES.find(pc => pc.category === p.category).prompts[p.selectedPromptIndex],
				answer: p.answer.trim()
			}))

		const payload = {
			displayName: form.displayName,
			dob: form.dob,
			gender: form.gender === 'Custom' ? form.customGender.trim() || 'Custom' : form.gender,
			preferredGenders: form.preferredGenders,
			mobile: form.mobile,
			email: form.email,
			location: { city: form.city, radiusKm: Number(form.radius) },
			languages: languagesArr,
			relationshipIntent: form.relationshipIntent,
			education: form.education,
			work: form.work,
			lifestyle: { smoking: Number(form.smoking), drinking: Number(form.drinking), diet: form.diet, fitness: Number(form.fitness) },
			beliefs: { religion: form.religion, politics: form.politics },
			personalityScales: {
				introExtro: Number(form.introExtro),
				openness: Number(form.openness),
				conscientiousness: Number(form.conscientiousness),
				agreeableness: Number(form.agreeableness),
				neuroticism: Number(form.neuroticism)
			},
			prompts: promptsArr,
			profilePicProvided: Boolean(form.profilePicProvided)
		}

		return payload
	}

	/* ---------- submit / toast ---------- */
	async function handleSubmit() {
		if (!validatePrompts()) return
		const profile = buildProfileJson()
		try {
			setSubmitStatus('submitting')
			// If not logged in (signup page usage), just log payload and show success
			if (!token) {
				console.log('Signup profile JSON (no auth):', profile)
				setSubmitStatus('success')
				setToast({ type: 'success', text: 'Profile captured' })
				setTimeout(() => setToast(null), 2500)
				try { localStorage.removeItem(localKey) } catch {}
				return
			}
			// Map to backend shape when authenticated
			const payload = {
				name: profile.displayName,
				location: profile.location?.city || undefined,
				profile
			}
			await api.updateMe(payload)
			setSubmitStatus('success')
			setToast({ type: 'success', text: 'Profile saved' })
			setTimeout(() => setToast(null), 2500)
			try { localStorage.removeItem(localKey) } catch {}
		} catch (err) {
			console.error('Submit error', err)
			setSubmitStatus('error')
			setToast({ type: 'error', text: 'Error submitting (check console)' })
			setTimeout(() => setToast(null), 3000)
		}
	}

	/* ---------- UI ---------- */
	return (
		<div className="max-w-4xl mx-auto p-6">
			<div className="bg-white rounded-2xl shadow-xl p-6">
				{/* Header */}
				<div className="mb-6 rounded-lg p-5 bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-lg">
					<div className="flex items-center justify-between gap-4">
						<div>
							<h1 className="text-2xl sm:text-3xl font-semibold leading-tight">Mystri match Signup</h1>
							<p className="mt-1 text-sm opacity-90">A small profile that highlights who you are — quick, human, and honest.</p>
						</div>
						<div className="hidden sm:flex items-center space-x-3">
							<div className="text-xs bg-white/20 px-3 py-1 rounded-full">Prototype</div>
							<div className="text-xs bg-white/10 px-3 py-1 rounded-full">Step {step} / 3</div>
						</div>
					</div>
				</div>

				{/* Stepper */}
				<ProgressStepper step={step} />

				{/* Step contents */}
				{step === 1 && (
					<form className="space-y-4" onSubmit={e => { e.preventDefault(); handleNext(); }}>
						<Field label="Display name *" error={errors.displayName}>
							<input 
								aria-label="display name" 
								className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500" 
								value={form.displayName} 
								onChange={e => setField('displayName', e.target.value)} 
								placeholder="Enter your display name"
							/>
						</Field>

						<div className="grid sm:grid-cols-2 gap-4">
							<Field label="Date of birth *" error={errors.dob} hint="You must be at least 18">
								<input 
									type="date" 
									className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500" 
									value={form.dob} 
									onChange={e => setField('dob', e.target.value)} 
								/>
								<div className="text-xs text-gray-500 mt-1">Age: {form.dob ? calculateAge(form.dob) : '-'}</div>
							</Field>

							<Field label="Gender *" error={errors.customGender}>
								<select 
									className="mt-1 p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500" 
									value={form.gender} 
									onChange={e => setField('gender', e.target.value)}
								>
									<option>Male</option>
									<option>Female</option>
									<option>Non-binary</option>
									<option>Custom</option>
								</select>
								{form.gender === 'Custom' && (
									<input 
										className="mt-2 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500" 
										placeholder="Enter gender" 
										value={form.customGender} 
										onChange={e => setField('customGender', e.target.value)} 
									/>
								)}
							</Field>
						</div>

						<Field label="Preferred genders (select at least one) *" error={errors.preferredGenders}>
							<div className="flex flex-wrap gap-3 mt-2">
								{['Male','Female','Non-binary','Any'].map(g => (
									<label key={g} className={`inline-flex items-center gap-2 px-3 py-1 rounded-md border ${form.preferredGenders.includes(g) ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}>
										<input type="checkbox" className="mr-1" checked={form.preferredGenders.includes(g)} onChange={() => togglePreferredGender(g)} />
										<span className="text-sm">{g}</span>
									</label>
								))}
							</div>
						</Field>

						<div className="grid sm:grid-cols-2 gap-4">
							<Field label="Mobile *" error={errors.mobile}>
								<input 
									type="tel"
									className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500" 
									value={form.mobile} 
									onChange={e=>setField('mobile', e.target.value)}
									placeholder="Enter your mobile number"
								/>
							</Field>

							<Field label="Email *" error={errors.email}>
								<input 
									type="email"
									className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500" 
									value={form.email} 
									onChange={e=>setField('email', e.target.value)}
									placeholder="Enter your email"
								/>
							</Field>
						</div>

						<div className="grid sm:grid-cols-2 gap-4">
							<Field label="City *" error={errors.city}>
								<input 
									className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500" 
									value={form.city} 
									onChange={e=>setField('city', e.target.value)}
									placeholder="Enter your city"
								/>
							</Field>

							<Field label={`Radius (km): ${form.radius}`}>
								<div className="flex items-center gap-4">
									<input 
										type="range" 
										min="1" 
										max="200" 
										value={form.radius} 
										onChange={e=>setField('radius', e.target.value)} 
										className="flex-1 h-2 accent-blue-600" 
									/>
									<div className="w-12 text-center text-sm bg-gray-100 rounded px-2 py-1">{form.radius}</div>
								</div>
							</Field>
						</div>

						<Field label="Languages (comma separated)">
							<input 
								className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500" 
								value={form.languages} 
								onChange={e=>setField('languages', e.target.value)}
								placeholder="e.g., English, Spanish, French"
							/>
						</Field>

						<div className="flex justify-between">
							<button 
								type="button" 
								onClick={handleBack} 
								className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
								disabled={step === 1}
							>
								Back
							</button>
							<button 
								type="submit" 
								className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
							>
								Next
							</button>
						</div>
					</form>
				)}

				{step === 2 && (
					<div className="space-y-4">
						<div className="grid sm:grid-cols-2 gap-6">
							<div>
								<label className="block text-sm font-medium mb-2">Profile picture (optional)</label>
								<div className="flex items-center gap-4">
									<input id="profileFile" type="file" accept="image/*" onChange={onProfilePicChange} className="hidden" />
									<label htmlFor="profileFile" className="px-3 py-2 bg-gray-100 border rounded cursor-pointer text-sm">Upload photo</label>

									{form.profilePicPreview ? (
										<div className="flex items-center gap-3">
											<img src={form.profilePicPreview} alt="preview" className="w-16 h-16 rounded-full object-cover border" />
											<div>
												<div className="text-sm">{form.profilePic && form.profilePic.name}</div>
												<button onClick={removeProfilePic} className="text-xs text-red-600 mt-1">Remove</button>
											</div>
										</div>
									) : (
										<div className="text-sm text-gray-500">No photo yet (optional)</div>
									)}
								</div>
							</div>

							<div>
								<Field label="Relationship intent">
									<select 
										className="mt-1 p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500" 
										value={form.relationshipIntent} 
										onChange={e=>setField('relationshipIntent', e.target.value)}
									>
										<option>Casual</option>
										<option>Serious</option>
										<option>Marriage</option>
										<option>Friendship</option>
										<option>Open to exploring</option>
									</select>
								</Field>
							</div>
						</div>

						<div className="grid sm:grid-cols-2 gap-4">
							<Field label="Education">
								<input 
									className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500" 
									value={form.education} 
									onChange={e=>setField('education', e.target.value)}
									placeholder="e.g., Bachelor's in Computer Science"
								/>
							</Field>
							<Field label="Work (title / field)">
								<input 
									className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500" 
									value={form.work} 
									onChange={e=>setField('work', e.target.value)}
									placeholder="e.g., Software Engineer"
								/>
							</Field>
						</div>

						<div className="grid sm:grid-cols-3 gap-4 items-center">
							<Field label="Diet">
								<select 
									className="mt-1 p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500" 
									value={form.diet} 
									onChange={e=>setField('diet', e.target.value)}
								>
									<option>Non-Veg</option>
									<option>Veg</option>
									<option>Vegan</option>
									<option>Other</option>
								</select>
							</Field>

							<Field label={`Fitness: ${form.fitness}`}>
								<div className="flex items-center gap-4">
									<input type="range" min="0" max="10" value={form.fitness} onChange={e=>setField('fitness', e.target.value)} className="flex-1 h-2" />
									<div className="w-10 text-center text-sm bg-gray-100 rounded px-2 py-1">{form.fitness}</div>
								</div>
							</Field>

							<Field label={`Smoking: ${form.smoking}`}>
								<div className="flex items-center gap-4">
									<input type="range" min="0" max="10" value={form.smoking} onChange={e=>setField('smoking', e.target.value)} className="flex-1 h-2" />
									<div className="w-10 text-center text-sm bg-gray-100 rounded px-2 py-1">{form.smoking}</div>
								</div>
							</Field>
						</div>

						<div className="grid sm:grid-cols-2 gap-4">
							<Field label={`Drinking: ${form.drinking}`}>
								<div className="flex items-center gap-4">
									<input type="range" min="0" max="10" value={form.drinking} onChange={e=>setField('drinking', e.target.value)} className="flex-1 h-2 accent-blue-600" />
									<div className="w-10 text-center text-sm bg-gray-100 rounded px-2 py-1">{form.drinking}</div>
								</div>
							</Field>

							<Field label="Religion">
								<input 
									className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500" 
									value={form.religion} 
									onChange={e=>setField('religion', e.target.value)}
									placeholder="e.g., Christian, Muslim, Hindu, None"
								/>
							</Field>
						</div>

						<Field label="Politics">
							<input 
								className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500" 
								value={form.politics} 
								onChange={e=>setField('politics', e.target.value)}
								placeholder="e.g., Liberal, Conservative, Moderate, None"
							/>
						</Field>

						<div className="mt-4">
							<h3 className="font-medium mb-2">Personality scales (0–10)</h3>
							<div className="grid sm:grid-cols-2 gap-4">
								<div>
									<label className="block text-sm">Introvert — Extrovert: {form.introExtro}</label>
									<input type="range" min="0" max="10" value={form.introExtro} onChange={e=>setField('introExtro', e.target.value)} className="w-full" />
								</div>
								<div>
									<label className="block text-sm">Openness: {form.openness}</label>
									<input type="range" min="0" max="10" value={form.openness} onChange={e=>setField('openness', e.target.value)} className="w-full" />
								</div>

								<div>
									<label className="block text-sm">Conscientiousness: {form.conscientiousness}</label>
									<input type="range" min="0" max="10" value={form.conscientiousness} onChange={e=>setField('conscientiousness', e.target.value)} className="w-full" />
								</div>
								<div>
									<label className="block text-sm">Agreeableness: {form.agreeableness}</label>
									<input type="range" min="0" max="10" value={form.agreeableness} onChange={e=>setField('agreeableness', e.target.value)} className="w-full" />
								</div>

								<div className="sm:col-span-2">
									<label className="block text-sm">Neuroticism: {form.neuroticism}</label>
									<input type="range" min="0" max="10" value={form.neuroticism} onChange={e=>setField('neuroticism', e.target.value)} className="w-full" />
								</div>
							</div>
						</div>

						<div className="flex justify-between">
							<button 
								type="button" 
								onClick={handleBack} 
								className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
							>
								Back
							</button>
							<button 
								type="button" 
								onClick={() => setStep(3)} 
								className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
							>
								Next
							</button>
						</div>
					</div>
				)}

				{step === 3 && (
					<div className="space-y-6">
						<p className="text-sm text-gray-600">Pick one prompt per category you want to answer. Provide an answer (max 300 chars). You must answer at least 3 categories to submit.</p>

						{PROMPT_CATEGORIES.map((pc, idx) => (
							<div key={pc.category} className="border p-3 rounded hover:shadow-lg transition-shadow">
								<div className="flex justify-between items-center">
									<h3 className="font-medium">{pc.category}</h3>
									<div className="text-sm">{form.prompts[idx].selectedPromptIndex !== null && form.prompts[idx].answer.trim() ? 'Answered' : 'Not answered'}</div>
								</div>

								<div className="mt-2 flex gap-3 flex-wrap">
									{pc.prompts.map((p, pidx) => (
										<button
											key={p}
											type="button"
											onClick={() => selectPrompt(idx, pidx)}
											className={`px-3 py-1 border rounded-md transition shadow-sm transform hover:-translate-y-0.5 ${form.prompts[idx].selectedPromptIndex === pidx ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-gray-700'}`}>
											{form.prompts[idx].selectedPromptIndex === pidx && <span className="mr-2">✓</span>}
											{p}
										</button>
									))}
								</div>

								<div className="mt-3">
									<textarea 
										className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500" 
										rows={3} 
										value={form.prompts[idx].answer} 
										onChange={e => setPromptAnswer(idx, e.target.value)} 
										placeholder="Write your answer (max 300 chars)" 
									/>
									<div className="text-xs text-gray-500">{form.prompts[idx].answer.length}/300</div>
								</div>
							</div>
						))}

						{errors.prompts && <p className="text-red-600">{errors.prompts}</p>}

						<div className="flex justify-between">
							<button 
								type="button" 
								onClick={handleBack} 
								className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
							>
								Back
							</button>

							<div className="flex gap-2">
								<button 
									type="button" 
									onClick={() => setStep(2)} 
									className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
								>
									Save & Back
								</button>

								<button 
									type="button" 
									onClick={handleSubmit} 
									className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
									disabled={submitStatus === 'submitting'}
								>
									{submitStatus === 'submitting' ? 'Submitting...' : 'Finish'}
								</button>
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Toast */}
			{toast && (
				<div className={`fixed bottom-6 right-6 p-3 rounded shadow z-50 transition ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
					{toast.text}
				</div>
			)}

			{/* Success modal */}
			{submitStatus === 'success' && (
				<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
					<div className="bg-white rounded-xl p-6 w-[90%] max-w-md text-center">
						<h3 className="text-lg font-semibold mb-2">Profile submitted</h3>
						<p className="text-sm text-gray-600 mb-4">Your profile was saved to your account.</p>
						<div className="flex justify-center gap-2">
							<button 
								onClick={() => setSubmitStatus(null)} 
								className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
							>
								Close
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

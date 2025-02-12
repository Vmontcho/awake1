'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

export default function LoginPage() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!isSignIn) {
        // Sign up process
        const userCredential = await createUserWithEmailAndPassword(auth, email, password || '123456');
        const user = userCredential.user;

        // Store additional user data in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          name,
          surname,
          email,
          phoneNumber: phone,
          role: 'user',
          status: 'activated',
          createdAt: new Date().toISOString()
        });

        router.push('/dashboard'); // Redirect to dashboard after successful signup
      } else {
        // TODO: Implement sign in logic
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const countryCodes = [
    '+225', // Côte d'Ivoire
    '+1',   // USA/Canada
    '+33',  // France
    '+44',  // UK
    '+86',  // China
    '+234', // Nigeria
    '+27',  // South Africa
    '+81',  // Japan
    '+49',  // Germany
    '+91'   // India
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1FAD92] to-white py-20 px-4">
      <div className="container mx-auto max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <Image
              src="/awakening-logo.png"
              alt="Awakening Logo"
              width={100}
              height={100}
              className="mx-auto mb-6"
            />
            <h1 className="text-2xl font-bold text-gray-900">
              {isSignIn ? 'Connexion' : 'Créer un compte'}
            </h1>
            <p className="text-gray-600 mt-2">
              {isSignIn ? 'Entrez vos informations pour vous connecter' : 'Remplissez le formulaire pour créer votre compte'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isSignIn && (
              <>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Nom
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#1FAD92] focus:outline-none focus:ring-1 focus:ring-[#1FAD92]"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="surname" className="block text-sm font-medium text-gray-700">
                    Prénom
                  </label>
                  <input
                    type="text"
                    id="surname"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#1FAD92] focus:outline-none focus:ring-1 focus:ring-[#1FAD92]"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Téléphone
                  </label>
                  <PhoneInput
                    country={'ci'}
                    value={phone}
                    onChange={phone => setPhone(phone)}
                    containerClass="mt-1"
                    inputClass="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#1FAD92] focus:outline-none focus:ring-1 focus:ring-[#1FAD92]"
                    buttonClass="rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#1FAD92] focus:outline-none focus:ring-1 focus:ring-[#1FAD92]"
                    dropdownClass="bg-white"
                    searchClass="mt-2 px-3 py-2"
                    enableSearch={true}
                    disableSearchIcon={false}
// PhoneInput component doesn't support the 'required' prop directly
// We'll need to handle validation elsewhere
                  />
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#1FAD92] focus:outline-none focus:ring-1 focus:ring-[#1FAD92]"
                placeholder="ex: john.doe@gmail.com"
                required
              />
            </div>

            {isSignIn && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Mot de passe
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#1FAD92] focus:outline-none focus:ring-1 focus:ring-[#1FAD92]"
                  required={isSignIn}
                />
              </div>
            )}

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1FAD92] text-white font-semibold py-3 px-8 rounded-full hover:bg-opacity-90 transition-all disabled:opacity-50"
            >
              {loading ? 'Chargement...' : (isSignIn ? 'Se connecter' : "S'inscrire")}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignIn(!isSignIn)}
              className="text-[#1FAD92] hover:underline"
            >
              {isSignIn ? 'Créer un compte' : 'Déjà un compte ? Se connecter'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import Image from 'next/image';

export default function FooterSection() {
  return (
    <footer className="bg-gray-900 text-white py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <Image
                src="/awakening-logo.png"
                alt="Awakening Logo"
                width={40}
                height={40}
                className="mr-2"
              />
              <h4 className="text-xl font-bold">Awakening</h4>
            </div>
            <p className="text-gray-400">Votre compagnon de vie intelligent</p>
          </div>
          <div>
            <h4 className="text-xl font-bold mb-4">Produit</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white">Fonctionnalités</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Tarifs</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xl font-bold mb-4">Entreprise</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white">À propos</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Contact</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Blog</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xl font-bold mb-4">Légal</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white">Confidentialité</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Conditions</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p className="text-gray-400">&copy; 2024 Awakening. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
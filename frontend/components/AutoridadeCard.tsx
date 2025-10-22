// frontend/components/AutoridadeCard.tsx
// Card para exibir autoridade (prefeito, vice-prefeito, vereador)

"use client";

import React from 'react';

interface AutoridadeCardProps {
  nome: string;
  cargo: string;
  partidoSigla?: string;
  partidoNome?: string;
  fotoUrl?: string;
  anoInicioMandato?: number;
  anoFimMandato?: number;
}

export default function AutoridadeCard({
  nome,
  cargo,
  partidoSigla,
  partidoNome,
  fotoUrl,
  anoInicioMandato,
  anoFimMandato,
}: AutoridadeCardProps) {
  const cargoLabel: Record<string, string> = {
    PREFEITO: 'Prefeito',
    VICE_PREFEITO: 'Vice-Prefeito',
    VEREADOR: 'Vereador',
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-4">
        {/* Foto */}
        <div className="flex-shrink-0">
          {fotoUrl ? (
            <img
              src={fotoUrl}
              alt={`Foto de ${nome}`}
              className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300">
              <svg 
                className="w-10 h-10 text-gray-400" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path 
                  fillRule="evenodd" 
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" 
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Informações */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{nome}</h3>
          <p className="text-sm text-gray-600 mb-1">
            {cargoLabel[cargo] || cargo}
          </p>
          
          {partidoSigla && (
            <div className="flex items-center gap-2 text-sm">
              <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded font-medium">
                {partidoSigla}
              </span>
              {partidoNome && (
                <span className="text-gray-500">{partidoNome}</span>
              )}
            </div>
          )}

          {(anoInicioMandato || anoFimMandato) && (
            <p className="text-xs text-gray-500 mt-2">
              Mandato: {anoInicioMandato || '?'} - {anoFimMandato || '?'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

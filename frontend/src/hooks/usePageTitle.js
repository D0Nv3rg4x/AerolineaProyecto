import { useEffect } from 'react';

export default function usePageTitle(title, description = 'Reserva tus vuelos al mejor precio con SkyNova. Tu próxima aventura comienza aquí.') {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title ? `${title} | SkyNova` : 'SkyNova | Tu aerolínea de confianza';

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    }

    return () => {
      document.title = prevTitle;
    };
  }, [title, description]);
}

# Dossier vidéos

Ce dossier doit contenir le fichier vidéo de démonstration pour la section "Aperçu d'un live".

## Fichier attendu

**`live-commerce-demo.mp4`** (MP4, H.264, ~5-10 MB recommandé)

- Utilisé dans : `src/sections/LivePreview.tsx` (const `LOCAL_VIDEO`)
- Fallback automatique vers Pexels si le fichier est absent ou illisible
- Vérifié par : `scripts/verify-dist.mjs` (échec si manquant dans `dist/`)

## Source suggérée

La vidéo originale provient de Pexels :
- URL : https://www.pexels.com/video/a-woman-fixing-smartphone-for-blogging-9384668/
- Auteur : Sasha Kim
- Télécharger la version SD (540p) ou HD (720p) selon le poids souhaité

## Alternative

Si vous ne souhaitez pas héberger la vidéo localement :
1. Supprimez la référence dans `src/sections/LivePreview.tsx` (ligne 10)
2. Ou modifiez `scripts/verify-dist.mjs` pour retirer `/videos/live-commerce-demo.mp4` de la liste `required` (ligne 34)
# Notes de version

## V0.6.1 — Une interface qui respire {#v061}

- Recherche documentaire avec champ large, rubriques, extraits lisibles et navigation au clavier.
- Fenêtres fermables avec le X en haut, Échap ou un clic à l’extérieur. Le bouton du bas disparaît.
- Marges des modules personnages réparées; commandes de disposition dans « Organiser ». Le sac Rapin conserve ses commandes pendant les mises à jour.
- Le monde, les personnages et la disposition personnalisée restent conservés.

## V0.6.0 — Le quartier prend la scène {#v060}

- Shows en direct avec quartier en pause, cartes détaillées, inspection et Sauter.
- Quatre dates continues, plusieurs créneaux, candidatures et sélection des grosses scènes.
- Réservations autonomes, engagement unique et moral temporaire des bands.
- Setlists multiples, bilans et historique par groupe.
- Groupes compacts, fiches modulaires, sac Rapin personnalisable et récupération unifiée.
- Griefs relationnels, rencontres de trajet et détente ensemble.
- Documentation par système, recherche dans le jeu et notes dans leur propre onglet.

## V0.5.1 — Préparer et observer {#v051}

Préparation accessible aux bands NPC, improvisation sans chanson, annulation et arrivées corrigées. Vitesse aimantée et sac Rapin observable. Scroll et focus stabilisés.

## V0.5.0 — Du garage à la scène {#v050}

Shows automatiques à cartes, foule physique, déchéance, projets de compositions et répertoire des bands.

<script setup>
import {onMounted,onUnmounted} from 'vue'
let observer
onMounted(()=>{const ids=['v061','v060','v051','v050'];let saved=[];try{const value=JSON.parse(localStorage.getItem('garage-vivant-read-notes')||'[]');if(Array.isArray(value))saved=value;}catch{}const read=new Set(saved);const target=ids.find(id=>!read.has(id));if(target&&!location.hash)document.getElementById(target)?.scrollIntoView();observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){const id=entry.target.id;setTimeout(()=>{if(document.visibilityState==='visible'&&entry.target.getBoundingClientRect().top<innerHeight&&entry.target.getBoundingClientRect().bottom>0){read.add(id);try{localStorage.setItem('garage-vivant-read-notes',JSON.stringify([...read]));}catch{}}},1500);}}, {threshold:1});for(const id of ids){const node=document.getElementById(id);if(node)observer.observe(node);}})
onUnmounted(()=>observer?.disconnect())
</script>

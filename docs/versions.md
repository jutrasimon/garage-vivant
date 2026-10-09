# Notes de version

## V0.6.3 — Tout le show dans le jeu {#v063}

- Le show occupe toute la largeur et la hauteur disponibles. Nom du groupe, chanson, progression, jauges et commandes sont intégrés à l’arène; aucun défilement extérieur nécessaire.
- Cartes de même taille, dans un emplacement fixe, y compris les erreurs et les combos. La taille ne change plus à la résolution de l’effet.
- La trajectoire relie la carte à la zone visée dans la foule, marquée avant l’impact. Musiciens, fans, decks et jauges sont agrandis.
- Lecture, pause, inspection, résultats et sauvegardes conservés sur ordinateur et téléphone.

## V0.6.2 — Les cartes prennent la scène {#v062}

- Scène aux proportions correctes, sans panneau latéral qui écrase le canvas.
- Decks individuels visibles et consultables; cartes pigées depuis leur pile, jouées au premier plan puis conservées dans une défausse consultable.
- Chansons de 30 secondes à ×1, avec départ explicite et cinq phrases. Les règles et tirages restent identiques à toutes les vitesses et au skip.
- Zones de groove, charges de crescendo/soutien, bonus de combo, gains locaux et réactions du public visibles. Sons distincts selon l’instrument et l’effet.
- Inspection des fans, musiciens, decks et cartes : pause temporaire et reprise dans l’état précédent, y compris après plusieurs inspections.
- Sauvegardes et historiques conservés; bilans attribués au band.

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
onMounted(()=>{const ids=['v063','v062','v061','v060','v051','v050'];let saved=[];try{const value=JSON.parse(localStorage.getItem('garage-vivant-read-notes')||'[]');if(Array.isArray(value))saved=value;}catch{}const read=new Set(saved);const target=ids.find(id=>!read.has(id));if(target&&!location.hash)document.getElementById(target)?.scrollIntoView();observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){const id=entry.target.id;setTimeout(()=>{if(document.visibilityState==='visible'&&entry.target.getBoundingClientRect().top<innerHeight&&entry.target.getBoundingClientRect().bottom>0){read.add(id);try{localStorage.setItem('garage-vivant-read-notes',JSON.stringify([...read]));}catch{}}},1500);}}, {threshold:1});for(const id of ids){const node=document.getElementById(id);if(node)observer.observe(node);}})
onUnmounted(()=>observer?.disconnect())
</script>

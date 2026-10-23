# agentDeep 🧠⚡

> **"Ton cerveau externe, sans filtre."**  
> Progressive Web App (PWA) de productivité personnelle, révision espacée FASEG et intelligence ENTP propulsée par l'API Gemini 2.0 Flash.

---

## 🌟 Points Forts

- **100% Hors-Ligne (Offline-First)** : Persistance locale intégrale via **IndexedDB** (`Dexie.js`). Toutes les fonctionnalités (tâches, matrice Eisenhower, cours, révisions, timer Pomodoro, calendrier) fonctionnent sans aucune connexion réseau.
- **Agent IA ENTP aux 6 Rôles** : Débatteur, énergique, challenger, drôle et bienveillant. Tutoiement systématique, phrases signatures, zéro liste à puces nigaude :
  1. ⚡ **Assistant Tâches** : Découpage chirurgical, traque de la procrastination.
  2. 📚 **Coach Études FASEG** : Recherche Opérationnelle (Simplexe, dualité), Comptabilité, Microéconomie, Statistiques, Droit des Affaires (OHADA), Marketing. Révision par questionnement socratique.
  3. 🎯 **Gestionnaire de Projets** : Découpage en sprints de 1-2h max.
  4. 🧠 **Coach Développement Personnel** : Anti-procrastination, micro-rituels (5-10 min), lucidité sans complaisance.
  5. 🎤 **Coach Élocution & Prise de Parole** : Préparation de soutenances, pitchs de 3 min, articulation et impact.
  6. 💼 **Expert en Modèles Économiques** : Freemium, abonnements, marché ouest-africain (Mobile Money) & international, pricing testable en 30 jours.
- **Mode Examen (Prof. agentDeep)** : Compte à rebours J-X, 60% du temps en révision pour les cours avec maîtrise < 70%, 1h obligatoire préservée pour les projets.
- **Répétition Espacée Scientifique** : Algorithme J+1, J+3, J+7, J+14, J+30 avec adaptation automatique selon la note de maîtrise.
- **Matrice Eisenhower 4 Quadrants** : Visuelle, réactive avec drag-and-drop et micro-interactions festives (confettis à la validation).
- **Timer Pomodoro 25/5 Circulaire** : Notification sonore/visuelle en fin de cycle.
- **Reconnaissance Vocale (Web Speech API)** : Déclenchée via le FAB micro central pour créer instantanément des tâches ou créneaux d'étude.
- **PWA Conforme Android & iOS** : Installable sur écran d'accueil avec Service Worker et précache Workbox.

---

## 🚀 Démarrage Rapide

### 1. Installation des dépendances
```bash
npm install
```

### 2. Configuration de la clé API Gemini
Pour utiliser l'intelligence conversationnelle en ligne :
1. Rends-toi sur [Google AI Studio](https://aistudio.google.com/apikey).
2. Clique sur **"Get API key"** ou **"Create API Key"**.
3. Copie ta clé (`AIzaSy...`).
4. Dans l'application, rends-toi dans l'écran **Paramètres** (icône engrenage en haut à droite) et colle ta clé. Elle sera chiffrée avec **AES-GCM (Web Crypto API)** directement sur ton appareil.
*(Note : En environnement AI Studio, la clé est automatiquement injectée côté serveur via la variable d'environnement `GEMINI_API_KEY`).*

### 3. Lancer en développement
```bash
npm run dev
```
L'application démarre sur [http://localhost:3000](http://localhost:3000).

### 4. Build de production
```bash
npm run build
npm start
```

---

## 📱 Installation sur Android (Google Chrome)

1. Ouvre l'URL de l'application dans **Google Chrome** sur ton smartphone Android.
2. Un bandeau violet **"Installer agentDeep sur Android"** s'affiche en haut de l'écran. Clique sur **Installer**.
3. Si le bandeau ne s'affiche pas immédiatement :
   - Clique sur les **3 points verticaux** (menu Chrome en haut à droite).
   - Sélectionne **"Ajouter à l'écran d'accueil"** ou **"Installer l'application"**.
4. L'icône néon **agentDeep** apparaît sur ton écran d'accueil Android et s'ouvre en plein écran sans barre d'adresse de navigateur.

---

## 📦 Optionnel : Créer un APK Android avec Capacitor

Pour publier agentDeep sur le Google Play Store ou générer un fichier `.apk` natif :

```bash
# 1. Installer Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android

# 2. Initialiser Capacitor
npx cap init agentDeep com.tokpa.agentdeep --web-dir dist

# 3. Construire le bundle web
npm run build

# 4. Ajouter la plateforme Android
npx cap add android

# 5. Synchroniser et ouvrir dans Android Studio
npx cap sync
npx cap open android
```
Dans Android Studio, fais **Build > Build Bundle(s) / APK(s) > Build APK(s)** pour obtenir ton fichier `.apk`.

---

## 🛡️ Sécurité & Données Privées

- Toutes les données de cours, devoirs et messages sont stockées dans **IndexedDB** sur votre terminal.
- La clé API Gemini saisie dans l'interface est chiffrée par **AES-GCM (PBKDF2 100 000 itérations)**.
- Export complet de votre base de données en JSON à tout moment depuis les Paramètres.

---

*Développé pour Tokpa · FASEG & Productivité Avancée.*

const I18N = {
  en: {
    appName: 'Habit Tracker',
    weekdays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    months: ['January','February','March','April','May','June','July','August','September','October','November','December'],
    year: 'Year', month: 'Month', today: 'Today',
    manage: 'Manage habits', report: 'Report', logout: 'Log out', back: 'Back to tracker',
    login: 'Log in', signup: 'Sign up', email: 'Email', password: 'Password',
    name: 'Name', birthday: 'Birthday (optional)',
    noHabits: 'No habits for this month yet.',
    copyPrev: 'Copy habits from previous month',
    copied: 'habits copied', nothingToCopy: 'Nothing new to copy.',
    streak: 'Streak', best: 'Best', done: 'Done',
    addHabit: 'Add habit', title: 'Title', category: 'Category', noCategory: 'No category',
    addCategory: 'Add category', save: 'Save', delete: 'Delete', archive: 'Archive', unarchive: 'Restore',
    confirmDelete: 'Delete this habit for this month only?',
    futureLocked: 'This day is in the future.',
    verifySent: 'Check your inbox for a confirmation link.',
    verified: 'Email confirmed. You can log in now.',
    badCredentials: 'Wrong email or password.',
    genericError: 'Something went wrong. Please try again.',
    theme: 'Switch light / dark mode',
    currentStreak: 'Current streak',
    longestStreak: 'Longest',
    completion: 'Completion',
    notVerified: 'Please confirm your email first.',
    emailTaken: 'That email is already registered.',
    weakPassword: 'Password must be at least 8 characters.',
    haveAccount: 'Already have an account?', noAccount: 'No account yet?',
    reportTitle: 'Monthly report', overall: 'Overall completion',
    bestHabit: 'Best habit', weakestHabit: 'Needs attention',
    neverDone: 'Never done this month', bestStreak: 'Longest streak',
    strongestDay: 'Strongest weekday', weakestDay: 'Weakest weekday',
    mostImproved: 'Most improved', mostDeclined: 'Biggest drop',
    vsPrevious: 'vs previous month', categories: 'By category',
    history: 'History', days: 'days', habitsWord: 'habits', checkIns: 'check-ins',
    archived: 'Archived', none: 'None',
  },
  fr: {
    appName: 'Suivi d’habitudes',
    weekdays: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'],
    months: ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'],
    year: 'Année', month: 'Mois', today: 'Aujourd’hui',
    manage: 'Gérer les habitudes', report: 'Bilan', logout: 'Déconnexion', back: 'Retour au suivi',
    login: 'Connexion', signup: 'Inscription', email: 'E-mail', password: 'Mot de passe',
    name: 'Nom', birthday: 'Date de naissance (facultatif)',
    noHabits: 'Aucune habitude pour ce mois.',
    copyPrev: 'Copier les habitudes du mois précédent',
    copied: 'habitudes copiées', nothingToCopy: 'Rien de nouveau à copier.',
    streak: 'Série', best: 'Record', done: 'Fait',
    addHabit: 'Ajouter une habitude', title: 'Titre', category: 'Catégorie', noCategory: 'Sans catégorie',
    addCategory: 'Ajouter une catégorie', save: 'Enregistrer', delete: 'Supprimer', archive: 'Archiver', unarchive: 'Restaurer',
    confirmDelete: 'Supprimer cette habitude pour ce mois uniquement ?',
    futureLocked: 'Ce jour est dans le futur.',
    verifySent: 'Vérifiez votre boîte mail : un lien de confirmation vous attend.',
    verified: 'E-mail confirmé. Vous pouvez vous connecter.',
    badCredentials: 'E-mail ou mot de passe incorrect.',
    genericError: 'Une erreur est survenue. Réessayez.',
    theme: 'Basculer mode clair / sombre',
    currentStreak: 'Série actuelle',
    longestStreak: 'Record',
    completion: 'Complétion',
    notVerified: 'Veuillez d’abord confirmer votre e-mail.',
    emailTaken: 'Cet e-mail est déjà utilisé.',
    weakPassword: 'Le mot de passe doit contenir au moins 8 caractères.',
    haveAccount: 'Déjà un compte ?', noAccount: 'Pas encore de compte ?',
    reportTitle: 'Bilan mensuel', overall: 'Taux global',
    bestHabit: 'Meilleure habitude', weakestHabit: 'À surveiller',
    neverDone: 'Jamais faites ce mois-ci', bestStreak: 'Plus longue série',
    strongestDay: 'Jour le plus fort', weakestDay: 'Jour le plus faible',
    mostImproved: 'Plus forte progression', mostDeclined: 'Plus forte baisse',
    vsPrevious: 'par rapport au mois précédent', categories: 'Par catégorie',
    history: 'Historique', days: 'jours', habitsWord: 'habitudes', checkIns: 'validations',
    archived: 'Archivées', none: 'Aucune',
  },
};

let currentLang = localStorage.getItem('lang') || (navigator.language.startsWith('fr') ? 'fr' : 'en');

function t(key) { return I18N[currentLang][key] ?? I18N.en[key] ?? key; }

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  fetch('/api/language', {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ language: lang }),
  }).catch(() => {});
  location.reload();
}

// Fill any element with data-i18n="key" and placeholders with data-i18n-ph="key"
function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => el.textContent = t(el.dataset.i18n));
  document.querySelectorAll('[data-i18n-ph]').forEach(el => el.placeholder = t(el.dataset.i18nPh));
  document.documentElement.lang = currentLang;
}

function langSwitcherHtml() {
  return '<select id="lang" onchange="setLang(this.value)">' +
    '<option value="en"' + (currentLang === 'en' ? ' selected' : '') + '>English</option>' +
    '<option value="fr"' + (currentLang === 'fr' ? ' selected' : '') + '>Français</option></select>';
}
